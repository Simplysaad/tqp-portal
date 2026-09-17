// import connectDB from "@/lib/db";
// import Student from "@/models/student.model";
// import Session from "@/models/session.model";
// import JoinClassButton from "@/components/JoinClassButton";
// import Link from "next/link";
// import { getNearestSchedule } from "@/actions/tutor.action";
// import TutorGroup from "@/models/tutorGroup.model";
// import { isScheduleOpen } from "@/actions/session.action";
// import { ITutor } from "@/models/tutor.model";

// interface StudentDashboardProps {
//     userId: string;
// }

// function minutesToTime(minutes: number): string {
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
// }

// export default async function StudentDashboard({ userId }: StudentDashboardProps) {
//     await connectDB();

//     // 1. Fetch student profile
//     const student = await Student.findOne({ user: userId }).populate({
//         path: "user",
//         select: "_id name"
//     }).lean();
//     // // console.log("Student", student)

//     if (!student) {
//         return (
//             <div className="p-6 text-center">
//                 <h2 className="text-xl font-semibold">Profile Incomplete</h2>
//                 <p className="text-gray-500">Please complete your student onboarding process.</p>
//             </div>
//         );
//     }


//     /**
//      * Find student's tutorGroup.
//      * check for openSchedules in tutor group (isScheduleOpen)
//      * extract the activeSchedule from the tutorGroup 
//      */

//     const tutorGroup = await TutorGroup.findOne({ students: student._id, isActive: true }).populate({
//         path: "tutor",
//         populate: {
//             path: "user",
//             select: "name "
//         }
//     })

//     console.log("tutorGroup", tutorGroup);

//     // if (!tutorGroup) {
//     //     return (
//     //         <div className="p-6 text-center">
//     //             <h2 className="text-xl font-semibold">You have not enrolled in a class yet</h2>
//     //             <p className="text-gray-500">Please Enroll in a class to continue</p>
//     //         </div>
//     //     );
//     // }


//     let openSchedule: any = tutorGroup?.schedules.find(async (s: any) => await isScheduleOpen(s))


//     let nearestSchedule;

//     const response = await getNearestSchedule();
//     if (response.success) {
//         nearestSchedule = response.data
//     }

//     const isLinkActive = openSchedule?.isOpen
//     const hasMeetLink = Boolean(openSchedule?.googleMeetLink || openSchedule?.pseudoLink);

//     // 3. Fetch recent session logs for history feed (Limit 5)
//     const recentSessions = await Session.find({ student: student._id })
//         .sort({ date: -1 })
//         .limit(5)
//         .populate({ path: "tutor", populate: { path: "user", select: "name" } })
//         .lean();

//     // // console.log("recentSessions", recentSessions)

//     const todaySession = recentSessions[0];

//     // 4. Attendance stats calculation
//     const totalSessionsCount = await Session.countDocuments({ student: student._id });
//     const presentSessionsCount = await Session.countDocuments({
//         student: student._id,
//         attendance: "present",
//     });

//     const attendanceRate =
//         totalSessionsCount > 0
//             ? Math.round((presentSessionsCount / totalSessionsCount) * 100)
//             : 100;

//     const statusColors: Record<string, string> = {
//         active: "bg-emerald-100 text-emerald-800 border-emerald-300",
//         "at risk": "bg-amber-100 text-amber-800 border-amber-300",
//         inactive: "bg-rose-100 text-rose-800 border-rose-300",
//     };

//     return (
//         <div className="p-6 space-y-6 max-w-5xl mx-auto">
//             {/* Header & Status */}
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
//                 <div>
//                     <h1 className="text-2xl font-bold text-gray-900">{(student.user as any).name || "Student Dashboard"}</h1>
//                     <p className="text-gray-500 text-sm">
//                         {student.department ? `${student.department} (${student.level} Level)` : "TQP Student"}
//                     </p>
//                 </div>

//                 <div className="flex items-center gap-3">
//                     {todaySession && (
//                         <Link
//                             href={`/dashboard/sessions/${todaySession._id}`}
//                             className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
//                         >
//                             Log Progress
//                         </Link>
//                     )}
//                     <span
//                         className={`px-3 py-1 text-sm font-medium border rounded-full capitalize ${statusColors[student.status] || "bg-gray-100 text-gray-800"
//                             }`}
//                     >
//                         {student.status === "active"
//                             ? "🟢 On Track"
//                             : student.status === "at risk"
//                                 ? "🟡 At Risk"
//                                 : "🔴 Inactive"}
//                     </span>
//                 </div>
//             </div>

//             {/* Live Class Joining Banner */}
//             <div
//                 className={`p-5 border rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition ${isLinkActive ? "bg-emerald-50 border-emerald-300" : "bg-gray-50 border-gray-200"
//                     }`}
//             >
//                 <div className="space-y-1">
//                     <div className="flex items-center gap-2">
//                         <h3 className="font-bold text-gray-900 text-base">
//                             {tutorGroup
//                                 ? `Tutor: ${(tutorGroup?.tutor as any).gender === "male" ? "Ustadh" : "Ustadhah"} ${(tutorGroup.tutor as any)?.user?.name || "Assigned Ustadh"}`
//                                 : "No Enrolled Tutor"}
//                         </h3>
//                         {isLinkActive && (
//                             <span className="text-xs bg-emerald-600 text-white font-semibold px-2 py-0.5 rounded-full animate-pulse">
//                                 Class Live
//                             </span>
//                         )}
//                     </div>
//                     <p className="text-sm text-gray-600">
//                         {nearestSchedule
//                             && `Weekly Slot: ${nearestSchedule.dayOfWeek}s (${minutesToTime(
//                                 nearestSchedule.startTime
//                             )} - ${minutesToTime(nearestSchedule.endTime)})`
//                             // : "Please enroll with a tutor to see your upcoming schedule."
//                         }
//                     </p>
//                 </div>

//                 {openSchedule ? (
//                     <JoinClassButton
//                         link={`/join/${tutorGroup?._id}`}
//                         isLinkActive={isLinkActive}
//                         meetLinkAvailable={hasMeetLink}
//                     />
//                 ) : (
//                     <Link
//                         className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-semibold shadow-sm transition flex items-center gap-2"
//                         href={"/enroll?from=student_dashboard&next=/dashboard"}
//                     >
//                         Enroll Now
//                     </Link>
//                 )}
//             </div>

//             {/* Progress & Analytics Cards */}
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 <div className="p-4 border rounded-xl bg-white shadow-sm space-y-1">
//                     <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Current Surah</h3>
//                     <p className="text-lg font-bold text-gray-900">
//                         {student.currentMemorization?.surah || "Not set"}
//                     </p>
//                 </div>

//                 <div className="p-4 border rounded-xl bg-white shadow-sm space-y-1">
//                     <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Current Juz</h3>
//                     <p className="text-lg font-bold text-gray-900">
//                         {student.currentMemorization?.juz ? `Juz ${student.currentMemorization.juz}` : "Not set"}
//                     </p>
//                 </div>

//                 <div className="p-4 border rounded-xl bg-white shadow-sm space-y-1">
//                     <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Current Page</h3>
//                     <p className="text-lg font-bold text-gray-900">
//                         {student.currentMemorization?.page ? `Page ${student.currentMemorization.page}` : "Not set"}
//                     </p>
//                 </div>

//                 <div className="p-4 border rounded-xl bg-white shadow-sm space-y-1">
//                     <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Attendance Rate</h3>
//                     <p className="text-lg font-bold text-emerald-600">{attendanceRate}%</p>
//                 </div>
//             </div>

//             {/* Recent Session History */}
//             <div className="bg-white border rounded-xl shadow-sm p-5 space-y-4">
//                 <div className="flex justify-between items-center border-b pb-3">
//                     <h2 className="text-base font-bold text-gray-900">Recent Sessions</h2>
//                     <span className="text-xs text-gray-400">Last 5 records</span>
//                 </div>

//                 {recentSessions.length === 0 ? (
//                     <p className="text-sm text-gray-500 py-4 text-center">No past session records found.</p>
//                 ) : (
//                     <div className="divide-y divide-gray-100">
//                         {recentSessions.map((sess: any) => (
//                             <div key={sess._id.toString()} className="py-3 flex justify-between items-center text-sm">
//                                 <div>
//                                     <p className="font-semibold text-gray-800">
//                                         {sess.newMemorization?.start?.surah
//                                             ? `Surah ${sess.newMemorization.start.surah}`
//                                             : "General Session"}
//                                     </p>
//                                     <p className="text-xs text-gray-400">
//                                         {new Date(sess.date).toLocaleDateString("en-GB", {
//                                             weekday: "short",
//                                             day: "numeric",
//                                             month: "short",
//                                         })}
//                                     </p>
//                                 </div>

//                                 <div className="flex items-center gap-3">
//                                     <span
//                                         className={`px-2 py-0.5 text-xs font-medium rounded capitalize ${sess.attendance === "present"
//                                             ? "bg-emerald-50 text-emerald-700"
//                                             : "bg-rose-50 text-rose-700"
//                                             }`}
//                                     >
//                                         {sess.attendance}
//                                     </span>
//                                     <Link
//                                         href={`/dashboard/sessions/${sess._id}`}
//                                         className="text-xs text-emerald-600 hover:underline font-medium"
//                                     >
//                                         View
//                                     </Link>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }



import connectDB from "@/lib/db";
import Student from "@/models/student.model";
import Session from "@/models/session.model";
import Goal from "@/models/goal.model";
import TutorGroup from "@/models/tutorGroup.model";
import Schedule from "@/models/schedule.model";
import JoinClassButton from "@/components/JoinClassButton";
import Link from "next/link";
import { getNearestSchedule } from "@/actions/tutor.action";
import { isScheduleOpen } from "@/actions/session.action";

interface StudentDashboardProps {
    userId: string;
}

function minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

export default async function StudentDashboard({ userId }: StudentDashboardProps) {
    await connectDB();

    // 1. Fetch student profile with user detail
    const student = await Student.findOne({ user: userId })
        .populate({
            path: "user",
            select: "_id name whatsappNumber email",
        })
        .lean();

    if (!student) {
        return (
            <div className="p-6 text-center max-w-md mx-auto my-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900">Profile Incomplete</h2>
                <p className="text-gray-500 text-sm mt-1">
                    Please complete your student onboarding process to access your dashboard.
                </p>
            </div>
        );
    }

    // 2. Fetch Tutor Group & Schedules
    const tutorGroup = await TutorGroup.findOne({ students: student._id, isActive: true })
        .populate({
            path: "tutor",
            populate: {
                path: "user",
                select: "name whatsappNumber",
            },
        })
        .populate("schedules")
        .lean();

    // Fix async array iterator bug: Evaluate open schedules synchronously after fetching status
    let openSchedule: any = null;
    let isLinkActive = false;
    let hasMeetLink = false;

    if (tutorGroup?.schedules?.length) {
        for (const schedule of tutorGroup.schedules as any[]) {
            const isOpen = await isScheduleOpen(schedule);
            if (isOpen) {
                openSchedule = schedule;
                isLinkActive = true;
                hasMeetLink = Boolean(schedule.googleMeetLink || schedule.pseudoLink);
                break;
            }
        }
    }

    let nearestSchedule: any = null;
    const scheduleResponse = await getNearestSchedule();
    if (scheduleResponse.success) {
        nearestSchedule = scheduleResponse.data;
    }

    // 3. Fetch Student's Active Academic Goal
    const activeGoal = await Goal.findOne({
        student: student._id,
        status: "in_progress",
    })
        .sort({ createdAt: -1 })
        .lean();

    // 4. Fetch Recent Sessions (Last 5 for History Feed)
    const recentSessions = await Session.find({ student: student._id })
        .sort({ date: -1 })
        .limit(5)
        .populate({ path: "tutor", populate: { path: "user", select: "name" } })
        .lean();

    const latestEvaluatedSession = recentSessions.find(
        (sess) => sess.tutorsComment || sess.performance
    );

    // 5. Attendance Stats & Streaks Calculation
    const totalSessionsCount = await Session.countDocuments({ student: student._id });
    const presentSessionsCount = await Session.countDocuments({
        student: student._id,
        attendance: "present",
    });

    const attendanceRate =
        totalSessionsCount > 0
            ? Math.round((presentSessionsCount / totalSessionsCount) * 100)
            : 100;

    const todaySession = recentSessions[0];

    const statusColors: Record<string, string> = {
        active: "bg-emerald-100 text-emerald-800 border-emerald-300",
        "at risk": "bg-amber-100 text-amber-800 border-amber-300",
        inactive: "bg-rose-100 text-rose-800 border-rose-300",
    };

    const ratingColors: Record<string, string> = {
        excellent: "bg-emerald-50 text-emerald-700 border-emerald-200",
        good: "bg-blue-50 text-blue-700 border-blue-200",
        fair: "bg-amber-50 text-amber-700 border-amber-200",
        needs_work: "bg-rose-50 text-rose-700 border-rose-200",
    };

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            {/* Header & Status */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {(student.user as any)?.name || "Student Dashboard"}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {student.department
                            ? `${student.department} (${student.level} Level)`
                            : "Tahfeedh Program Student"}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {todaySession && (
                        <Link
                            href={`/dashboard/sessions/${todaySession._id}`}
                            className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                        >
                            Log Progress
                        </Link>
                    )}
                    <span
                        className={`px-3 py-1 text-sm font-medium border rounded-full capitalize ${statusColors[student.status] || "bg-gray-100 text-gray-800"
                            }`}
                    >
                        {student.status === "active"
                            ? "🟢 On Track"
                            : student.status === "at risk"
                                ? "🟡 At Risk"
                                : "🔴 Inactive"}
                    </span>
                </div>
            </div>

            {/* Live Class Joining Banner */}
            <div
                className={`p-5 border rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition ${isLinkActive ? "bg-emerald-50 border-emerald-300 shadow-sm" : "bg-gray-50 border-gray-200"
                    }`}
            >
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-base">
                            {tutorGroup
                                ? `Tutor: ${(tutorGroup.tutor as any)?.gender === "male"
                                    ? "Ustadh"
                                    : "Ustadhah"
                                } ${(tutorGroup.tutor as any)?.user?.name || "Assigned Ustadh"}`
                                : "No Enrolled Tutor"}
                        </h3>
                        {isLinkActive && (
                            <span className="text-xs bg-emerald-600 text-white font-semibold px-2 py-0.5 rounded-full animate-pulse">
                                Class Live
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-600">
                        {nearestSchedule
                            ? `Weekly Slot: ${nearestSchedule.dayOfWeek}s (${minutesToTime(
                                nearestSchedule.startTime
                            )} - ${minutesToTime(nearestSchedule.endTime)})`
                            : "No upcoming schedule found."}
                    </p>
                </div>

                {tutorGroup ? (<div className="flex items-center gap-3">
                    {(tutorGroup?.tutor as any)?.user?.whatsappNumber && (
                        <a
                            href={`https://wa.me/${(tutorGroup?.tutor as any).user.whatsappNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 text-xs font-semibold border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-md transition"
                        >
                            Contact Ustadh
                        </a>
                    )}
                    <JoinClassButton
                        link={`/join/${tutorGroup?._id}`}
                        // isLinkActive={Boolean(openSchedule?.isOpen)}
                        isLinkActive={isLinkActive}
                        meetLinkAvailable={hasMeetLink}
                    />
                </div>) : (<Link
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-semibold shadow-sm transition flex items-center gap-2"
                    href={"/enroll?from=student_dashboard&next=/dashboard"}
                >
                    Enroll Now
                </Link>)}
            </div>

            {/* Current Position & Progress Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-xl bg-white shadow-sm space-y-1">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Current Surah
                    </h3>
                    <p className="text-lg font-bold text-gray-900">
                        {student.currentMemorization?.surah || "Not set"}
                    </p>
                    {student.currentMemorization?.aayah && (
                        <p className="text-xs text-gray-500">
                            Ayah {student.currentMemorization.aayah}
                        </p>
                    )}
                </div>

                <div className="p-4 border rounded-xl bg-white shadow-sm space-y-1">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Current Juz
                    </h3>
                    <p className="text-lg font-bold text-gray-900">
                        {student.currentMemorization?.juz
                            ? `Juz ${student.currentMemorization.juz}`
                            : "Not set"}
                    </p>
                </div>

                <div className="p-4 border rounded-xl bg-white shadow-sm space-y-1">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Current Page
                    </h3>
                    <p className="text-lg font-bold text-gray-900">
                        {student.currentMemorization?.page
                            ? `Page ${student.currentMemorization.page}`
                            : "Not set"}
                    </p>
                </div>

                <div className="p-4 border rounded-xl bg-white shadow-sm space-y-1">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Attendance Rate
                    </h3>
                    <p className="text-lg font-bold text-emerald-600">{attendanceRate}%</p>
                    <p className="text-xs text-gray-500">{presentSessionsCount} / {totalSessionsCount} Sessions</p>
                </div>
            </div>

            {/* Active Academic Goal Section */}
            {activeGoal && (
                <div className="p-5 border rounded-xl bg-white shadow-sm space-y-3">
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                                Active Goal ({activeGoal.semester})
                            </span>
                            <h3 className="text-base font-bold text-gray-900">{activeGoal.title}</h3>
                        </div>
                        <span className="text-sm font-bold text-emerald-700">
                            {activeGoal.progressPercentage}% Completed
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                            className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(activeGoal.progressPercentage, 100)}%` }}
                        ></div>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500 pt-1">
                        <span>
                            Target Surah: <strong>{activeGoal.target.surah || "N/A"} ({activeGoal.target.aayah})</strong>
                        </span>
                        <span>
                            Target Pages: <strong>{activeGoal.targetPages} Pages</strong>
                        </span>
                    </div>
                </div>
            )}

            {/* Latest Tutor Feedback Banner */}
            {latestEvaluatedSession && (
                <div className="p-4 border rounded-xl bg-slate-50 space-y-2">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Latest Feedback from Tutor
                        </h3>
                        {latestEvaluatedSession.performance && (
                            <span
                                className={`text-xs px-2.5 py-0.5 rounded-full font-medium border capitalize ${ratingColors[latestEvaluatedSession.performance] || "bg-gray-100"
                                    }`}
                            >
                                {latestEvaluatedSession.performance.replace("_", " ")}
                            </span>
                        )}
                    </div>
                    {latestEvaluatedSession.tutorsComment ? (
                        <p className="text-sm italic text-slate-700">
                            &ldquo;{latestEvaluatedSession.tutorsComment}&rdquo;
                        </p>
                    ) : (
                        <p className="text-xs text-slate-400">No written comment provided.</p>
                    )}
                </div>
            )}

            {/* Recent Session History */}
            <div className="bg-white border rounded-xl shadow-sm p-5 space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-base font-bold text-gray-900">Recent Sessions</h2>
                    <span className="text-xs text-gray-400">Last 5 records</span>
                </div>

                {recentSessions.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4 text-center">No past session records found.</p>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {recentSessions.map((sess: any) => (
                            <div
                                key={sess._id.toString()}
                                className="py-3 flex justify-between items-center text-sm"
                            >
                                <div>
                                    <p className="font-semibold text-gray-800">
                                        {sess.newMemorization?.start?.surah
                                            ? `Surah ${sess.newMemorization.start.surah}`
                                            : "General Session"}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(sess.date).toLocaleDateString("en-GB", {
                                            weekday: "short",
                                            day: "numeric",
                                            month: "short",
                                        })}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span
                                        className={`px-2 py-0.5 text-xs font-medium rounded capitalize ${sess.attendance === "present"
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "bg-rose-50 text-rose-700"
                                            }`}
                                    >
                                        {sess.attendance}
                                    </span>
                                    <Link
                                        href={`/dashboard/sessions/${sess._id}`}
                                        className="text-xs text-emerald-600 hover:underline font-medium"
                                    >
                                        View
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}