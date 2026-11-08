import { notFound } from "next/navigation";
import Link from "next/link";
import connectDB from "@/lib/db";

// IMPORTANT: Import all models to register schemas
import "@/models/user.model";
import "@/models/student.model";
import "@/models/tutor.model";
import "@/models/tutorGroup.model";
import "@/models/session.model";
import "@/models/goal.model";
import "@/models/schedule.model";

import Student from "@/models/student.model";
import TutorGroup from "@/models/tutorGroup.model";
import Session from "@/models/session.model";
import Goal from "@/models/goal.model";
import {
    User,
    BookOpen,
    Building2,
    ShieldCheck,
    ArrowLeft,
    Calendar,
    MessageSquare,
    BarChart3,
    Clock
} from "lucide-react";
import { generateOSFAMetadata } from "@/lib/metadata";

export const revalidate = 0;

export async function generateMetadata({ params }: { params: any }) {
    const { id } = await params;
    return generateOSFAMetadata({
        path: `/admin/students/${id}`,
        title: "Student Profile",
        description: "Detailed student progress view"
    });
}

export default async function StudentDetailPage({
    params
}: {
    params: { id: string };
}) {
    await connectDB();
    const { id } = await params;

    const student = await Student.findById(id)
        .populate("user", "name email whatsappNumber")
        .lean();
    if (!student) notFound();

    const isBeginner = student.program === "beginner";

    const [assignedGroup, sessions, goals, totalCount, presentCount] =
        await Promise.all([
            TutorGroup.findOne({ students: student._id })
                .populate({
                    path: "tutor",
                    populate: { path: "user", select: "name" }
                })
                .lean(),
            Session.find({ student: student._id })
                .sort({ date: -1 })
                .populate({
                    path: "tutor",
                    populate: { path: "user", select: "name" }
                })
                .populate({
                    path: "schedule",
                    select: "dayOfWeek startTime endTime"
                })
                .lean(),
            Goal.find({ student: student._id }).sort({ createdAt: -1 }).lean(),
            Session.countDocuments({ student: student._id }),
            Session.countDocuments({
                student: student._id,
                attendance: "present"
            })
        ]);

    const activeGoal = goals[0];
    const attendanceRate =
        totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
    const latestEvaluated = sessions.find(
        (s: any) => s.tutorsComment || s.performance
    );

    const ratingColors: Record<string, string> = {
        excellent: "bg-emerald-50 text-emerald-700 border-emerald-200",
        good: "bg-blue-50 text-blue-700 border-blue-200",
        fair: "bg-amber-50 text-amber-700 border-amber-200",
        needs_work: "bg-rose-50 text-rose-700 border-rose-200"
    };

    return (
        <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
            <Link
                href="/admin/students"
                className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-900"
            >
                <ArrowLeft className="w-4 h-4" /> Back
            </Link>

            {/* Header */}
            <div className="bg-white p-5 sm:p-6 rounded-xl border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-start sm:items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full shrink-0">
                        <User className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold break-words">
                            {(student.user as any)?.name}
                        </h1>
                        <p className="text-xs sm:text-sm text-zinc-500 break-all">
                            {(student.user as any)?.email} •{" "}
                            {student.matricNumber || "No Matric"} •{" "}
                            {(student.user as any)?.whatsappNumber}
                        </p>
                        <p className="text-xs text-zinc-400 mt-1 capitalize">
                            {student.gender} • {student.program} program •{" "}
                            {student.department} ({student.level}) •{" "}
                            {student.preferredTime} pref
                        </p>
                    </div>
                </div>
                <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold capitalize shrink-0 ${student.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}
                >
                    {student.status}
                </span>
            </div>

            {/* Progress Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {isBeginner ? (
                    <>
                        <div className="p-4 border rounded-xl bg-white shadow-sm">
                            <h3 className="text-xs text-gray-400 uppercase">
                                Current Chapter
                            </h3>
                            <p className="text-base sm:text-lg font-bold truncate">
                                {student.currentPosition?.chapter || "Not set"}
                            </p>
                            <p className="text-xs text-gray-500">
                                Page {student.currentPosition?.page}
                            </p>
                        </div>
                        <div className="p-4 border rounded-xl bg-white shadow-sm">
                            <h3 className="text-xs text-gray-400 uppercase">
                                Section
                            </h3>
                            <p className="text-base sm:text-lg font-bold truncate">
                                {student.currentPosition?.section || "Not set"}
                            </p>
                            <p className="text-xs text-gray-500">
                                Index {student.currentPosition?.index}
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="p-4 border rounded-xl bg-white shadow-sm">
                            <h3 className="text-xs text-gray-400 uppercase">
                                Current Surah
                            </h3>
                            <p className="text-base sm:text-lg font-bold truncate">
                                {student.currentMemorization?.surah ||
                                    "Not set"}
                            </p>
                            <p className="text-xs text-gray-500">
                                Ayah {student.currentMemorization?.aayah}
                            </p>
                        </div>
                        <div className="p-4 border rounded-xl bg-white shadow-sm">
                            <h3 className="text-xs text-gray-400 uppercase">
                                Current Juz
                            </h3>
                            <p className="text-base sm:text-lg font-bold truncate">
                                {student.currentMemorization?.juz
                                    ? `Juz ${student.currentMemorization.juz}`
                                    : "Not set"}
                            </p>
                        </div>
                    </>
                )}
                <div className="p-4 border rounded-xl bg-white shadow-sm">
                    <h3 className="text-xs text-gray-400 uppercase">
                        Current Page
                    </h3>
                    <p className="text-base sm:text-lg font-bold truncate">
                        {isBeginner
                            ? student.currentPosition?.page
                            : student.currentMemorization?.page
                              ? `Page ${isBeginner ? student.currentPosition?.page : student.currentMemorization?.page}`
                              : "Not set"}
                    </p>
                </div>
                <div className="p-4 border rounded-xl bg-white shadow-sm">
                    <h3 className="text-xs text-gray-400 uppercase">
                        Attendance
                    </h3>
                    <p className="text-base sm:text-lg font-bold text-emerald-600">
                        {attendanceRate}%
                    </p>
                    <p className="text-xs text-gray-500">
                        {presentCount} / {totalCount} Sessions
                    </p>
                </div>
            </div>

            {/* Goals */}
            <div className="space-y-3">
                <h2 className="font-semibold flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> Goals ({goals.length})
                </h2>
                {goals.length === 0 ? (
                    <div className="p-5 border rounded-xl bg-white text-sm text-zinc-500">
                        No goals
                    </div>
                ) : (
                    goals.map((goal: any) => (
                        <div
                            key={goal._id.toString()}
                            className="p-4 sm:p-5 border rounded-xl bg-white shadow-sm space-y-3"
                        >
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                <div>
                                    <span className="text-xs font-semibold uppercase text-emerald-600">
                                        {goal.semester} {goal.type} •{" "}
                                        {goal.status}
                                    </span>
                                    <h3 className="font-bold text-base sm:text-lg">
                                        {goal.title}
                                    </h3>
                                </div>
                                <span className="text-xs sm:text-sm font-bold text-emerald-700 shrink-0">
                                    {goal.progressPercentage}% Completed
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                                <div
                                    className="bg-emerald-600 h-2.5 rounded-full"
                                    style={{
                                        width: `${Math.min(goal.progressPercentage, 100)}%`
                                    }}
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-zinc-500 pt-1">
                                {goal.type === "nuru_al_bayan" ? (
                                    <>
                                        <span>
                                            Start:{" "}
                                            <b>
                                                {goal.startPosition?.chapter} p
                                                {goal.startPosition?.page}
                                            </b>
                                        </span>
                                        <span>
                                            Current:{" "}
                                            <b>
                                                {goal.currentPosition?.chapter}{" "}
                                                p{goal.currentPosition?.page}
                                            </b>
                                        </span>
                                        <span>
                                            Target:{" "}
                                            <b>
                                                {goal.targetPosition?.chapter} p
                                                {goal.targetPosition?.page}
                                            </b>
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span>
                                            Start:{" "}
                                            <b>
                                                {goal.start?.surah}:
                                                {goal.start?.aayah} (p
                                                {goal.start?.page})
                                            </b>
                                        </span>
                                        <span>
                                            Current:{" "}
                                            <b>
                                                {goal.current?.surah}:
                                                {goal.current?.aayah} (p
                                                {goal.current?.page})
                                            </b>
                                        </span>
                                        <span>
                                            Target:{" "}
                                            <b>
                                                {goal.target?.surah}:
                                                {goal.target?.aayah} (p
                                                {goal.target?.page}) •{" "}
                                                {goal.targetPages} pages
                                            </b>
                                        </span>
                                    </>
                                )}
                            </div>
                            <div className="text-xs text-zinc-400 pt-1 border-t">
                                Target Date:{" "}
                                {new Date(goal.targetDate).toLocaleDateString()}{" "}
                                • Created:{" "}
                                {new Date(goal.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Latest Feedback */}
            {latestEvaluated && (
                <div className="p-4 border rounded-xl bg-slate-50 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <h3 className="text-xs font-semibold uppercase text-slate-500 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" /> Latest
                            Feedback
                        </h3>
                        <span
                            className={`text-xs px-2.5 py-0.5 rounded border self-start sm:self-auto ${latestEvaluated.performance ? ratingColors[latestEvaluated.performance as string] : "bg-zinc-100 text-zinc-500"}`}
                        >
                            {latestEvaluated.performance || "no rating"}
                        </span>
                    </div>
                    <p className="text-sm italic">
                        "{latestEvaluated.tutorsComment}"
                    </p>
                    <p className="text-xs text-zinc-400">
                        {new Date(latestEvaluated.date).toLocaleDateString()} •{" "}
                        {(latestEvaluated.tutor as any)?.user?.name}
                    </p>
                </div>
            )}

            {/* ALL SESSIONS */}
            <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-5 space-y-4">
                <div className="flex justify-between border-b pb-3 items-center">
                    <h2 className="font-bold flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> All Sessions (
                        {sessions.length})
                    </h2>
                    <span className="text-xs text-zinc-400">Full history</span>
                </div>

                {sessions.length === 0 ? (
                    <p className="text-sm text-center py-6 text-zinc-500">
                        No sessions
                    </p>
                ) : (
                    <div className="divide-y">
                        {sessions.map((sess: any) => (
                            <div
                                key={sess._id.toString()}
                                className="py-4 space-y-3"
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                                    <div className="space-y-1.5 flex-1 w-full">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                            <p className="font-semibold text-sm sm:text-base">
                                                {new Date(
                                                    sess.date
                                                ).toLocaleDateString("en-GB", {
                                                    weekday: "short",
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric"
                                                })}
                                            </p>
                                            <span className="text-xs font-normal text-zinc-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />{" "}
                                                {Math.floor(
                                                    sess.startTime / 60
                                                )}
                                                :
                                                {String(
                                                    sess.startTime % 60
                                                ).padStart(2, "0")}{" "}
                                                -{" "}
                                                {Math.floor(sess.endTime / 60)}:
                                                {String(
                                                    sess.endTime % 60
                                                ).padStart(2, "0")}
                                                ({
                                                    (sess.schedule as any)
                                                        ?.dayOfWeek
                                                })
                                            </span>
                                        </div>

                                        {sess.newMemorization?.start && (
                                            <div className="text-xs bg-emerald-50 border border-emerald-100 p-2 rounded">
                                                <b>New Hifz:</b>{" "}
                                                {
                                                    sess.newMemorization.start
                                                        .surah
                                                }
                                                :
                                                {
                                                    sess.newMemorization.start
                                                        .aayah
                                                }{" "}
                                                (Juz{" "}
                                                {
                                                    sess.newMemorization.start
                                                        .juz
                                                }
                                                , p
                                                {
                                                    sess.newMemorization.start
                                                        .page
                                                }
                                                ) →{" "}
                                                {
                                                    sess.newMemorization.end
                                                        ?.surah
                                                }
                                                :
                                                {
                                                    sess.newMemorization.end
                                                        ?.aayah
                                                }{" "}
                                                (p
                                                {sess.newMemorization.end?.page}
                                                )
                                            </div>
                                        )}
                                        {sess.revision?.start && (
                                            <div className="text-xs bg-blue-50 border border-blue-100 p-2 rounded">
                                                <b>Revision:</b>{" "}
                                                {sess.revision.start.surah}:
                                                {sess.revision.start.aayah} →{" "}
                                                {sess.revision.end?.surah}:
                                                {sess.revision.end?.aayah}
                                            </div>
                                        )}
                                        {sess.newPosition?.start && (
                                            <div className="text-xs bg-amber-50 border border-amber-100 p-2 rounded">
                                                <b>New Position (Nuru):</b>{" "}
                                                {sess.newPosition.start.chapter}{" "}
                                                - Sec{" "}
                                                {sess.newPosition.start.section}{" "}
                                                - p{sess.newPosition.start.page}{" "}
                                                →{" "}
                                                {sess.newPosition.end?.chapter}{" "}
                                                p{sess.newPosition.end?.page}
                                            </div>
                                        )}

                                        <div className="flex gap-2 sm:gap-3 text-xs text-zinc-500 flex-wrap pt-1">
                                            <span>
                                                Tutor:{" "}
                                                {
                                                    (sess.tutor as any)?.user
                                                        ?.name
                                                }
                                            </span>
                                            <span>
                                                Link Active:{" "}
                                                {sess.isLinkActive
                                                    ? "Yes"
                                                    : "No"}
                                            </span>
                                            <span>
                                                Joined:{" "}
                                                {sess.joinedAt
                                                    ? new Date(
                                                          sess.joinedAt
                                                      ).toLocaleTimeString()
                                                    : "Never"}
                                            </span>
                                            <span>
                                                Clicks: {sess.clickCount}
                                            </span>
                                            <span>
                                                Approved:{" "}
                                                {sess.approved ? "✅" : "❌"}
                                            </span>
                                        </div>
                                        {sess.tutorsComment && (
                                            <p className="text-xs italic bg-zinc-50 p-2 rounded">
                                                Tutor: "{sess.tutorsComment}"
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
                                        <div className="flex items-center gap-1.5">
                                            <span
                                                className={`text-xs px-2 py-0.5 rounded capitalize ${sess.attendance === "present" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}
                                            >
                                                {sess.attendance}
                                            </span>

                                            {sess.performance && (
                                                <span
                                                    className={`text-xs px-2 py-0.5 rounded border capitalize ${ratingColors[sess.performance as string] || ""}`}
                                                >
                                                    {sess.performance.replace(
                                                        "_",
                                                        " "
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                        <Link
                                            href={`/dashboard/sessions/${sess._id}`}
                                            className="text-xs text-emerald-600 hover:underline shrink-0"
                                        >
                                            View →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Group */}
            <div className="bg-white p-4 sm:p-6 rounded-xl border shadow-sm">
                <div className="flex items-center gap-2 border-b pb-3">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    <h2 className="font-semibold">Tutor Group</h2>
                </div>
                {assignedGroup ? (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-indigo-50 border border-indigo-100 p-4 rounded-lg mt-3">
                        <div>
                            <p className="font-bold text-sm sm:text-base">
                                {assignedGroup.title}
                            </p>
                            <p className="text-xs text-zinc-500">
                                Tutor:{" "}
                                {(assignedGroup.tutor as any)?.user?.name}
                            </p>
                        </div>
                        <Link
                            href={`/admin/groups/${assignedGroup._id}`}
                            className="text-xs font-semibold text-indigo-700 shrink-0"
                        >
                            View Group →
                        </Link>
                    </div>
                ) : (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm mt-3 text-amber-800">
                        Unassigned
                    </div>
                )}
            </div>
        </div>
    );
}