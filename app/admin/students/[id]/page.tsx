import { notFound } from "next/navigation";
import Link from "next/link";
import connectDB from "@/lib/db";
import Student from "@/models/student.model";
import TutorGroup from "@/models/tutorGroup.model";
import { User, BookOpen, Building2, ShieldCheck, ArrowLeft } from "lucide-react";
import { generateOSFAMetadata } from "@/lib/metadata";

export const revalidate = 0;

export async function generateMetadata({ params }: { params: any }) {
    const { id } = await params

    return generateOSFAMetadata({
        path: `/admin/students/${id}`,
        title: "Student Profile Management | TQP Admin",
        description: "View detailed student progress, edit memorisation levels, and inspect group history.",
    })
}

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
    await connectDB();

    const { id } = await params
    const student = await Student.findById(id)
        .populate("user", "name email")
        // .populate("tutor")
        .lean();

    if (!student) {
        notFound();

        // console.log("student not found")
        // return
    }

    const assignedGroup = await TutorGroup.findOne({ students: student._id })
        .populate({ path: "tutor", populate: { path: "user", select: "name" } })
        .lean();

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6">
            <Link href="/admin/students" className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Students Directory
            </Link>

            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
                        <User className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900">{(student.user as any)?.name || "N/A"}</h1>
                        <p className="text-sm text-zinc-500">{(student.user as any)?.email} &bull; Matric: {student.matricNumber || "N/A"}</p>
                    </div>
                </div>
                <span className="capitalize text-xs font-semibold px-3 py-1 bg-zinc-100 text-zinc-700 rounded-full">
                    Status: {student.status}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Academic Profile */}
                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                        <Building2 className="w-5 h-5 text-zinc-500" />
                        <h2 className="text-base font-semibold text-zinc-900">Academic Info</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-xs text-zinc-400">Gender</p>
                            <p className="font-medium text-zinc-800 capitalize">{student.gender}</p>
                        </div>
                        <div>
                            <p className="text-xs text-zinc-400">Level</p>
                            <p className="font-medium text-zinc-800">{student.level || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-zinc-400">Faculty</p>
                            <p className="font-medium text-zinc-800">{student.faculty || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-zinc-400">Department</p>
                            <p className="font-medium text-zinc-800">{student.department || "N/A"}</p>
                        </div>
                    </div>
                </div>

                {/* Memorization Progress */}
                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                        <BookOpen className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-base font-semibold text-zinc-900">Memorization Level</h2>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between bg-zinc-50 p-3 rounded-lg">
                            <span className="text-sm font-medium text-zinc-700">Current Juz</span>
                            <span className="text-lg font-bold text-emerald-600">Juz {student.currentMemorization?.juz || "N/A"}</span>
                        </div>
                        <p className="text-xs text-zinc-400">
                            Surah: {student.currentMemorization?.surah || "N/A"} &bull; Ayah: {student.currentMemorization?.aayah || "N/A"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Assigned Tutor Group */}
            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-base font-semibold text-zinc-900">Assigned Tutor Group</h2>
                    </div>
                    <Link href="/admin/assignments" className="text-xs font-semibold text-emerald-600 hover:underline">
                        Reassign Student
                    </Link>
                </div>

                {assignedGroup ? (
                    <div className="flex items-center justify-between bg-indigo-50/50 border border-indigo-100 p-4 rounded-lg">
                        <div>
                            <p className="font-bold text-zinc-900">{assignedGroup.title}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">Tutor: {((assignedGroup.tutor as any)?.user)?.name || "Unassigned"}</p>
                        </div>
                        <Link href={`/admin/groups/${assignedGroup._id}`} className="text-xs font-semibold text-indigo-700 hover:underline">
                            View Group Details &rarr;
                        </Link>
                    </div>
                ) : (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                        Student is currently unassigned to any active tutor group.
                    </div>
                )}
            </div>
        </div>
    );
}