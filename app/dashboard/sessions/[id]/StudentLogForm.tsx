"use client";

import React, { useState, useMemo, useEffect } from "react";
import SearchableSelect from "@/components/SearchableSelect";
import { logStudentProgress } from "@/actions/session.action";
import { fetchMemorizationPositionAction } from "@/actions/quran.action"; // 👈 Import server action
import { QURAN_SURAHS } from "@/lib/surah";
import { MemorizationPosition } from "@/lib/quran";
import { IStudentLogPayload } from "@/types";
import { getStudent } from "@/lib/db";

interface LogProgressFormProps {
    sessionId: string;
    studentId: string;
    onSuccess?: () => void;
}

export default function LogProgressForm({
    sessionId,
    studentId,
    onSuccess,
}: LogProgressFormProps) {
    const [startPos, setStartPos] = useState<MemorizationPosition>({
        surah: "",
        aayah: "",
        page: "",
    });
    const [endPos, setEndPos] = useState<MemorizationPosition>({
        surah: "",
        aayah: "",
        page: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const surahOptions = useMemo(() => {
        return QURAN_SURAHS.map((s: any) => ({
            label: `${s.number}. ${s.name} (${s.totalAayahs} Ayahs)`,
            value: s.name,
        }));
    }, []);

    const getMaxAyahs = (surahName: string): number => {
        if (!surahName) return 286;
        const found = QURAN_SURAHS.find(
            (s: any) => s.name.toLowerCase() === surahName.toLowerCase()
        );
        return found ? (found as any).totalAayahs : 286;
    };

    const startMaxAyahs = useMemo(() => getMaxAyahs(startPos.surah), [startPos.surah]);
    const endMaxAyahs = useMemo(() => getMaxAyahs(endPos.surah), [endPos.surah]);

    // Derive Start Page


    useEffect(() => {
        let student = getStudent(studentId).then((student) => {
            if (student?.currentMemorization) setStartPos(student?.currentMemorization)
        })
    }, [])

    useEffect(() => {
        let isMounted = true;

        if (!startPos.surah || startPos.aayah === "") {
            setStartPos((prev) => (prev.page === "" ? prev : { ...prev, page: "" }));
            return;
        }

        async function fetchStartPage() {
            const res = await fetchMemorizationPositionAction(
                startPos.surah,
                Number(startPos.aayah)
            );

            if (isMounted) {
                if (res.success && res.pos?.page) {
                    setStartPos((prev) => ({ ...prev, page: res.pos.page }));
                } else {
                    setStartPos((prev) => ({ ...prev, page: "" }));
                }
            }
        }

        fetchStartPage();

        return () => {
            isMounted = false;
        };
    }, [startPos.surah, startPos.aayah]);

    // Derive End Page
    useEffect(() => {
        let isMounted = true;

        if (!endPos.surah || endPos.aayah === "") {
            setEndPos((prev) => (prev.page === "" ? prev : { ...prev, page: "" }));
            return;
        }

        async function fetchEndPage() {
            const res = await fetchMemorizationPositionAction(
                endPos.surah,
                Number(endPos.aayah)
            );

            if (isMounted) {
                if (res.success && res.pos?.page) {
                    setEndPos((prev) => ({ ...prev, page: res.pos.page }));
                } else {
                    setEndPos((prev) => ({ ...prev, page: "" }));
                }
            }
        }

        fetchEndPage();

        return () => {
            isMounted = false;
        };
    }, [endPos.surah, endPos.aayah]);

    const handleStartSurahChange = (val: string) => {
        setStartPos((prev) => ({
            surah: val,
            aayah: prev.aayah !== "" && Number(prev.aayah) > getMaxAyahs(val) ? "" : prev.aayah,
            page: "",
        }));
    };

    const handleEndSurahChange = (val: string) => {
        setEndPos((prev) => ({
            surah: val,
            aayah: prev.aayah !== "" && Number(prev.aayah) > getMaxAyahs(val) ? "" : prev.aayah,
            page: "",
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);

        if (!startPos.surah || !endPos.surah) {
            setError("Please select both starting and ending Surahs.");
            return;
        }

        if (startPos.aayah === "" || endPos.aayah === "") {
            setError("Please specify starting and ending Ayah numbers.");
            return;
        }

        setLoading(true);

        try {
            const startRes = await fetchMemorizationPositionAction(
                startPos.surah,
                Number(startPos.aayah)
            );
            const endRes = await fetchMemorizationPositionAction(
                endPos.surah,
                Number(endPos.aayah)
            );

            if (!startRes.success || !endRes.success || !startRes.pos || !endRes.pos) {
                throw new Error("Could not compute Quranic position for selected verses.");
            }

            const payload: IStudentLogPayload = {
                sessionId,
                studentId,
                newMemorization: { start: startRes.pos, end: endRes.pos },
            };

            const res = await logStudentProgress(payload);

            if (res.success) {
                setSuccessMsg("Memorization progress submitted for tutor verification!");
                if (onSuccess) onSuccess();
            } else {
                setError(res.error || "Failed to log progress.");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred while computing Quran position.");
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
                    Log Today's Memorization
                </h3>
                <p className="text-sm text-gray-500">
                    Record the range of verses you recited in class for your tutor to verify.
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
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Surah *
                        </label>
                        <SearchableSelect
                            options={surahOptions}
                            value={startPos.surah}
                            onChange={handleStartSurahChange}
                            placeholder="Select Surah..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Aayah *{" "}
                            {startPos.surah && (
                                <span className="text-gray-400">(Max: {startMaxAyahs})</span>
                            )}
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={startMaxAyahs}
                            value={startPos.aayah}
                            onChange={(e) =>
                                setStartPos((prev) => ({
                                    ...prev,
                                    aayah: e.target.value === "" ? "" : Number(e.target.value),
                                }))
                            }
                            placeholder={`1 - ${startMaxAyahs}`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Page (Auto)
                        </label>
                        <input
                            type="number"
                            value={startPos.page}
                            disabled
                            placeholder="Auto-calculated"
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
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Surah *
                        </label>
                        <SearchableSelect
                            options={surahOptions}
                            value={endPos.surah}
                            onChange={handleEndSurahChange}
                            placeholder="Select Surah..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Aayah *{" "}
                            {endPos.surah && (
                                <span className="text-gray-400">(Max: {endMaxAyahs})</span>
                            )}
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={endMaxAyahs}
                            value={endPos.aayah}
                            onChange={(e) =>
                                setEndPos((prev) => ({
                                    ...prev,
                                    aayah: e.target.value === "" ? "" : Number(e.target.value),
                                }))
                            }
                            placeholder={`1 - ${endMaxAyahs}`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Page (Auto)
                        </label>
                        <input
                            type="number"
                            value={endPos.page}
                            disabled
                            placeholder="Auto-calculated"
                            className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 rounded-lg text-sm cursor-not-allowed outline-none"
                        />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition disabled:opacity-50 text-sm"
            >
                {loading ? "Submitting Log..." : "Submit Progress for Verification"}
            </button>
        </form>
    );
}