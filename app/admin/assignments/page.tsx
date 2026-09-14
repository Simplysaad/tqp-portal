import Link from "next/link";
import connectDB from "@/lib/db";
import Student from "@/models/student.model";
import TutorGroup from "@/models/tutorGroup.model";
import { UserCheck, ShieldAlert, ArrowRight } from "lucide-react";
import { generateOSFAMetadata } from "@/lib/metadata";

export const revalidate = 0;

export const metadata = generateOSFAMetadata({
    path: "/admin/assignments",
    title: "Manual Group Assignment | TQP Admin",
    description: "Manage student placements, resolve pending group requests, and inspect allocation rules.",
})

export default async function AssignmentsPage() {
    await connectDB();

    const [unassignedStudents, activeGroups] = await Promise.all([
        Student.find({ tutor: null }).populate("user", "name").lean(),
        TutorGroup.find({ isActive: true }).populate("students").lean(),
    ]);

    // console.log("unassignedStudents", unassignedStudents)

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-5">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Assignment Operations Workspace</h1>
                    <p className="text-sm text-zinc-500 mt-1">Manual student placement and group reassignments.</p>
                </div>
                <Link
                    href="/admin/assignments/batch"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors"
                >
                    Launch Auto-Assign Center
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Unassigned Students Column */}
                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                        <h2 className="font-bold text-zinc-900 flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-amber-500" />
                            Unassigned Students ({unassignedStudents.length})
                        </h2>
                    </div>
                    <div className="divide-y divide-zinc-100 max-h-[600px] overflow-y-auto pr-1">
                        {unassignedStudents.map((student: any) => (
                            <div key={student._id.toString()} className="py-3 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-sm text-zinc-900">{student.user?.name || "N/A"}</p>
                                    <p className="text-xs text-zinc-400">Gender: {student.gender} &bull; Juz: {student.currentMemorization?.juz || "N/A"}</p>
                                </div>
                                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Pending Placement</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Candidate Tutor Groups Column */}
                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                        <h2 className="font-bold text-zinc-900 flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-emerald-600" />
                            Candidate Groups ({activeGroups.length})
                        </h2>
                    </div>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                        {activeGroups.map((group: any) => {
                            const occupied = group.students?.length || 0;
                            const maxCapacity = group.rules?.maxCapacity || 5;

                            return (
                                <div key={group._id.toString()} className="p-4 border border-zinc-200 rounded-lg flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-sm text-zinc-900">{group.title}</p>
                                        <p className="text-xs text-zinc-400">Capacity: {occupied}/{maxCapacity} &bull; {group.rules?.femaleOnly ? "Female Only" : "Co-Ed"}</p>
                                    </div>
                                    <Link href={`/admin/groups/${group._id}`} className="text-xs font-semibold text-emerald-600 flex items-center gap-1 hover:underline">
                                        Assign <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}