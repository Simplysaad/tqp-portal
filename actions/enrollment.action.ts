"use server";

import connectDB from "@/lib/db";
import Schedule from "@/models/schedule.model";
import Student from "@/models/student.model";
import Tutor from "@/models/tutor.model";
import { getSession } from "@/actions/user.action";
import { revalidatePath } from "next/cache";
import Types from "mongoose";
import TutorGroup from "@/models/tutorGroup.model";



export async function enrollWithTutor(tutorId: string) {
    try {
        const currentUser = await getSession();

        if (!currentUser) {
            return {
                success: false,
                error: "UNAUTHENTICATED",
                redirectTo: `/login?next=${encodeURIComponent(`/enroll?tutor_id=${tutorId}`)}`,
            };
        }

        if (currentUser.role !== "student") {
            return { success: false, error: "Only students can enroll with a tutor." };
        }

        if (!tutorId) {
            return { success: false, error: "Invalid tutor ID provided." };
        }

        await connectDB();

        // 1. Fetch Student profile & Tutor Group concurrently
        const [student, tutorGroup] = await Promise.all([
            Student.findOne({ user: currentUser.id }),
            TutorGroup.findOne({ tutor: tutorId, isActive: true }),
        ]);

        if (!student) {
            return { success: false, error: "Student profile not found." };
        }

        if (!tutorGroup) {
            return {
                success: false,
                error: "This tutor does not have an active group available for enrollment.",
            };
        }

        const studentId = student._id;

        // 2. Prevent multi-group enrollments across all active groups
        const existingEnrollment = await TutorGroup.findOne({
            students: studentId,
            isActive: true,
        });

        if (existingEnrollment) {
            if (existingEnrollment.tutor.toString() === tutorId) {
                return {
                    success: false,
                    error: "You are already enrolled with this tutor.",
                };
            }
            return {
                success: false,
                error: "You are already enrolled in another group. Unenroll first to change tutors.",
            };
        }

        // 3. Rule Check: Maximum Capacity
        const currentCount = tutorGroup.students.length;
        const maxCapacity = tutorGroup.rules?.maxCapacity ?? 5;

        if (currentCount >= maxCapacity) {
            return {
                success: false,
                error: "This tutor's group has reached its maximum capacity.",
            };
        }

        // 4. Rule Check: Gender Restriction (Female Only)
        if (tutorGroup.rules?.femaleOnly) {
            const isFemale = student.gender?.toLowerCase() === "female";
            if (!isFemale) {
                return {
                    success: false,
                    error: "This group is restricted to female students only.",
                };
            }
        }

        // 5. Rule Check: Memorization Range Compliance
        const groupRange = tutorGroup.rules?.memorizationRange;
        const studentJuz = student.currentMemorization?.juz;

        if (groupRange?.start?.juz && groupRange?.end?.juz && studentJuz) {
            const minJuz = Math.min(groupRange.start.juz, groupRange.end.juz);
            const maxJuz = Math.max(groupRange.start.juz, groupRange.end.juz);

            if (studentJuz < minJuz || studentJuz > maxJuz) {
                return {
                    success: false,
                    error: `Your memorization level (Juz ${studentJuz}) falls outside this group's required range (Juz ${minJuz}–${maxJuz}).`,
                };
            }
        }

        // 6. Atomic Assignment (Prevents concurrency race conditions)
        const updatedGroup = await TutorGroup.findOneAndUpdate(
            {
                _id: tutorGroup._id,
                students: { $ne: studentId },
                $expr: { $lt: [{ $size: "$students" }, maxCapacity] },
            },
            {
                $addToSet: { students: studentId },
            },
            { new: true }
        );

        if (!updatedGroup) {
            return {
                success: false,
                error: "Enrollment failed due to a concurrent update or full group capacity.",
            };
        }

        // 7. Update Student record to point to this tutor
        await Student.updateOne(
            { _id: studentId },
            { $set: { tutor: tutorId } }
        );

        // 8. Revalidate student & schedule routes
        revalidatePath("/dashboard");
        revalidatePath("/schedules");

        return {
            success: true,
            message: "Successfully enrolled! You have inherited all of this tutor's schedules.",
        };
    } catch (error: any) {
        console.error("Enrollment failed:", error);
        return {
            success: false,
            error: error.message || "An unexpected error occurred during enrollment.",
        };
    }
}

export async function getTutorStudents(userId: string) {
    try {
        await connectDB();

        const tutor = await Tutor.findOne({ user: userId }).lean();
        if (!tutor) return { success: false, students: [], message: "Tutor profile not found" };

        // Fetch active schedule group and populate student details (including whatsappNumber)
        const tutorGroup = await TutorGroup.findOne({ tutor: tutor._id, isActive: true })
            .populate({
                path: "students",
                populate: {
                    path: "user",
                    select: "name email whatsappNumber", // Added whatsappNumber here
                },
            })
            .lean();

        if (!tutorGroup || !tutorGroup.students) {
            return { success: true, students: [] };
        }

        // Map populated student records cleanly
        const students = tutorGroup.students.map((st: any) => {
            const user = st.user || {};
            return {
                _id: st._id ? st._id.toString() : "",
                fullName: user.name || "Enrolled Student",
                email: user.email || "N/A",
                whatsappNumber: user.whatsappNumber || "N/A",
            };
        });

        return {
            success: true,
            students,
        };
    } catch (error) {
        console.error("Failed to fetch tutor students:", error);
        return {
            success: false,
            students: [],
            error: "An unexpected error occurred while fetching students.",
        };
    }
}