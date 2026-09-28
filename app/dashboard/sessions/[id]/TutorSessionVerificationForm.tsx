// "use client";

// import React, { useState } from "react";
// import { useRouter } from "next/navigation";
// import Modal from "@/components/Modal";
// import EditSessionModalContent from "./EditSessionModalContent";
// import { verifyAndCompleteSession } from "@/actions/session.action";
// import {
//     AttendanceStatus,
//     PerformanceRating,
//     ISession,
//     IMemorizationRange,
//     INuruAlBayanRange,
// } from "@/models/session.model";
// import { MemorizationPosition } from "@/lib/quran";
// import { NuruAlBayanPosition } from "@/app/onboarding/BeginnerOnboarding";

// interface StudentInfo {
//     name: string;
// }

// interface TutorSessionVerificationFormProps {
//     session: Omit<ISession, "student"> & {
//         _id: string;
//         student?: any
//     };
//     tutorId: string;
// }

// export default function TutorSessionVerificationForm({
//     session,
//     tutorId,
// }: TutorSessionVerificationFormProps) {
//     const router = useRouter();

//     // Controlled Form State
//     const [attendance, setAttendance] = useState<AttendanceStatus>(
//         session.attendance || "present"
//     );
//     const [performance, setPerformance] = useState<PerformanceRating>(
//         session.performance || "good"
//     );
//     const [tutorsComment, setTutorsComment] = useState<string>(
//         session.tutorsComment || ""
//     );
//     const [newMemorization, setNewMemorization] = useState<
//         IMemorizationRange | ""
//     >(session.newMemorization);

//     const [newPosition, setNewPosition] = useState<
//         INuruAlBayanRange | ""
//     >(session.newPosition);
//     // const [revision, setRevision] = useState<IMemorizationRange | undefined>(
//     //     session.revision
//     // );

//     const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     const formatQuranPosition = (pos?: MemorizationPosition) => {
//         if (!pos || !pos.surah) return "Not logged";
//         return `${pos.surah} (Ayah ${pos.aayah || 1}${pos.page ? `, Page ${pos.page}` : ""
//             })`;
//     };

//     const formatNurulBayanPosition = (pos?: NuruAlBayanPosition) => {
//         if (!pos || !pos.chapter) return "Not logged";
//         return `${pos.chapter} (Ayah ${pos.section || ""}${pos.page ? `, Page ${pos.page}` : ""
//             })`;
//     };

//     const handleSaveVerifiedSession = async (
//         overrideAttendance?: AttendanceStatus
//     ) => {
//         setLoading(true);
//         setError(null);

//         const res = await verifyAndCompleteSession({
//             sessionId: session._id,
//             tutorId,
//             attendance: overrideAttendance || attendance,
//             performance,
//             tutorsComment,
//             newMemorization,
//             // revision,
//         });


//         setLoading(false);

//         if (res.success) {
//             router.push("/dashboard");
//             router.refresh();
//         } else {
//             setError(res.error || "Failed to verify session.");
//         }
//     };


//     const studentName = session.student?.user?.name ?? "Student";
//     // console.log("session.student", session.student)

//     return (
//         <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
//             <div className="flex justify-between items-start border-b pb-4">
//                 <div>
//                     <h2 className="text-xl font-bold text-gray-900">
//                         Verify Session Log
//                     </h2>
//                     <p className="text-sm text-gray-500">
//                         Student:
//                         <span className="font-medium text-gray-800 capitalize ms-1">{studentName}</span>
//                     </p>
//                 </div>
//                 <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
//                     Pending Verification
//                 </span>
//             </div>

//             {error && (
//                 <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
//                     {error}
//                 </div>
//             )}

//             {/* Student Logged Data Summary */}
//             <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-3">
//                 <div className="flex justify-between items-center">
//                     <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
//                         Student Logged Progress
//                     </span>
//                     <button
//                         type="button"
//                         onClick={() => setIsEditModalOpen(true)}
//                         className="text-xs text-emerald-600 font-medium hover:underline"
//                     >
//                         ✏️ Edit Ranges or Details
//                     </button>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                     <div>
//                         <span className="block text-xs text-gray-500">
//                             New Memorization:
//                         </span>
//                         <span className="font-medium text-gray-800">
//                             {formatQuranPosition(newMemorization?.start)} ➔{" "}
//                             {formatQuranPosition(newMemorization?.end)}
//                         </span>
//                     </div>
//                     <div>
//                         <span className="block text-xs text-gray-500">
//                             New Position:
//                         </span>
//                         <span className="font-medium text-gray-800">
//                             {formatNurulBayanPosition(newPosition?.start)} ➔{" "}
//                             {formatNurulBayanPosition(newPosition?.end)}
//                         </span>
//                     </div>
//                     {/* <div>
//                         <span className="block text-xs text-gray-500">Revision:</span>
//                         <span className="font-medium text-gray-800">
//                             {formatQuranPosition(revision?.start)} ➔{" "}
//                             {formatQuranPosition(revision?.end)}
//                         </span>
//                     </div> */}
//                 </div>
//             </div>

//             {/* Tutor Rating & Attendance Inputs */}
//             <div className="space-y-4">
//                 <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">
//                         Attendance Status
//                     </label>
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
//                         {(
//                             [
//                                 "present",
//                                 "partial",
//                                 "absent",
//                                 "cancelled",
//                             ] as AttendanceStatus[]
//                         ).map((status) => (
//                             <button
//                                 key={status}
//                                 type="button"
//                                 onClick={() => setAttendance(status)}
//                                 className={`py-2 text-xs font-medium rounded-lg border transition ${attendance === status
//                                     ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold"
//                                     : "border-gray-200 text-gray-600 hover:bg-gray-50"
//                                     }`}
//                             >
//                                 {status.toUpperCase()}
//                             </button>
//                         ))}
//                     </div>
//                 </div>

//                 <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">
//                         Performance Rating *
//                     </label>
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
//                         {(
//                             [
//                                 { label: "🌟 Excellent", val: "excellent" },
//                                 { label: "👍 Good", val: "good" },
//                                 { label: "👌 Fair", val: "fair" },
//                                 { label: "⚠️ Needs Work", val: "needs_work" },
//                             ] as const
//                         ).map((item) => (
//                             <button
//                                 key={item.val}
//                                 type="button"
//                                 onClick={() =>
//                                     setPerformance(item.val as PerformanceRating)
//                                 }
//                                 className={`py-2 text-xs font-medium rounded-lg border transition ${performance === item.val
//                                     ? "bg-emerald-600 text-white border-emerald-600"
//                                     : "border-gray-200 text-gray-700 hover:bg-gray-50"
//                                     }`}
//                             >
//                                 {item.label}
//                             </button>
//                         ))}
//                     </div>
//                 </div>

//                 <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">
//                         Tutor Feedback / Comment (Optional)
//                     </label>
//                     <textarea
//                         rows={3}
//                         value={tutorsComment}
//                         onChange={(e) => setTutorsComment(e.target.value)}
//                         placeholder="E.g., Great Tajweed today, work on makhraj for verse 12..."
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm outline-none"
//                     />
//                 </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="flex flex-col md:flex-row gap-3 pt-2">
//                 <button
//                     type="button"
//                     disabled={loading}
//                     onClick={() => handleSaveVerifiedSession()}
//                     className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg shadow-sm transition disabled:opacity-50"
//                 >
//                     {loading ? "Saving..." : "✅ Approve & Verify Session"}
//                 </button>
//             </div>

//             {/* Edit Session Modal */}
//             <Modal
//                 isOpen={isEditModalOpen}
//                 onClose={() => setIsEditModalOpen(false)}
//                 title="Edit Session Log"
//             >
//                 <EditSessionModalContent
//                     initialNewMem={newMemorization}
//                     // initialRev={revision}
//                     onSave={(updatedNewMem, updatedRev, updatedNewPosition) => {
//                         setNewMemorization(updatedNewMem);
//                         setNewPosition(updatedNewPosition)
//                         // setRevision(updatedRev);
//                         setIsEditModalOpen(false);
//                     }}
//                     onClose={() => setIsEditModalOpen(false)}
//                 />
//             </Modal>
//         </div>
//     );
// }




"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import EditSessionModalContent from "./EditSessionModalContent";
import { verifyAndCompleteSession } from "@/actions/session.action";
import {
    AttendanceStatus,
    PerformanceRating,
    ISession,
    IMemorizationRange,
    INuruAlBayanRange,
} from "@/models/session.model";
import { MemorizationPosition } from "@/lib/quran";
import { NuruAlBayanPosition } from "@/app/onboarding/BeginnerOnboarding";

interface TutorSessionVerificationFormProps {
    session: Omit<ISession, "student"> & {
        _id: string;
        student?: any;
    };
    tutorId: string;
}

export default function TutorSessionVerificationForm({
    session,
    tutorId,
}: TutorSessionVerificationFormProps) {
    const router = useRouter();

    // Check if the student is a beginner via program name or logged newPosition
    const isBeginner =
        session.student?.program === "beginner" || Boolean(session.newPosition);

    // Controlled Form State
    const [attendance, setAttendance] = useState<AttendanceStatus>(
        session.attendance || "present"
    );
    const [performance, setPerformance] = useState<PerformanceRating>(
        session.performance || "good"
    );
    const [tutorsComment, setTutorsComment] = useState<string>(
        session.tutorsComment || ""
    );
    const [newMemorization, setNewMemorization] = useState<
        IMemorizationRange | ""
    >(session.newMemorization || "");

    const [newPosition, setNewPosition] = useState<
        INuruAlBayanRange | ""
    >(session.newPosition || "");

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formatQuranPosition = (pos?: MemorizationPosition) => {
        if (!pos || !pos.surah) return "Not logged";
        return `${pos.surah} (Ayah ${pos.aayah || 1}${pos.page ? `, Page ${pos.page}` : ""
            })`;
    };

    const formatNurulBayanPosition = (pos?: NuruAlBayanPosition) => {
        if (!pos || !pos.chapter) return "Not logged";
        const details = [];
        if (pos.section) details.push(`Section: ${pos.section}`);
        if (pos.page) details.push(`Page ${pos.page}`);
        return `${pos.chapter}${details.length ? ` (${details.join(", ")})` : ""}`;
    };

    const handleSaveVerifiedSession = async (
        overrideAttendance?: AttendanceStatus
    ) => {
        setLoading(true);
        setError(null);

        const res = await verifyAndCompleteSession({
            sessionId: session._id,
            tutorId,
            attendance: overrideAttendance || attendance,
            performance,
            tutorsComment,
            newMemorization: !isBeginner && newMemorization ? newMemorization : undefined,
            newPosition: isBeginner && newPosition ? newPosition : undefined,
        });

        setLoading(false);

        if (res.success) {
            router.push("/dashboard");
            router.refresh();
        } else {
            setError(res.error || "Failed to verify session.");
        }
    };

    const studentName = session.student?.user?.name ?? "Student";

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-start border-b pb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-gray-900">
                            Verify Session Log
                        </h2>
                        {isBeginner && (
                            <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                                Nuru Al-Bayan
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500">
                        Student:
                        <span className="font-medium text-gray-800 capitalize ms-1">
                            {studentName}
                        </span>
                    </p>
                </div>
                <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                    Pending Verification
                </span>
            </div>

            {error && (
                <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            {/* Student Logged Data Summary */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {isBeginner ? "Nuru Al-Bayan Progress" : "Student Logged Progress"}
                    </span>
                    <button
                        type="button"
                        onClick={() => setIsEditModalOpen(true)}
                        className="text-xs text-emerald-600 font-medium hover:underline"
                    >
                        ✏️ Edit Details
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {isBeginner ? (
                        <div>
                            <span className="block text-xs text-gray-500">
                                Nuru Al-Bayan Position:
                            </span>
                            <span className="font-medium text-gray-800">
                                {typeof newPosition === "object" && newPosition?.start
                                    ? formatNurulBayanPosition(newPosition.start)
                                    : "Not logged"}
                                {" ➔ "}
                                {typeof newPosition === "object" && newPosition?.end
                                    ? formatNurulBayanPosition(newPosition.end)
                                    : "Not logged"}
                            </span>
                        </div>
                    ) : (
                        <div>
                            <span className="block text-xs text-gray-500">
                                New Memorization:
                            </span>
                            <span className="font-medium text-gray-800">
                                {typeof newMemorization === "object" && newMemorization?.start
                                    ? formatQuranPosition(newMemorization.start)
                                    : "Not logged"}
                                {" ➔ "}
                                {typeof newMemorization === "object" && newMemorization?.end
                                    ? formatQuranPosition(newMemorization.end)
                                    : "Not logged"}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Tutor Rating & Attendance Inputs */}
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Attendance Status
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {(
                            [
                                "present",
                                "partial",
                                "absent",
                                "cancelled",
                            ] as AttendanceStatus[]
                        ).map((status) => (
                            <button
                                key={status}
                                type="button"
                                onClick={() => setAttendance(status)}
                                className={`py-2 text-xs font-medium rounded-lg border transition ${attendance === status
                                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold"
                                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                {status.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Performance Rating *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {(
                            [
                                { label: "🌟 Excellent", val: "excellent" },
                                { label: "👍 Good", val: "good" },
                                { label: "👌 Fair", val: "fair" },
                                { label: "⚠️ Needs Work", val: "needs_work" },
                            ] as const
                        ).map((item) => (
                            <button
                                key={item.val}
                                type="button"
                                onClick={() =>
                                    setPerformance(item.val as PerformanceRating)
                                }
                                className={`py-2 text-xs font-medium rounded-lg border transition ${performance === item.val
                                        ? "bg-emerald-600 text-white border-emerald-600"
                                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Tutor Feedback / Comment (Optional)
                    </label>
                    <textarea
                        rows={3}
                        value={tutorsComment}
                        onChange={(e) => setTutorsComment(e.target.value)}
                        placeholder={
                            isBeginner
                                ? "E.g., Good progress on Sukoon and Tanween rules..."
                                : "E.g., Great Tajweed today, work on makhraj for verse 12..."
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm outline-none"
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-3 pt-2">
                <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSaveVerifiedSession()}
                    className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg shadow-sm transition disabled:opacity-50"
                >
                    {loading ? "Saving..." : "✅ Approve & Verify Session"}
                </button>
            </div>

            {/* Edit Session Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Session Log"
            >
                <EditSessionModalContent
                    initialNewMem={newMemorization}
                    initialNewPosition={newPosition}
                    isBeginner={isBeginner}
                    onSave={(updatedNewMem, updatedRev, updatedNewPosition) => {
                        if (updatedNewMem !== undefined) setNewMemorization(updatedNewMem);
                        if (updatedNewPosition !== undefined) setNewPosition(updatedNewPosition);
                        setIsEditModalOpen(false);
                    }}
                    onClose={() => setIsEditModalOpen(false)}
                />
            </Modal>
        </div>
    );
}