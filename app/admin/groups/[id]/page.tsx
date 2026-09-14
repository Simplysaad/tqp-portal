import { notFound } from "next/navigation";
import Link from "next/link";
import connectDB from "@/lib/db";
import TutorGroup from "@/models/tutorGroup.model";
import { Users, ArrowLeft } from "lucide-react";
import { generateOSFAMetadata } from "@/lib/metadata";

export const revalidate = 0;

export async function generateMetadata({ params }: { params: any }) {

    const { id } = await params;

    return generateOSFAMetadata({
        path: `/admin/groups/${id}`,
        title: "Manage Tutor Group | TQP Admin",
        description: "Edit group rules, reassign students, update capacity, and manage complete circle rosters.",
    })
}

export default async function TutorGroupDetailPage({ params }: { params: { id: string } }) {
    await connectDB();

    const { id } = await params
    const group = await TutorGroup.findById(id)
        .populate({ path: "tutor", populate: { path: "user", select: "name email" } })
        .populate({ path: "students", populate: { path: "user", select: "name email" } })
        .lean();

    if (!group) notFound();

    const currentStudents = group.students || [];
    const maxCapacity = group.rules?.maxCapacity || 5;

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6">
            <Link href="/admin/groups" className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to All Groups
            </Link>

            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">{group.title}</h1>
                    <p className="text-sm text-zinc-500 mt-1">Instructor: {((group.tutor as any)?.user)?.name || "N/A"}</p>
                </div>
                <div className="text-right">
                    <span className="text-lg font-bold text-zinc-900">{currentStudents.length} / {maxCapacity}</span>
                    <p className="text-xs text-zinc-400">Enrolled Students</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-base font-semibold text-zinc-900">Enrolled Roster</h2>
                    </div>
                    <Link href="/admin/assignments" className="text-xs font-semibold text-emerald-600 hover:underline">
                        Assign Students
                    </Link>
                </div>

                {currentStudents.length === 0 ? (
                    <p className="text-sm text-zinc-500 py-4">No students currently enrolled in this group.</p>
                ) : (
                    <div className="divide-y divide-zinc-100">
                        {currentStudents.map((std: any) => (
                            <div key={std._id.toString()} className="py-3 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-sm text-zinc-900">{std.user?.name || "N/A"}</p>
                                    <p className="text-xs text-zinc-400">Juz {std.currentMemorization?.juz || "N/A"} &bull; {std.gender}</p>
                                </div>
                                <Link href={`/admin/students/${std._id}`} className="text-xs font-medium text-zinc-600 hover:text-emerald-600">
                                    Profile &rarr;
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}