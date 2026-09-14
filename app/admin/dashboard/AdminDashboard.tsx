import Link from "next/link";
import { Users, UserCheck, ShieldAlert, Layers, ArrowUpRight, CheckCircle2, AlertCircle } from "lucide-react";
import connectDB from "@/lib/db";
import Student from "@/models/student.model";
import TutorGroup from "@/models/tutorGroup.model";
import Tutor from "@/models/tutor.model";

export const revalidate = 0;

export default async function AdminDashboardPage() {
    await connectDB();

    const [totalStudents, unassignedCount, activeGroups, totalTutors] = await Promise.all([
        Student.countDocuments({ status: "active" }),
        Student.countDocuments({ tutor: { $exists: false } }),
        TutorGroup.find({ isActive: true }).lean(),
        Tutor.countDocuments(),
    ]);

    const totalCapacity = activeGroups.reduce((acc, g) => acc + (g.rules?.maxCapacity ?? 5), 0);
    const totalOccupied = activeGroups.reduce((acc, g) => acc + (g.students?.length ?? 0), 0);
    const capacityPercentage = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

    return (
        <div className="space-y-8 p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-200 pb-5">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Admin Analytics Dashboard</h1>
                    <p className="text-sm text-zinc-500 mt-1">Real-time system occupancy, assignment status, and student distribution.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/assignments/batch"
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-4 py-2.5 rounded-lg transition-colors shadow-sm"
                    >
                        Run Auto-Assignment
                        <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold tracking-wider uppercase text-zinc-500">Active Students</span>
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="text-3xl font-bold text-zinc-900">{totalStudents}</span>
                        <p className="text-xs text-zinc-500 mt-1">Enrolled across all faculties</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold tracking-wider uppercase text-zinc-500">Unassigned Students</span>
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="text-3xl font-bold text-amber-600">{unassignedCount}</span>
                        <p className="text-xs text-zinc-500 mt-1">Awaiting tutor group allocation</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold tracking-wider uppercase text-zinc-500">Active Tutor Groups</span>
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                            <Layers className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="text-3xl font-bold text-zinc-900">{activeGroups.length}</span>
                        <p className="text-xs text-zinc-500 mt-1">Operational teaching units</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold tracking-wider uppercase text-zinc-500">Total Tutors</span>
                        <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
                            <UserCheck className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="text-3xl font-bold text-zinc-900">{totalTutors}</span>
                        <p className="text-xs text-zinc-500 mt-1">Verified academic instructors</p>
                    </div>
                </div>
            </div>

            {/* System Capacity Gauge */}
            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-zinc-900">Total System Group Occupancy</h2>
                        <p className="text-xs text-zinc-500">Aggregated capacity utilization across active groups</p>
                    </div>
                    <span className="text-sm font-semibold text-zinc-900">{totalOccupied} / {totalCapacity} Slots ({capacityPercentage}%)</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-3 overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ${capacityPercentage > 90 ? "bg-red-500" : capacityPercentage > 75 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                    />
                </div>
            </div>

            {/* Active Groups Overview Table */}
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-zinc-900">Active Tutor Groups Utilization</h2>
                    <Link href="/admin/groups" className="text-xs font-medium text-emerald-600 hover:underline">View All Groups &rarr;</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-600">
                        <thead className="bg-zinc-50 text-xs font-semibold uppercase text-zinc-500 border-b border-zinc-200">
                            <tr>
                                <th className="px-6 py-3.5">Group ID</th>
                                <th className="px-6 py-3.5">Capacity</th>
                                <th className="px-6 py-3.5">Rules Enforcement</th>
                                <th className="px-6 py-3.5">Status</th>
                                <th className="px-6 py-3.5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                            {activeGroups.slice(0, 5).map((group: any) => {
                                const occupied = group.students?.length || 0;
                                const max = group.rules?.maxCapacity || 5;
                                const isFull = occupied >= max;

                                return (
                                    <tr key={group._id.toString()} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-zinc-900">{group.name || group._id.toString()}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-zinc-900">{occupied}/{max}</span>
                                                <div className="w-20 bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                                                    <div className="bg-emerald-500 h-full" style={{ width: `${(occupied / max) * 100}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {group.rules?.femaleOnly && (
                                                    <span className="bg-pink-50 text-pink-700 text-xs px-2 py-0.5 rounded font-medium border border-pink-200">Female Only</span>
                                                )}
                                                {group.rules?.memorizationRange?.start?.juz && (
                                                    <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded font-medium border border-indigo-200">
                                                        Juz {group.rules.memorizationRange.start.juz}-{group.rules.memorizationRange.end?.juz}
                                                    </span>
                                                )}
                                                {!group.rules?.femaleOnly && !group.rules?.memorizationRange?.start?.juz && (
                                                    <span className="text-zinc-400 text-xs">Standard Co-ed</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {isFull ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                                                    <AlertCircle className="w-3 h-3" /> Full
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                    <CheckCircle2 className="w-3 h-3" /> Open
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/admin/groups/${group._id}`} className="text-xs font-medium text-zinc-700 hover:text-emerald-600">
                                                Details &rarr;
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