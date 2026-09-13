import connectDB from "@/lib/db";
import Student from "@/models/student.model";
import TutorGroup from "@/models/tutorGroup.model";
import { getSession } from "@/actions/user.action";
import { enrollWithTutor } from "@/actions/enrollment.action";
import EnrollTutorButton from "@/components/EnrollButton";
import { redirect } from "next/navigation";
import { Calendar, Clock } from "lucide-react";

function minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

interface PageProps {
    searchParams: Promise<{ tutor_id?: string; error?: string; message?: string }>;
}

export default async function EnrollPage({ searchParams }: PageProps) {
    const { tutor_id, error, message } = await searchParams;

    await connectDB();
    const currentUser = await getSession();

    // 1. Authentication Check
    if (!currentUser) {
        const nextUrl = tutor_id ? `/enroll?tutor_id=${tutor_id}` : "/enroll";
        redirect(`/login?next=${encodeURIComponent(nextUrl)}`);
    }

    if (currentUser.role !== "student") {
        redirect("/dashboard");
    }

    // 2. Direct Server Action Flow (When tutor_id is provided in URL params)
    if (tutor_id) {
        const res = await enrollWithTutor(tutor_id);

        if (!res.success) {
            redirect(`/dashboard?error=${encodeURIComponent(res.error || "Enrollment failed")}`);
        } else {
            redirect(`/dashboard?message=${encodeURIComponent(res.message || "Enrolled successfully!")}`);
        }
    }

    // 3. Fallback: Fetch student record & populated tutor groups for selection UI
    let currentStudentId: string | null = null;
    const student = await Student.findOne({ user: currentUser.id }).lean();
    if (student) {
        currentStudentId = student._id.toString();
    }

    // Populate both sibling references ('tutor' with nested 'user', and 'schedules')
    const tutorGroups = await TutorGroup.find({ isActive: true })
        .populate({
            path: "tutor",
            populate: {
                path: "user",
                select: "name email avatar",
            },
        })
        .populate("schedules")
        .lean();

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                    {error}
                </div>
            )}
            {message && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl">
                    {message}
                </div>
            )}

            <div>
                <h1 className="text-3xl font-bold text-gray-900">Choose a Tutor</h1>
                <p className="text-gray-600 text-sm mt-1">
                    Select a tutor to commit to all of their weekly class schedules. Tutors take a maximum of 5 students.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tutorGroups.map((tutorGroup: any) => {
                    const tutor = tutorGroup.tutor;
                    const tutorIdStr = tutor?._id ? tutor._id.toString() : "";
                    const groupSchedules = tutorGroup.schedules || [];

                    // Retrieve enrolled students directly from tutorGroup
                    const enrolledStudents = tutorGroup.students || [];
                    const totalEnrolled = enrolledStudents.length;

                    // Capacity calculation
                    const maxCapacity = tutorGroup.rules?.maxCapacity || 5;
                    const isFilled = totalEnrolled >= maxCapacity;

                    // Enrollment check
                    const isAlreadyEnrolled = currentStudentId
                        ? enrolledStudents.some(
                            (st: any) => (st._id ? st._id.toString() : st.toString()) === currentStudentId
                        )
                        : false;

                    return (
                        <div
                            key={tutorGroup._id.toString()}
                            className="border rounded-xl p-6 bg-white shadow-sm flex flex-col justify-between space-y-5 hover:border-emerald-300 transition"
                        >
                            <div className="space-y-4">
                                {/* Header Info */}
                                <div className="flex justify-between items-start border-b pb-3">
                                    <div>
                                        <h2 className="font-bold text-lg text-gray-900">
                                            {tutor?.user?.name
                                                ? `${tutor.gender === "female" ? "Ustadhah" : "Ustadh"} ${tutor.user.name.split(" ")[1] || tutor.user.name
                                                }`
                                                : "Qur'an Tutor"}
                                        </h2>
                                        <p className="text-xs text-gray-500">{tutor?.bio}</p>
                                    </div>
                                    <span
                                        className={`text-xs px-2.5 py-1 rounded-full font-bold ${isFilled
                                            ? "bg-red-100 text-red-700"
                                            : "bg-emerald-100 text-emerald-800"
                                            }`}
                                    >
                                        {totalEnrolled} / {maxCapacity} Enrolled
                                    </span>
                                </div>

                                {/* Timetable Section */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Weekly Class Timetable
                                    </h4>
                                    {groupSchedules.length > 0 ? (
                                        <div className="space-y-1.5">
                                            {groupSchedules.map((slot: any) => (
                                                <div
                                                    key={slot._id.toString()}
                                                    className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border text-xs"
                                                >
                                                    <span className="inline-flex items-center gap-1.5 font-semibold text-gray-800 capitalize">
                                                        <Calendar className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                                                        {slot.dayOfWeek}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1.5 font-mono text-emerald-700 font-medium">
                                                        <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                        {minutesToTime(slot.startTime)} - {minutesToTime(slot.endTime)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 italic py-2">
                                            No weekly schedules published yet.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Action Button */}
                            <EnrollTutorButton
                                tutorId={tutorIdStr}
                                isFilled={isFilled}
                                isAlreadyEnrolled={isAlreadyEnrolled}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}