"use server";

import connectDB from "@/lib/db";
import Schedule, { IScheduleDocument } from "@/models/schedule.model";
import Student, { IStudent, IStudentDocument } from "@/models/student.model";
import TutorGroup from "@/models/tutorGroup.model";
import { IUser } from "@/models/user.model";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

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

export async function getUnassignedStudentIds(): Promise<string[]> {
  await connectDB();
  const unassignedStudents = await Student.find({ tutor: null }, "_id").lean();
  return unassignedStudents.map((s) => s._id.toString());
}

export async function getUnassignedStudents(): Promise<IStudentDocument[]> {
  await connectDB();
  const unassignedStudents = await Student.find({ tutor: null }, "_id").lean();
  return unassignedStudents;
}

export async function assignStudentToTutor(
  studentId: string,
  tutorGroupId: string,
): Promise<ActionResult> {
  let session: mongoose.ClientSession | null = null;

  try {
    await connectDB();

    // 1. Fetch both resources
    const [tutorGroup, student] = await Promise.all([
      TutorGroup.findById(tutorGroupId),
      Student.findById(studentId),
    ]);

    if (!tutorGroup) {
      return { success: false, message: "Tutor group not found." };
    }

    if (!tutorGroup.isActive) {
      return {
        success: false,
        message: "This tutor group is currently inactive.",
      };
    }

    if (!student) {
      return { success: false, message: "Student record not found." };
    }

    // 2. Check if student is already in this specific target group
    const isAlreadyAssigned = tutorGroup.students.some(
      (id: any) => id.toString() === studentId,
    );
    if (isAlreadyAssigned) {
      return {
        success: false,
        message: "Student is already assigned to this group.",
      };
    }

    // 3. Rule Check: Maximum Capacity
    // Note: If the student is being moved from an existing group, capacity in the TARGET group must still be checked.
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
          message:
            "Validation failed: This group is restricted to female students only.",
        };
      }
    }

    // 5. Rule Check: Memorization Range Compliance
    const groupRange = tutorGroup.rules?.memorizationRange;
    const studentJuz = Number(student.currentMemorization?.juz);

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

    // 6. Execute Reassignment in a Transaction
    session = await mongoose.startSession();
    session.startTransaction();

    // Step A: Remove student from any previously assigned tutor groups
    await TutorGroup.updateMany(
      { students: studentId },
      { $pull: { students: studentId } },
      { session },
    );

    // Step B: Atomic assignment to target group with capacity re-verification
    const updatedGroup = await TutorGroup.findOneAndUpdate(
      {
        _id: tutorGroupId,
        $expr: { $lt: [{ $size: "$students" }, maxCapacity] },
      },
      {
        $addToSet: { students: studentId },
      },
      { new: true, session },
    );

    if (!updatedGroup) {
      await session.abortTransaction();
      return {
        success: false,
        message:
          "Assignment failed due to a concurrent update or capacity limit reached.",
      };
    }

    // Step C: Update student's assigned tutor reference
    await Student.updateOne(
      { _id: studentId },
      { $set: { tutor: updatedGroup.tutor } },
      { session },
    );

    await session.commitTransaction();

    // 7. Revalidate dashboard routes
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/assignments");

    return {
      success: true,
      message: "Student successfully reassigned to tutor group.",
    };
  } catch (error: any) {
    if (session && session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error("Error in assignStudentToTutor:", error);
    return {
      success: false,
      message:
        error.message || "An unexpected error occurred during assignment.",
    };
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}

export async function assignStudentsToTutor(
  studentIds: string[],
  tutorGroupId: string,
): Promise<BulkActionResult> {
  try {
    await connectDB();

    // 1. Validate inputs
    if (!studentIds || studentIds.length === 0) {
      return {
        success: false,
        message: "No student IDs provided for assignment.",
        summary: {
          totalRequested: 0,
          assignedCount: 0,
          failedCount: 0,
          results: [],
        },
      };
    }

    // 2. Fetch the TutorGroup
    const tutorGroup = await TutorGroup.findById(tutorGroupId);

    if (!tutorGroup) {
      return {
        success: false,
        message: "Tutor group not found.",
        summary: {
          totalRequested: studentIds.length,
          assignedCount: 0,
          failedCount: studentIds.length,
          results: [],
        },
      };
    }

    if (!tutorGroup.isActive) {
      return {
        success: false,
        message: "This tutor group is currently inactive.",
        summary: {
          totalRequested: studentIds.length,
          assignedCount: 0,
          failedCount: studentIds.length,
          results: [],
        },
      };
    }

    const rules = tutorGroup.rules;
    const maxCapacity = rules?.maxCapacity ?? 5;
    const isFemaleOnly = rules?.femaleOnly ?? false;
    const groupRange = rules?.memorizationRange;

    // Track currently assigned student IDs in memory
    const currentlyAssignedIds = new Set<string>(
      tutorGroup.students.map((id) => id.toString()),
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
      students.map((std: any) => [std._id.toString(), std]),
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
        { new: true },
      );

      if (updatedGroup) {
        currentlyAssignedIds.add(studentId);
        assignedCount++;
        assignmentResults.push({
          studentId,
          assigned: true,
        });

        await Student.updateOne(
          { _id: studentId },
          { $set: { tutor: updatedGroup.tutor } },
        );
      } else {
        assignmentResults.push({
          studentId,
          assigned: false,
          reason:
            "Atomic update failed (concurrent update or capacity reached).",
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
      message:
        error.message || "An unexpected error occurred during bulk assignment.",
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
  studentIds: string[],
): Promise<AutoAssignActionResult> {
  try {
    await connectDB();

    if (!studentIds || studentIds.length === 0) {
      return {
        success: false,
        message: "No student IDs provided for assignment.",
        summary: {
          totalRequested: 0,
          assignedCount: 0,
          unassignedCount: 0,
          results: [],
        },
      };
    }

    // 1. Fetch candidate students
    const students = await Student.find({ _id: { $in: studentIds } })
      .populate("user", "name email")
      .lean();

    if (students.length === 0) {
      return {
        success: false,
        message: "No valid student records found for the provided IDs.",
        summary: {
          totalRequested: studentIds.length,
          assignedCount: 0,
          unassignedCount: studentIds.length,
          results: [],
        },
      };
    }

    // 2. Fetch active TutorGroups with populated schedules array
    const activeGroups = await TutorGroup.find({ isActive: true })
      .populate("schedules")
      .lean();

    if (activeGroups.length === 0) {
      return {
        success: false,
        message: "No active tutor groups available for assignment.",
        summary: {
          totalRequested: studentIds.length,
          assignedCount: 0,
          unassignedCount: studentIds.length,
          results: [],
        },
      };
    }

    // 3. Track group state in memory
    const groupStateMap = new Map<
      string,
      {
        doc: any;
        studentsSet: Set<string>;
        maxCapacity: number;
        femaleOnly: boolean;
        memorizationRange?: any;
        schedules: any[];
      }
    >();

    for (const group of activeGroups) {
      const maxCapacity = group.rules?.maxCapacity ?? 5;
      const currentStudents = (group.students || []).map((id: any) =>
        id.toString(),
      );

      if (currentStudents.length < maxCapacity) {
        groupStateMap.set(group._id.toString(), {
          doc: group,
          studentsSet: new Set(currentStudents),
          maxCapacity,
          femaleOnly: group.rules?.femaleOnly ?? false,
          memorizationRange: group.rules?.memorizationRange,
          schedules: (group as any).schedules || [],
        });
      }
    }

    const results: AutoAssignStudentResult[] = [];
    let assignedCount = 0;

    // Helper: Convert startTime (minutes from midnight 0-1439) into time category
    const getTimeCategory = (
      startTime: number,
    ): "morning" | "afternoon" | "night" => {
      if (startTime >= 0 && startTime < 720) return "morning"; // 00:00 - 11:59
      if (startTime >= 720 && startTime < 1020) return "afternoon"; // 12:00 - 16:59
      return "night"; // 17:00 - 23:59
    };

    // Helper: Calculate schedule match ratio and check if preferredTime matches majority of schedules
    const evaluateScheduleMatch = (
      preferredTime: "morning" | "afternoon" | "night" | undefined,
      schedules: any[] = [],
    ) => {
      if (!preferredTime || schedules.length === 0) {
        return { isMajority: true, matchRatio: 1 };
      }

      const matchCount = schedules.reduce((acc, sched) => {
        if (sched?.startTime !== undefined) {
          const category = getTimeCategory(sched.startTime);
          if (category === preferredTime.toLowerCase()) {
            return acc + 1;
          }
        }
        return acc;
      }, 0);

      const matchRatio = matchCount / schedules.length;
      return {
        isMajority: matchRatio > 0.5, // Strictly majority (> 50%)
        matchRatio,
      };
    };

    // Helper: Rule complexity score
    const getRuleComplexityScore = (groupState: any) => {
      let score = 0;
      if (groupState.femaleOnly) score += 1;
      if (
        groupState.memorizationRange?.start?.juz &&
        groupState.memorizationRange?.end?.juz
      ) {
        score += 1;
      }
      if (groupState.schedules && groupState.schedules.length > 0) {
        score += 1;
      }
      return score;
    };

    // Helper: Check memorization range
    const matchesMemorizationRange = (
      studentJuz: number | undefined,
      groupRange: any,
    ) => {
      if (!groupRange?.start?.juz || !groupRange?.end?.juz || !studentJuz) {
        return true;
      }
      const minJuz = Math.min(groupRange.start.juz, groupRange.end.juz);
      const maxJuz = Math.max(groupRange.start.juz, groupRange.end.juz);
      return studentJuz >= minJuz && studentJuz <= maxJuz;
    };

    // 4. Sequential assignment loop
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
      const studentJuz = Number(student.currentMemorization?.juz);
      const preferredTime = student.preferredTime as
        | "morning"
        | "afternoon"
        | "night"
        | undefined;

      const eligibleGroups: Array<{ groupId: string; score: number }> = [];
      const rejectionReasons: string[] = [];

      for (const [groupId, groupState] of groupStateMap.entries()) {
        const availableSlots =
          groupState.maxCapacity - groupState.studentsSet.size;

        if (availableSlots <= 0) {
          rejectionReasons.push(
            `Group ${groupId}: Reached maximum capacity (${groupState.maxCapacity}).`,
          );
          continue;
        }

        if (groupState.studentsSet.has(studentId)) {
          rejectionReasons.push(
            `Group ${groupId}: Student is already enrolled.`,
          );
          continue;
        }

        if (groupState.femaleOnly && !isFemale) {
          rejectionReasons.push(
            `Group ${groupId}: Restricted to female students only.`,
          );
          continue;
        }

        if (
          !matchesMemorizationRange(studentJuz, groupState.memorizationRange)
        ) {
          rejectionReasons.push(
            `Group ${groupId}: Student Juz level (${studentJuz || "N/A"}) outside required range.`,
          );
          continue;
        }

        // Check majority schedule preference
        const { isMajority, matchRatio } = evaluateScheduleMatch(
          preferredTime,
          groupState.schedules,
        );

        if (!isMajority) {
          rejectionReasons.push(
            `Group ${groupId}: Schedules do not mostly match student's preferred time (${preferredTime}). Match ratio: ${Math.round(matchRatio * 100)}%.`,
          );
          continue;
        }

        // --- Calculate Priority Score ---
        let priorityScore = 0;

        // Priority 1: Female-only alignment (+1000 pts)
        if (isFemale && groupState.femaleOnly) {
          priorityScore += 1000;
        }

        // Priority 2: Schedule alignment strength (Up to +500 pts based on exact match ratio)
        priorityScore += Math.round(matchRatio * 500);

        // Priority 3: Higher capacity vacancy (+10 pts per open slot)
        priorityScore += availableSlots * 10;

        // Priority 4: Less restrictive rules (-5 pts per rule)
        priorityScore -= getRuleComplexityScore(groupState) * 5;

        eligibleGroups.push({ groupId, score: priorityScore });
      }

      if (eligibleGroups.length === 0) {
        const summaryReason =
          rejectionReasons.length > 0
            ? `No matching group found. Failures: [${rejectionReasons.join(" | ")}]`
            : "No active or non-full tutor groups available.";

        results.push({
          studentId,
          studentName: (student.user as IUser)?.name ?? "N/A",
          assigned: false,
          reason: summaryReason,
        });
        continue;
      }

      eligibleGroups.sort((a, b) => b.score - a.score);

      const targetGroupId = eligibleGroups[0].groupId;
      const targetGroupState = groupStateMap.get(targetGroupId)!;

      // 5. Atomic MongoDB Update
      const updatedGroup = await TutorGroup.findOneAndUpdate(
        {
          _id: targetGroupId,
          students: { $ne: studentId },
          $expr: {
            $lt: [{ $size: "$students" }, targetGroupState.maxCapacity],
          },
        },
        {
          $addToSet: { students: studentId },
        },
        { new: true },
      );

      if (updatedGroup) {
        targetGroupState.studentsSet.add(studentId);
        assignedCount++;

        results.push({
          studentId,
          studentName: (student.user as IUser)?.name ?? "N/A",
          assigned: true,
          assignedGroupId: targetGroupId,
        });

        if (targetGroupState.studentsSet.size >= targetGroupState.maxCapacity) {
          groupStateMap.delete(targetGroupId);
        }

        await Student.updateOne(
          { _id: studentId },
          { $set: { tutor: updatedGroup.tutor } },
        );
      } else {
        results.push({
          studentId,
          studentName: (student.user as IUser)?.name ?? "N/A",
          assigned: false,
          reason:
            "Atomic database update failed due to concurrent modification.",
        });
      }
    }

    // 6. Cache revalidation
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/assignments");

    const summary = {
      totalRequested: studentIds.length,
      assignedCount,
      unassignedCount: studentIds.length - assignedCount,
      results,
    };

    console.log("summary", summary);

    return {
      success: assignedCount > 0,
      message: `Successfully auto-assigned ${assignedCount} of ${studentIds.length} requested student(s).`,
      summary,
    };
  } catch (error: any) {
    console.error("Error in autoAssignStudentsToTutorGroups:", error);
    return {
      success: false,
      message:
        error.message || "An unexpected error occurred during auto-assignment.",
      summary: {
        totalRequested: studentIds.length,
        assignedCount: 0,
        unassignedCount: studentIds.length,
        results: [],
      },
    };
  }
}

export interface AssignmentTableRow {
  groupId: string;
  groupName: string;
  tutorName: string;
  tutorEmail: string;
  capacity: string; // e.g. "4 / 5"
  schedulesSummary: string; // e.g. "Mon, Wed (Morning)"
  students: Array<{
    id: string;
    name: string;
    email: string;
    gender: string;
    juz: number | string;
    preferredTime?: string;
  }>;
}

export async function getTutorGroupAssignmentsTable(): Promise<{
  success: boolean;
  data: AssignmentTableRow[];
  message?: string;
}> {
  try {
    await connectDB();

    // Fetch tutor groups and populate tutor, students (and user accounts), and schedules
    const groups = await TutorGroup.find({
      students: { $exists: true, $not: { $size: 0 } },
    })
      .populate({
        path: "tutor",
        populate: { path: "user", select: "name email" },
      })
      .populate({
        path: "students",
        populate: { path: "user", select: "name email" },
      })
      .populate({
        path: "schedules",
        // model: Schedule,
      })
      .sort({ createdAt: -1 })
      .lean();

    const formattedData: AssignmentTableRow[] = groups.map((group: any) => {
      // 1. Format Tutor Information
      const tutorName =
        group.tutor?.user?.name || group.tutor?.name || "Unassigned";
      const tutorEmail = group.tutor?.user?.email || "N/A";

      // 2. Format Capacity
      const maxCapacity = group.rules?.maxCapacity ?? 5;
      const currentCount = group.students?.length || 0;
      const capacity = `${currentCount} / ${maxCapacity}`;

      // 3. Summarize Schedules
      const schedulesSummary =
        group.schedules && group.schedules.length > 0
          ? group.schedules
              .map((s: any) => {
                const day = s.dayOfWeek || s.day || "";
                const time =
                  s.startTime !== undefined
                    ? formatTimeCategory(s.startTime)
                    : "";
                return `${day}${time ? ` (${time})` : ""}`;
              })
              .filter(Boolean)
              .join(", ")
          : "No schedule set";

      // 4. Format Enrolled Students List
      const students = (group.students || []).map((student: any) => ({
        id: student._id.toString(),
        name: student.user?.name || "Unknown",
        email: student.user?.email || "N/A",
        gender: student.gender || "N/A",
        juz: student.currentMemorization?.juz,
        position: student.currentPosition?.chapter,
        preferredTime: student.preferredTime,
      }));

      return {
        groupId: group._id.toString(),
        groupName: group.name || `Group ${group._id.toString().slice(-4)}`,
        tutorName,
        tutorEmail,
        capacity,
        schedulesSummary,
        students,
      };
    });

    return {
      success: true,
      data: formattedData,
    };
  } catch (error: any) {
    console.error("Error fetching tutor group assignments table:", error);
    return {
      success: false,
      data: [],
      message: error.message || "Failed to retrieve assignment data.",
    };
  }
}

// Helper: Maps schedule startTime minutes to time category label
function formatTimeCategory(startTime: number): string {
  if (startTime >= 0 && startTime < 720) return "Morning";
  if (startTime >= 720 && startTime < 1020) return "Afternoon";
  return "Night";
}
