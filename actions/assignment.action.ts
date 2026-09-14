"use server";

import connectDB from "@/lib/db";
import Student, { IStudent } from "@/models/student.model";
import TutorGroup from "@/models/tutorGroup.model";
import { IUser } from "@/models/user.model";
import { revalidatePath } from "next/cache";

export interface ActionResult {
    success: boolean;
    message: string;
}


export interface StudentAssignmentResult {
    studentId: string;
    assigned: boolean;
    reason?: string;
}

export interface BulkActionResult {
    success: boolean;
    message: string;
    summary: {
        totalRequested: number;
        assignedCount: number;
        failedCount: number;
        results: StudentAssignmentResult[];
    };
}

export interface AutoAssignStudentResult {
    studentId: string;
    studentName?: string;
    assigned: boolean;
    assignedGroupId?: string;
    reason?: string;
}

export interface AutoAssignActionResult {
    success: boolean;
    message: string;
    summary: {
        totalRequested: number;
        assignedCount: number;
        unassignedCount: number;
        results: AutoAssignStudentResult[];
    };
}


export async function assignStudentToTutor(
    studentId: string,
    tutorGroupId: string
): Promise<ActionResult> {



    /**
        * Get the tutorGroup
        * Get the student
        * Check if the tutorGroup.students.length < tutorGroup.rules.maxCapacity 
        * if tutorGroup.rules.femaleOnly; check if student.gender === female
        * if tutorGroup.rules.memorizationRange; check if student.currentMemorization.start < tutorGroup.rules.memorizationRange.start &&
        * student.currentMemorization.end > tutorGroup.rules.memorizationRange.end 
        * 
        * if all the rules pass, the student is assigned to the tutor, otherwise, return an error;
    */



    try {
        await connectDB();

        // 1. Fetch both resources in parallel
        const [tutorGroup, student] = await Promise.all([
            TutorGroup.findById(tutorGroupId),
            Student.findById(studentId),
        ]);

        if (!tutorGroup) {
            return { success: false, message: "Tutor group not found." };
        }

        if (!tutorGroup.isActive) {
            return { success: false, message: "This tutor group is currently inactive." };
        }

        if (!student) {
            return { success: false, message: "Student record not found." };
        }

        // 2. Check if student is already in this group
        const isAlreadyAssigned = tutorGroup.students.some(
            (id) => id.toString() === studentId
        );
        if (isAlreadyAssigned) {
            return { success: false, message: "Student is already assigned to this group." };
        }

        // 3. Rule Check: Maximum Capacity
        const currentCount = tutorGroup.students.length;
        const maxCapacity = tutorGroup.rules?.maxCapacity ?? 5;

        if (currentCount >= maxCapacity) {
            return {
                success: false,
                message: `Group capacity limit reached (${currentCount}/${maxCapacity}).`,
            };
        }

        // 4. Rule Check: Gender Restriction (Female Only)
        if (tutorGroup.rules?.femaleOnly) {
            const isFemale = student.gender?.toLowerCase() === "female";
            if (!isFemale) {
                return {
                    success: false,
                    message: "Validation failed: This group is restricted to female students only.",
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
                    message: `Validation failed: Student's memorization level (Juz ${studentJuz}) falls outside the group's range (Juz ${minJuz}–${maxJuz}).`,
                };
            }
        }

        // 6. Atomic Assignment (Prevents concurrency race conditions)
        const updatedGroup = await TutorGroup.findOneAndUpdate(
            {
                _id: tutorGroupId,
                students: { $ne: studentId }, // Ensure student wasn't added concurrently
                $expr: { $lt: [{ $size: "$students" }, maxCapacity] }, // Re-verify capacity atomically
            },
            {
                $addToSet: { students: studentId },
            },
            { new: true }
        );

        if (!updatedGroup) {
            return {
                success: false,
                message: "Assignment failed due to a concurrent update or capacity cap reached.",
            };
        }

        // 7. Revalidate dashboard routes
        revalidatePath("/admin/dashboard");
        revalidatePath("/admin/assignments");

        return {
            success: true,
            message: "Student successfully assigned to tutor group.",
        };
    } catch (error: any) {
        console.error("Error in assignStudentToTutor:", error);
        return {
            success: false,
            message: error.message || "An unexpected error occurred during assignment.",
        };
    }
}

export async function assignStudentsToTutor(
    studentIds: string[],
    tutorGroupId: string
): Promise<BulkActionResult> {
    try {
        await connectDB();

        // 1. Validate inputs
        if (!studentIds || studentIds.length === 0) {
            return {
                success: false,
                message: "No student IDs provided for assignment.",
                summary: { totalRequested: 0, assignedCount: 0, failedCount: 0, results: [] },
            };
        }

        // 2. Fetch the TutorGroup
        const tutorGroup = await TutorGroup.findById(tutorGroupId);

        if (!tutorGroup) {
            return {
                success: false,
                message: "Tutor group not found.",
                summary: { totalRequested: studentIds.length, assignedCount: 0, failedCount: studentIds.length, results: [] },
            };
        }

        if (!tutorGroup.isActive) {
            return {
                success: false,
                message: "This tutor group is currently inactive.",
                summary: { totalRequested: studentIds.length, assignedCount: 0, failedCount: studentIds.length, results: [] },
            };
        }

        const rules = tutorGroup.rules;
        const maxCapacity = rules?.maxCapacity ?? 5;
        const isFemaleOnly = rules?.femaleOnly ?? false;
        const groupRange = rules?.memorizationRange;

        // Track currently assigned student IDs in memory
        const currentlyAssignedIds = new Set<string>(
            tutorGroup.students.map((id) => id.toString())
        );

        // EARLY EXIT OPTIMIZATION: Check capacity before making any DB calls for students
        if (currentlyAssignedIds.size >= maxCapacity) {
            return {
                success: false,
                message: `Group is already at full capacity (${currentlyAssignedIds.size}/${maxCapacity}).`,
                summary: {
                    totalRequested: studentIds.length,
                    assignedCount: 0,
                    failedCount: studentIds.length,
                    results: studentIds.map((id) => ({
                        studentId: id,
                        assigned: false,
                        reason: `Group is already full (${currentlyAssignedIds.size}/${maxCapacity}).`,
                    })),
                },
            };
        }

        // 3. Batch fetch candidate students
        const students = await Student.find({ _id: { $in: studentIds } }).lean();

        const studentMap = new Map<string, any>(
            students.map((std: any) => [std._id.toString(), std])
        );

        const assignmentResults: StudentAssignmentResult[] = [];
        let assignedCount = 0;

        // 4. Sequential assignment loop
        for (let i = 0; i < studentIds.length; i++) {
            const studentId = studentIds[i];

            // OPTIMIZATION: Stop loop immediately when group is full
            if (currentlyAssignedIds.size >= maxCapacity) {
                // Mark all remaining unprocessed students as capacity reached
                for (let j = i; j < studentIds.length; j++) {
                    assignmentResults.push({
                        studentId: studentIds[j],
                        assigned: false,
                        reason: `Group reached max capacity limit (${currentlyAssignedIds.size}/${maxCapacity}).`,
                    });
                }
                break; // Stop evaluating further students
            }

            const student = studentMap.get(studentId);

            // Rule Check: Student Existence
            if (!student) {
                assignmentResults.push({
                    studentId,
                    assigned: false,
                    reason: "Student record not found.",
                });
                continue;
            }

            // Rule Check: Already Assigned
            if (currentlyAssignedIds.has(studentId)) {
                assignmentResults.push({
                    studentId,
                    assigned: false,
                    reason: "Student is already in this group.",
                });
                continue;
            }

            // Rule Check: Gender Restriction
            if (isFemaleOnly && student.gender?.toLowerCase() !== "female") {
                assignmentResults.push({
                    studentId,
                    assigned: false,
                    reason: "Failed rule: Group is restricted to female students only.",
                });
                continue;
            }

            // Rule Check: Memorization Range
            const studentJuz = student.currentMemorization?.juz;

            if (groupRange?.start?.juz && groupRange?.end?.juz && studentJuz) {
                const minJuz = Math.min(groupRange.start.juz, groupRange.end.juz);
                const maxJuz = Math.max(groupRange.start.juz, groupRange.end.juz);

                if (studentJuz < minJuz || studentJuz > maxJuz) {
                    assignmentResults.push({
                        studentId,
                        assigned: false,
                        reason: `Failed rule: Student's memorization level (Juz ${studentJuz}) is outside allowed range (Juz ${minJuz}–${maxJuz}).`,
                    });
                    continue;
                }
            }

            // 5. Atomic Update
            const updatedGroup = await TutorGroup.findOneAndUpdate(
                {
                    _id: tutorGroupId,
                    students: { $ne: studentId },
                    $expr: { $lt: [{ $size: "$students" }, maxCapacity] },
                },
                {
                    $addToSet: { students: studentId },
                },
                { new: true }
            );

            if (updatedGroup) {
                currentlyAssignedIds.add(studentId);
                assignedCount++;
                assignmentResults.push({
                    studentId,
                    assigned: true,
                });
            } else {
                assignmentResults.push({
                    studentId,
                    assigned: false,
                    reason: "Atomic update failed (concurrent update or capacity reached).",
                });
            }
        }

        // 6. Revalidate cache
        revalidatePath("/admin/dashboard");
        revalidatePath("/admin/assignments");

        return {
            success: assignedCount > 0,
            message: `Successfully assigned ${assignedCount} of ${studentIds.length} requested student(s).`,
            summary: {
                totalRequested: studentIds.length,
                assignedCount,
                failedCount: studentIds.length - assignedCount,
                results: assignmentResults,
            },
        };
    } catch (error: any) {
        console.error("Error in assignStudentsToTutor:", error);
        return {
            success: false,
            message: error.message || "An unexpected error occurred during bulk assignment.",
            summary: {
                totalRequested: studentIds.length,
                assignedCount: 0,
                failedCount: studentIds.length,
                results: [],
            },
        };
    }
}




export async function autoAssignStudentsToTutorGroups(
    studentIds: string[]
): Promise<AutoAssignActionResult> {
    try {
        await connectDB();

        if (!studentIds || studentIds.length === 0) {
            return {
                success: false,
                message: "No student IDs provided for assignment.",
                summary: { totalRequested: 0, assignedCount: 0, unassignedCount: 0, results: [] },
            };
        }

        // 1. Fetch candidate students
        const students = await Student.find({ _id: { $in: studentIds } }).populate("user", "name email").lean()
        if (students.length === 0) {
            return {
                success: false,
                message: "No valid student records found for the provided IDs.",
                summary: { totalRequested: studentIds.length, assignedCount: 0, unassignedCount: studentIds.length, results: [] },
            };
        }

        // 2. Fetch all active TutorGroups
        const activeGroups = await TutorGroup.find({ isActive: true }).lean();
        if (activeGroups.length === 0) {
            return {
                success: false,
                message: "No active tutor groups available for assignment.",
                summary: { totalRequested: studentIds.length, assignedCount: 0, unassignedCount: studentIds.length, results: [] },
            };
        }

        // 3. Maintain in-memory tracking of groups and their current student sets
        const groupStateMap = new Map<
            string,
            {
                doc: any;
                studentsSet: Set<string>;
                maxCapacity: number;
                femaleOnly: boolean;
                memorizationRange?: any;
            }
        >();

        for (const group of activeGroups) {
            const maxCapacity = group.rules?.maxCapacity ?? 5;
            const currentStudents = (group.students || []).map((id: any) => id.toString());

            // Only track groups that still have space
            if (currentStudents.length < maxCapacity) {
                groupStateMap.set(group._id.toString(), {
                    doc: group,
                    studentsSet: new Set(currentStudents),
                    maxCapacity,
                    femaleOnly: group.rules?.femaleOnly ?? false,
                    memorizationRange: group.rules?.memorizationRange,
                });
            }
        }

        const results: AutoAssignStudentResult[] = [];
        let assignedCount = 0;

        // Helper: Compute how many rules a group enforces (fewer rules = higher score)
        const getRuleComplexityScore = (groupState: any) => {
            let score = 0;
            if (groupState.femaleOnly) score += 1;
            if (groupState.memorizationRange?.start?.juz && groupState.memorizationRange?.end?.juz) {
                score += 1;
            }
            return score; // 0 = lowest rules (highest priority), 2 = most constrained
        };

        // Helper: Check if student meets group's memorization range rule
        const matchesMemorizationRange = (studentJuz: number | undefined, groupRange: any) => {
            if (!groupRange?.start?.juz || !groupRange?.end?.juz || !studentJuz) {
                return true; // No range specified or student level missing -> pass
            }
            const minJuz = Math.min(groupRange.start.juz, groupRange.end.juz);
            const maxJuz = Math.max(groupRange.start.juz, groupRange.end.juz);
            return studentJuz >= minJuz && studentJuz <= maxJuz;
        };

        // 4. Sequential student assignment loop
        for (const studentId of studentIds) {
            const student = students.find((s: any) => s._id.toString() === studentId);

            if (!student) {
                results.push({
                    studentId,
                    assigned: false,
                    reason: "Student record not found.",
                });
                continue;
            }

            const isFemale = student.gender?.toLowerCase() === "female";
            const studentJuz = student.currentMemorization?.juz;

            // Filter groups that can accept this student
            const eligibleGroups: Array<{ groupId: string; score: number }> = [];

            for (const [groupId, groupState] of groupStateMap.entries()) {
                const availableSlots = groupState.maxCapacity - groupState.studentsSet.size;

                // Skip if full
                if (availableSlots <= 0) continue;

                // Skip if student is already in this group
                if (groupState.studentsSet.has(studentId)) continue;

                // Rule Check: Female-only restriction
                if (groupState.femaleOnly && !isFemale) {
                    continue; // Male student cannot join female-only group
                }

                // Rule Check: Memorization range
                if (!matchesMemorizationRange(studentJuz, groupState.memorizationRange)) {
                    continue;
                }

                // --- Calculate Priority Score for Candidate Group ---
                let priorityScore = 0;

                // Priority 1: Prioritize female-only groups for female students (+1000 points)
                if (isFemale && groupState.femaleOnly) {
                    priorityScore += 1000;
                }

                // Priority 2: Higher vacancy (more open seats) (+10 points per open slot)
                priorityScore += availableSlots * 10;

                // Priority 3: Fewer rules / Less restrictive (-5 points per active rule)
                priorityScore -= getRuleComplexityScore(groupState) * 5;

                eligibleGroups.push({ groupId, score: priorityScore });
            }

            // If no valid group found
            if (eligibleGroups.length === 0) {
                results.push({
                    studentId,
                    studentName: (student.user as IUser).name! ?? "N/A",
                    assigned: false,
                    reason: "No available tutor group matching rules and capacity.",
                });
                continue;
            }

            // Sort eligible groups by highest priority score descending
            eligibleGroups.sort((a, b) => b.score - a.score);

            const targetGroupId = eligibleGroups[0].groupId;
            const targetGroupState = groupStateMap.get(targetGroupId)!;

            // 5. Atomic Update in Database
            const updatedGroup = await TutorGroup.findOneAndUpdate(
                {
                    _id: targetGroupId,
                    students: { $ne: studentId },
                    $expr: { $lt: [{ $size: "$students" }, targetGroupState.maxCapacity] },
                },
                {
                    $addToSet: { students: studentId },
                },
                { new: true }
            );

            if (updatedGroup) {
                // Update in-memory state for subsequent iterations
                targetGroupState.studentsSet.add(studentId);
                assignedCount++;

                results.push({
                    studentId,
                    studentName: (student.user as IUser).name! ?? "N/A",
                    assigned: true,
                    assignedGroupId: targetGroupId,
                });

                // If the target group became full, delete it from future candidate checks
                if (targetGroupState.studentsSet.size >= targetGroupState.maxCapacity) {
                    groupStateMap.delete(targetGroupId);
                }
            } else {
                results.push({
                    studentId,
                    studentName: (student.user as IUser).name! ?? "N/A",
                    assigned: false,
                    reason: "Atomic database update failed due to concurrent modification.",
                });
            }
        }

        // 6. Revalidate cache
        revalidatePath("/admin/dashboard");
        revalidatePath("/admin/assignments");

        return {
            success: assignedCount > 0,
            message: `Successfully auto-assigned ${assignedCount} of ${studentIds.length} requested student(s).`,
            summary: {
                totalRequested: studentIds.length,
                assignedCount,
                unassignedCount: studentIds.length - assignedCount,
                results,
            },
        };
    } catch (error: any) {
        console.error("Error in autoAssignStudentsToTutorGroups:", error);
        return {
            success: false,
            message: error.message || "An unexpected error occurred during auto-assignment.",
            summary: {
                totalRequested: studentIds.length,
                assignedCount: 0,
                unassignedCount: studentIds.length,
                results: [],
            },
        };
    }
}