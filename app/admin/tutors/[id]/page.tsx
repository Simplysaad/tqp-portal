import { notFound } from "next/navigation";
import Link from "next/link";
import connectDB from "@/lib/db";
import Tutor from "@/models/tutor.model";
import TutorGroup from "@/models/tutorGroup.model";
import { UserCheck, Layers, ArrowLeft } from "lucide-react";
import { generateOSFAMetadata } from "@/lib/metadata";

export const revalidate = 0;

export async function generateMetadata({ params }: { params: any }) {
    const { id } = await params

    return generateOSFAMetadata({
        path: `/admin/tutors/${id}`,
        title: "Tutor Profile & Group Details | TQP Admin",
        description: "Manage tutor profiles, inspect assigned learning groups, and monitor group performance.",
    })
}

export default async function TutorDetailPage({ params }: { params: { id: string } }) {
    await connectDB();

    const { id } = await params
    const tutor = await Tutor.findById(id).populate("user", "name email").lean();
    if (!tutor) {
        notFound();
        // console.log("tutorId", id)
    }

    const groups = await TutorGroup.find({ tutor: tutor?._id }).lean();

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6">
            <Link href="/admin/tutors" className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Tutors Directory
            </Link>

            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-full">
                        <UserCheck className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900">{(tutor.user as any)?.name || "N/A"}</h1>
                        <p className="text-sm text-zinc-500">{(tutor.user as any)?.email} &bull; </p>
                    </div>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${tutor.isActive ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-600"}`}>
                    {tutor.isActive ? "Active / Available" : "Unavailable"}
                </span>
            </div>

            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                    <Layers className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-base font-semibold text-zinc-900">Managed Classes ({groups.length})</h2>
                </div>

                {groups.length === 0 ? (
                    <p className="text-sm text-zinc-500 py-4">No tutor groups assigned to this instructor.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {groups.map((group) => (
                            <div key={group._id.toString()} className="p-4 border border-zinc-200 rounded-lg hover:border-emerald-500 transition-colors">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-zinc-900">{group.title}</h3>
                                    <span className="text-xs bg-zinc-100 px-2 py-0.5 rounded font-medium">
                                        {group.students?.length || 0} / {group.rules?.maxCapacity || 5} Students
                                    </span>
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-xs text-zinc-400">Rules: {group.rules?.femaleOnly ? "Female Only" : "Co-Ed"}</span>
                                    <Link href={`/admin/groups/${group._id}`} className="text-xs font-semibold text-emerald-600 hover:underline">
                                        View Group &rarr;
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