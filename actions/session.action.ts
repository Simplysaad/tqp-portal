"use server";

import Session, { IMemorizationRange, INuruAlBayanRange, PerformanceRating } from "@/models/session.model";
import Schedule, { IScheduleDocument, DayOfWeek } from "@/models/schedule.model";
import { revalidatePath } from "next/cache";
import TutorGroup from "@/models/tutorGroup.model";
import connectDB from "@/lib/db";
import { Types } from "mongoose";
import Goal from "@/models/goal.model";
import { calculateMemorizationProgress } from "@/lib/quran";
import Student from "@/models/student.model";
import { IStudentLogPayload, ITutorVerifyPayload } from "@/types";



const DAYS_OF_WEEK: DayOfWeek[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
];

/**
 * Checks if a schedule is within the current time window.
 * If status === 'active' but isOpen === false while in range, it updates `isOpen = true` in DB.
 * If out of range, it ensures `isOpen = false` in DB.
 * 
 * @param schedule IScheduleDocument | string - The schedule document or schedule ID
 * @returns Promise<boolean> - True if the class is currently open and active
 */

export async function isScheduleOpen(schedule: IScheduleDocument | string): Promise<boolean> {
    let doc: IScheduleDocument | null = null;

    if (typeof schedule === "string") {
        doc = await Schedule.findById(schedule);
    } else {
        doc = schedule;
    }

    if (!doc) return false;

    const now = new Date();
    const currentDay = DAYS_OF_WEEK[now.getDay()];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // 1. Check if schedule matches current day and time bounds
    const isDayMatching = doc.dayOfWeek?.toLowerCase() === currentDay;
    const isTimeInRange = currentMinutes >= doc.startTime && currentMinutes <= doc.endTime;
    const isCurrentlyInWindow = isDayMatching && isTimeInRange;

    // 2. Schedule must be in 'active' status to be considered open
    const shouldBeOpen = doc.status === "active" && isCurrentlyInWindow;

    // 3. Auto-sync database if actual calculated state differs from `doc.isOpen`
    if (doc.isOpen !== shouldBeOpen) {
        doc.isOpen = shouldBeOpen;

        // Save or update atomically
        if (typeof doc.save === "function") {
            await doc.save();
        } else {
            await Schedule.findByIdAndUpdate(doc._id, { isOpen: shouldBeOpen });
        }
    }

    return shouldBeOpen;
}


/**
 * 1. STUDENT ACTION: Click Pseudo Link
 * Either creates a new session marked as "present" or increments clickCount on existing today's session.
 * 
 * params _ tutorGroupId, studentId
 * check if student is among the tutorGroup.students
 * check if any schedule is currently active
 * create a session with currentActiveSheduleId
 */



export async function joinSessionViaLink(tutorGroupId: string | Types.ObjectId, studentId: string | Types.ObjectId) {
    try {
        await connectDB();

        // 1. Fetch group and populated schedules
        const tutorGroup = await TutorGroup.findOne({ _id: tutorGroupId, isActive: true }).populate("schedules");

        if (!tutorGroup) {
            return { success: false, error: "Tutor group not found or inactive." };
        }

        // 2. Validate student membership
        const isStudentEnrolled = tutorGroup.students.some((s) => s.toString() === studentId);
        if (!isStudentEnrolled) {
            return { success: false, error: "You are not enrolled in this tutor group." };
        }

        // 3. Find active schedule using Promise.all/async filter pattern
        let activeSchedule: IScheduleDocument | null = null;

        if (Array.isArray(tutorGroup.schedules) && tutorGroup.schedules.length > 0) {
            const scheduleStatuses = await Promise.all(
                tutorGroup.schedules.map(async (sched: any) => {
                    const isOpen = await isScheduleOpen(sched);
                    return { sched, isOpen };
                })
            );

            const found = scheduleStatuses.find((item) => item.isOpen);
            if (found) {
                activeSchedule = found.sched as IScheduleDocument;
            }
        }

        if (!activeSchedule) {
            return { success: false, error: "No class schedule is currently open or active." };
        }

        // 4. Normalize date to start of current day UTC
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        // 5. Atomic Upsert or Save
        let session = await Session.findOne({
            schedule: activeSchedule._id,
            student: studentId,
            date: today,
        });

        if (session) {
            session.clickCount = (session.clickCount || 0) + 1;
            session.attendance = "present";
            session.joinedAt = session.joinedAt || new Date();
            await session.save();
        } else {
            session = await Session.create({
                schedule: activeSchedule._id,
                student: studentId,
                tutor: activeSchedule.tutor,
                date: today,
                startTime: activeSchedule.startTime,
                endTime: activeSchedule.endTime,
                isLinkActive: true,
                joinedAt: new Date(),
                clickCount: 1,
                attendance: "present",
            });

            // Maintain reference in tutorGroup sessions array
            if (tutorGroup.sessions) {
                tutorGroup.sessions.push(session._id);
                await tutorGroup.save();
            }
        }

        let tutorGroupSessionsSet = new Set(tutorGroup.sessions)
        tutorGroupSessionsSet.add(session._id)

        tutorGroup.sessions = Array.from(tutorGroupSessionsSet)
        await tutorGroup.save();

        return {
            success: true,
            sessionId: session._id.toString(),
            redirectUrl: activeSchedule.googleMeetLink || null,
        };
    } catch (error: any) {
        console.error("Error joining session via link:", error);
        return {
            success: false,
            error: error.message || "Failed to join session",
        };
    }
}



// export function calculateMemorizationProgress(
//     startPage?: number,
//     currentPage?: number,
//     targetPage?: number
// ): number {
//     if (!startPage || !currentPage || !targetPage) return 0;
//     if (targetPage <= startPage) return 100;

//     const completed = currentPage - startPage;
//     const total = targetPage - startPage;

//     if (total <= 0) return 0;

//     const percentage = (completed / total) * 100;
//     return Math.min(100, Math.max(0, Math.round(percentage)));
// }

/**
 * Shared Helper: Updates active goal progress percentage, goal current position,
 * and the student's global currentMemorization profile checkpoint.
 */
async function updateStudentGoalAndProgress(
    studentId: string,
    newMemorization?: IMemorizationRange
) {
    if (!newMemorization?.end?.page) return;

    const currentPage = newMemorization.end.page;
    const activeGoal = await Goal.findOne({ student: studentId, status: "in_progress" });

    if (activeGoal) {
        const startPage = activeGoal.start?.page;
        const targetPage = activeGoal.target?.page;

        const progressPercentage = calculateMemorizationProgress(
            Number(startPage),
            Number(currentPage),
            Number(targetPage)
        );

        activeGoal.progressPercentage = progressPercentage;

        activeGoal.current = {
            ...activeGoal.current,
            surah: newMemorization.end.surah || activeGoal.current?.surah || "",
            aayah: newMemorization.end.aayah || activeGoal.current?.aayah || 0,
            juz: newMemorization.end.juz || activeGoal.current?.juz || 0,
            page: currentPage,
        };

        if (progressPercentage >= 100) {
            activeGoal.status = "completed";
        }

        await activeGoal.save();
    }

    // Sync student profile's current checkpoint
    await Student.findByIdAndUpdate(studentId, {
        $set: {
            "currentMemorization.surah": newMemorization.end.surah,
            "currentMemorization.aayah": newMemorization.end.aayah,
            "currentMemorization.juz": newMemorization.end.juz,
            "currentMemorization.page": currentPage,
        },
    });
}

/**
 * 2. STUDENT ACTION: Log Progress After Class
 */
export async function logStudentProgress(payload: IStudentLogPayload) {
    try {
        await connectDB();
        const { sessionId, studentId, newMemorization, revision } = payload;

        const session = await Session.findOne({ _id: sessionId, student: studentId });
        if (!session) {
            return { success: false, error: "Session record not found or unauthorized" };
        }


        if (newMemorization) session.newMemorization = newMemorization;
        // if (revision) session.revision = revision;
        await session.save();

        // Sync active goal and student profile position
        // await updateStudentGoalAndProgress(studentId, newMemorization);

        revalidatePath("/dashboard");
        revalidatePath(`/dashboard/sessions/${sessionId}`);

        return { success: true, message: "Progress logged successfully" };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to log progress" };
    }
}

/**
 * 3. TUTOR ACTION: Verify, Edit, or Approve Session
 */
export async function verifyAndCompleteSession(payload: ITutorVerifyPayload) {
    try {
        await connectDB();
        const {
            sessionId,
            tutorId,
            attendance,
            performance,
            tutorsComment,
            newMemorization,
            revision,
        } = payload;

        const session = await Session.findOne({ _id: sessionId, tutor: tutorId });
        if (!session) {
            return { success: false, error: "Session record not found or unauthorized" };
        }

        session.attendance = attendance;
        if (performance) session.performance = performance;
        if (tutorsComment !== undefined) session.tutorsComment = tutorsComment;
        if (newMemorization) session.newMemorization = newMemorization;
        // if (revision) session.revision = revision;
        session.approved = true;

        await session.save();

        // Sync active goal and student profile position (if adjusted or approved by tutor)
        const studentId = session.student.toString();
        await updateStudentGoalAndProgress(studentId, session.newMemorization);

        revalidatePath("/dashboard");
        revalidatePath(`/dashboard/sessions/${sessionId}`);

        return { success: true, message: "Session verified and saved" };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to verify session" };
    }
}


import { getStudent } from "@/lib/db"

export async function fetchStudentAction(studentId: string) {
    try {
        const student = await getStudent(studentId)
        // Convert Mongoose document to plain JavaScript object so it can cross the server-client boundary
        return JSON.parse(JSON.stringify(student))
    } catch (error) {
        console.error(error)
        return null
    }
}


export async function calculateBeginnerProgress(
    startIndex: number,
    currentIndex: number,
    targetIndex: number
) {
    if (targetIndex <= startIndex) return 100;

    const totalSteps = targetIndex - startIndex;
    const completedSteps = currentIndex - startIndex;

    const percentage = Math.round((completedSteps / totalSteps) * 100);

    // Ensure percentage stays between 0 and 100
    return Math.min(Math.max(percentage, 0), 100);
}

export async function logBeginnerStudentProgress(payload: {
    sessionId: string;
    studentId: string;
    newPosition?: INuruAlBayanRange;
    notes?: string;
}) {
    try {
        await connectDB();
        const { sessionId, studentId, newPosition, notes } = payload;

        const session = await Session.findOne({ _id: sessionId, student: studentId });
        if (!session) {
            return { success: false, error: "Session record not found or unauthorized" };
        }

        let update: any = {}
        if (newPosition) {
            // Clean up missing numeric fields so they don't break min: 1 / min: 0 constraints
            const formattedPosition: INuruAlBayanRange = {
                start: newPosition.start ? {
                    chapter: newPosition.start.chapter || "",
                    section: newPosition.start.section || "",
                    page: Number(newPosition.start.page) || 1,
                    index: Number(newPosition.start.index) || 0,
                } : undefined,
                end: newPosition.end ? {
                    chapter: newPosition.end.chapter || "",
                    section: newPosition.end.section || "",
                    page: Number(newPosition.end.page) || 1,
                    index: Number(newPosition.end.index) || 0,
                } : undefined,
            };

            update.newPosition = formattedPosition


            // session.newPosition = formattedPosition;
            // session.markModified("newPosition");
        }

        if (notes) {
            update.tutorsComment = notes;
        }




        update = {
            start: {
                chapter: 'الحروف الهجائية (Arabic Alphabet - Names & Shapes)',
                section: 'المقدمة (Introduction & Alphabet)',
                page: 2,
                index: 1
            },
            end: {
                chapter: 'حركة الفتح (Fathah)',
                section: 'الوحدة الأولى: الحركات Short Vowels (Harakat)',
                page: 4,
                index: 2
            }
        }


        const updatedSession = await Session.findOneAndUpdate({ _id: session._id }, {
            $set: update
        }, { returnDocument: "after" })

        console.log("update", update)
        console.log("updatedSession", updatedSession)

        // await session.save();

        revalidatePath("/dashboard");
        revalidatePath(`/dashboard/sessions/${sessionId}`);

        return { success: true, message: "Beginner progress logged successfully" };
    } catch (error: any) {
        console.error("Error saving session progress:", error);
        return { success: false, error: error.message || "Failed to log progress" };
    }
}

async function updateBeginnerGoalAndProgress(
    studentId: string,
    newPosition?: INuruAlBayanRange
) {
    if (!newPosition?.end?.index) return;

    const currentEnd = newPosition.end;
    const currentIndex = currentEnd.index;

    // 1. Update Active Nuru Al-Bayan Goal
    const activeGoal = await Goal.findOne({
        student: studentId,
        type: "nuru_al_bayan",
        status: "in_progress",
    });

    if (activeGoal) {
        const startIndex = activeGoal.startPosition?.index || 1;
        const targetIndex = activeGoal.targetPosition?.index || 1;

        const progressPercentage = await calculateBeginnerProgress(
            Number(startIndex),
            Number(currentIndex),
            Number(targetIndex)
        );

        activeGoal.progressPercentage = progressPercentage;
        activeGoal.currentPosition = {
            index: currentEnd.index,
            chapter: currentEnd.chapter,
            section: currentEnd.section,
            page: currentEnd.page,
        };

        if (progressPercentage >= 100) {
            activeGoal.status = "completed";
        }

        await activeGoal.save();
    }

    // 2. Sync Student Profile Position
    await Student.findByIdAndUpdate(studentId, {
        $set: {
            "currentPosition.index": currentEnd.index,
            "currentPosition.chapter": currentEnd.chapter,
            "currentPosition.section": currentEnd.section,
            "currentPosition.page": currentEnd.page,
        },
    });
}

export async function updateAndVerifyBeginnerSession(payload: {
    sessionId: string;
    tutorId: string;
    newPosition?: INuruAlBayanRange;
    performanceRating?: PerformanceRating;
    tutorFeedback?: string;
    status?: "completed" | "cancelled";
}) {
    try {
        await connectDB();
        const {
            sessionId,
            tutorId,
            newPosition,
            performanceRating,
            tutorFeedback,
            status,
        } = payload;

        const session = await Session.findOne({ _id: sessionId, tutor: tutorId });
        if (!session) {
            return { success: false, error: "Session not found or unauthorized tutor" };
        }

        // Update Session Fields
        if (newPosition) session.newPosition = newPosition;
        if (performanceRating) session.performance = performanceRating;
        if (tutorFeedback) session.tutorsComment = tutorFeedback;
        // if (status) session.status = status;

        await session.save();

        // If newPosition was confirmed or edited, sync the student's goal & current profile position
        if (newPosition) {
            await updateBeginnerGoalAndProgress(session.student.toString(), newPosition);
        }

        revalidatePath("/dashboard");
        revalidatePath(`/dashboard/sessions/${sessionId}`);

        return {
            success: true,
            message: "Session progress updated and verified successfully",
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || "Failed to update session progress",
        };
    }
}


