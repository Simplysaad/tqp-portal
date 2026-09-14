import Link from "next/link";
import connectDB from "@/lib/db";
import TutorGroup from "@/models/tutorGroup.model";
import { Layers, Plus, Users } from "lucide-react";

export const revalidate = 0;

export default async function GroupsDirectoryPage() {
    await connectDB();
    const groups = await TutorGroup.find()
        .populate({ path: "tutor", populate: { path: "user", select: "name" } })
        .lean();

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-5">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Tutor Groups</h1>
                    <p className="text-sm text-zinc-500 mt-1">Manage learning units, capacity constraints, and group rules.</p>
                </div>
                <Link
                    href="/admin/groups/create"
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" /> Create New Group
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group: any) => {
                    const occupied = group.students?.length || 0;
                    const maxCapacity = group.rules?.maxCapacity || 5;
                    const tutorName = group.tutor?.user?.name || "Unassigned";

                    return (
                        <div key={group._id.toString()} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between space-y-4">
                            <div>
                                <div className="flex items-center justify-between">
                                    <h2 className="font-bold text-lg text-zinc-900">{group.title}</h2>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${group.isActive ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
                                        {group.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">Instructor: {tutorName}</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium text-zinc-600">
                                    <span>Capacity Utilization</span>
                                    <span>{occupied} / {maxCapacity}</span>
                                </div>
                                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full" style={{ width: `${Math.min((occupied / maxCapacity) * 100, 100)}%` }} />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-zinc-100">
                                {group.rules?.femaleOnly && (
                                    <span className="text-xs bg-pink-50 text-pink-700 px-2 py-0.5 rounded font-medium border border-pink-200">Female Only</span>
                                )}
                                {group.rules?.memorizationRange?.start?.juz && (
                                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium border border-indigo-200">
                                        Juz {group.rules.memorizationRange.start.juz}-{group.rules.memorizationRange.end?.juz}
                                    </span>
                                )}
                            </div>

                            <Link
                                href={`/admin/groups/${group._id}`}
                                className="w-full text-center block bg-zinc-50 hover:bg-zinc-100 text-zinc-700 font-semibold text-xs py-2 rounded-lg transition-colors border border-zinc-200"
                            >
                                Manage Group
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}