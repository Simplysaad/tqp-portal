import Link from "next/link";
import connectDB from "@/lib/db";
import Student from "@/models/student.model";
import { User, CheckCircle2, ShieldAlert, Mars, Venus } from "lucide-react";
import { generateOSFAMetadata } from "@/lib/metadata";

export const revalidate = 0;

export const metadata = generateOSFAMetadata({
    path: "/admin/students",
    title: "Student Directory | TQP Admin",
    description: "Search, filter, and manage all registered students and their current learning progress.",
})

export default async function StudentsDirectoryPage() {
    await connectDB();
    const students = await Student.find().populate("user", "name email").lean();

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex not-md:flex-col not-md:items-start gap-4 items-center justify-between border-b border-zinc-200 pb-5">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Students Directory</h1>
                    <p className="text-sm text-zinc-500 mt-1">Manage all registered student records and group assignments.</p>
                </div>
                <Link
                    href="/admin/assignments/batch"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors"
                >
                    Batch Auto-Assign
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-600">
                        <thead className="bg-zinc-50 text-xs font-semibold uppercase text-zinc-500 border-b border-zinc-200">
                            <tr>
                                <th className="px-6 py-3.5">Student</th>
                                <th className="px-6 py-3.5">Matric Number</th>
                                <th className="px-6 py-3.5">Gender</th>
                                <th className="px-6 py-3.5">Level / Dept</th>
                                <th className="px-6 py-3.5">Memorization</th>
                                <th className="px-6 py-3.5">Status</th>
                                <th className="px-6 py-3.5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                            {students.map((student: any) => {
                                const isAssigned = !!student.tutor;
                                const userName = student.user?.name || "N/A";
                                const userEmail = student.user?.email || "";

                                return (
                                    <tr key={student._id.toString()} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative inline-block">
                                                    <div className="p-2 bg-zinc-100 rounded-full text-zinc-600">
                                                        <User className="w-5 h-5" />
                                                    </div>
                                                    <span className="absolute -bottom-1 -right-1 p-0.5 bg-white rounded-full shadow-xs">
                                                        {student.gender === "male" ? (
                                                            <Mars className="w-3.5 h-3.5 text-blue-600" />
                                                        ) : (
                                                            <Venus className="w-3.5 h-3.5 text-pink-600" />
                                                        )}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-zinc-900">{userName}</p>
                                                    <p className="text-xs text-zinc-400">{userEmail}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">{student.matricNumber || "N/A"}</td>
                                        <td className="px-6 py-4 capitalize">{student.gender}</td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-medium text-zinc-900">Level {student.level || "N/A"}</p>
                                            <p className="text-xs text-zinc-400">{student.department || "N/A"}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-zinc-100 text-zinc-800 text-xs font-medium px-2.5 py-1 rounded">
                                                Juz {student.currentMemorization?.juz || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {isAssigned ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                    <CheckCircle2 className="w-3 h-3" /> Assigned
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                                    <ShieldAlert className="w-3 h-3" /> Unassigned
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/admin/students/${student._id}`}
                                                className="text-xs font-semibold text-emerald-600 hover:underline"
                                            >
                                                View Profile
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}