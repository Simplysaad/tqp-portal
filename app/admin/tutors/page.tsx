import Link from "next/link";
import connectDB from "@/lib/db";
import Tutor from "@/models/tutor.model";
import TutorGroup from "@/models/tutorGroup.model";
import { UserCheck } from "lucide-react";
import { generateOSFAMetadata } from "@/lib/metadata";

export const revalidate = 0;

export const metadata = generateOSFAMetadata({
    path: "/admin/tutors",
    title: "Tutor Directory | TQP Admin",
    description: "View all active tutors, assigned groups, and student allocations.",
})

export default async function TutorsDirectoryPage() {
    await connectDB();
    const tutors = await Tutor.find().populate("user", "name email").lean();
    const groups = await TutorGroup.find().lean();

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-5">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Tutors Directory</h1>
                    <p className="text-sm text-zinc-500 mt-1">Manage assigned instructors and their active teaching loads.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-600">
                        <thead className="bg-zinc-50 text-xs font-semibold uppercase text-zinc-500 border-b border-zinc-200">
                            <tr>
                                <th className="px-6 py-3.5">Tutor</th>
                                <th className="px-6 py-3.5">Gender</th>
                                <th className="px-6 py-3.5">Specialization</th>
                                <th className="px-6 py-3.5">Assigned Groups</th>
                                <th className="px-6 py-3.5">Availability</th>
                                <th className="px-6 py-3.5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                            {tutors.map((tutor: any) => {
                                const assignedGroups = groups.filter((g) => g.tutor?.toString() === tutor._id.toString());
                                const totalStudents = assignedGroups.reduce((acc, g) => acc + (g.students?.length || 0), 0);

                                return (
                                    <tr key={tutor._id.toString()} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-purple-50 text-purple-600 rounded-full">
                                                    <UserCheck className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-zinc-900">{tutor.user?.name || "N/A"}</p>
                                                    <p className="text-xs text-zinc-400">{tutor.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 capitalize">{tutor.gender}</td>
                                        <td className="px-6 py-4 text-xs">{tutor.specialization || "General Quran Studies"}</td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-zinc-900">{assignedGroups.length} Groups</span>
                                            <span className="text-xs text-zinc-400 block">{totalStudents} Total Students</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {tutor.isAvailable ? (
                                                <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded border border-emerald-200">
                                                    Available
                                                </span>
                                            ) : (
                                                <span className="text-xs font-medium bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded">
                                                    Unavailable
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/admin/tutors/${tutor._id}`} className="text-xs font-semibold text-emerald-600 hover:underline">
                                                View Details
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