"use client";

import React, { useState, useMemo, useEffect } from "react";
import SearchableSelect from "@/components/SearchableSelect";
import { fetchStudentAction, logBeginnerStudentProgress, logStudentProgress } from "@/actions/session.action";
import { NuruAlBayanPosition } from "@/app/onboarding/BeginnerOnboarding";
import { NURU_AL_BAYAN_ENTRIES } from "@/lib/nuralbayan"; // Adjust import path as needed
import { getStudent } from "@/lib/db";
import { redirect } from "next/navigation";

interface LogProgressFormProps {
    sessionId: string;
    studentId: string;
    onSuccess?: () => void;
}

export default function BeginnerLogProgressForm({
    sessionId,
    studentId,
    onSuccess,
}: LogProgressFormProps) {
    const [startPos, setStartPos] = useState<NuruAlBayanPosition>({
        chapter: "",
        page: 1,
        index: 0,
        section: "",
    });

    const [endPos, setEndPos] = useState<NuruAlBayanPosition>({
        chapter: "",
        page: 1,
        index: 0,
        section: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);


    useEffect(() => {
        async function getPosition() {
            // const student = await getStudent(studentId)

            // if (!student?.currentPosition) return

            // setStartPos({
            //     chapter: student?.currentPosition?.chapter,
            //     page: student?.currentPosition?.page,
            //     index: student?.currentPosition?.index,
            //     section: student?.currentPosition?.section
            // })
        }

        getPosition()
    }, [])


    // Format options for SearchableSelect dropdowns
    const chapterOptions = useMemo(() => {
        return NURU_AL_BAYAN_ENTRIES.map((item) => ({
            label: `${item.index}. ${item.chapter} (${item.section}) - Page ${item.page}`,
            value: `${item.index}. ${item.chapter}`,
        }));
    }, []);

    // Fetch current student position on mount
    useEffect(() => {
        async function getStudentInfo() {
            if (!studentId) return;

            const student = await fetchStudentAction(studentId);
            if (student?.currentPosition) {
                setStartPos(student.currentPosition);
            }
        }
        getStudentInfo();
    }, [studentId]);

    // Handle position selection for Start Position
    const handleStartChapterChange = (val: string) => {
        const selectedIndex = parseInt(val.split(".")[0], 10);
        const selectedEntry = NURU_AL_BAYAN_ENTRIES.find(
            (item) => item.index === selectedIndex
        );

        if (selectedEntry) {
            setStartPos({
                index: selectedEntry.index,
                section: selectedEntry.section,
                chapter: selectedEntry.chapter,
                page: selectedEntry.page,
            });
        }
    };

    // Handle position selection for End Position
    const handleEndChapterChange = (val: string) => {
        const selectedIndex = parseInt(val.split(".")[0], 10);
        const selectedEntry = NURU_AL_BAYAN_ENTRIES.find(
            (item) => item.index === selectedIndex
        );

        if (selectedEntry) {
            setEndPos({
                index: selectedEntry.index,
                section: selectedEntry.section,
                chapter: selectedEntry.chapter,
                page: selectedEntry.page,
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);

        if (!startPos.chapter || !endPos.chapter) {
            setError("Please select both starting and ending Nuru Al-Bayan positions.");
            return;
        }

        if (endPos.index < startPos.index) {
            setError("Ending position cannot be behind starting position.");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                sessionId,
                studentId,
                newPosition: { start: startPos, end: endPos },
            };

            const res = await logBeginnerStudentProgress(payload);
            console.log("res", res)

            if (res.success) {
                setSuccessMsg("Nuru Al-Bayan progress submitted for tutor verification!");
                if (onSuccess) onSuccess();
            } else {
                setError(res.error || "Failed to log progress.");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred while logging progress.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm"
        >
            <div>
                <h3 className="text-lg font-semibold text-gray-900">
                    Log Today's Nuru Al-Bayan Lesson
                </h3>
                <p className="text-sm text-gray-500">
                    Record the range of lessons covered in class for your tutor to verify.
                </p>
            </div>

            {error && (
                <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            {successMsg && (
                <div className="p-3 text-sm text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200">
                    {successMsg}
                </div>
            )}

            {/* START POSITION */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wider">
                    Start Position
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Chapter / Lesson *
                        </label>
                        <SearchableSelect
                            options={chapterOptions}
                            value={startPos.chapter ? `${startPos.index}. ${startPos.chapter}` : ""}
                            onChange={handleStartChapterChange}
                            placeholder="Select Start Chapter..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Page (Auto)
                        </label>
                        <input
                            type="number"
                            value={startPos.page || ""}
                            disabled
                            placeholder="Auto-filled"
                            className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 rounded-lg text-sm cursor-not-allowed outline-none"
                        />
                    </div>
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* END POSITION */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wider">
                    End Position
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Chapter / Lesson *
                        </label>
                        <SearchableSelect
                            options={chapterOptions}
                            value={endPos.chapter ? `${endPos.index}. ${endPos.chapter}` : ""}
                            onChange={handleEndChapterChange}
                            placeholder="Select End Chapter..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Page (Auto)
                        </label>
                        <input
                            type="number"
                            value={endPos.page || ""}
                            disabled
                            placeholder="Auto-filled"
                            className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 rounded-lg text-sm cursor-not-allowed outline-none"
                        />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                onClick={() => {
                    redirect("/dashboard")
                }}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition disabled:opacity-50 text-sm"
            >
                {loading ? "Submitting Log..." : "Submit Progress for Verification"}
            </button>
        </form>
    );
}