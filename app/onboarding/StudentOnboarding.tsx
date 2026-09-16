"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    completeStudentOnboarding,
    lookupMemorizationPosition,
} from "@/actions/student.action";
import SearchableSelect from "@/components/SearchableSelect";
import { QURAN_SURAHS } from "@/lib/surah";
import { getDepartments, getFaculties } from "@/lib/faculties";
import { MemorizationPosition } from "@/lib/quran";

export interface FormState {
    gender: "male" | "female" | "";
    matricNumber: string;
    faculty: string;
    department: string;
    level: string;
    currentMemorization: MemorizationPosition;
    expectedMemorization: MemorizationPosition;
}

// Custom hook to handle auto-lookup for Juz and Page numbers
function useMemorizationLookup(
    memorization: MemorizationPosition,
    onUpdate: (juz: number, page: number) => void
) {
    const [isLookingUp, setIsLookingUp] = useState(false);
    const { surah, aayah: aayahRaw } = memorization;

    useEffect(() => {
        const aayah = Number(aayahRaw);
        const meta = QURAN_SURAHS.find((s) => s.name === surah);

        if (!surah || !meta || !aayah || aayah < 1 || aayah > meta.totalAayahs) {
            setIsLookingUp(false);
            onUpdate(0, 0);
            return;
        }

        setIsLookingUp(true);
        const timer = setTimeout(async () => {
            try {
                const res = await lookupMemorizationPosition(surah, aayah);
                if (res?.success) {
                    onUpdate(Number(res.juz) ?? 0, Number(res.page) ?? 0);
                }
            } catch (err) {
                console.error("Failed to lookup verse details:", err);
            } finally {
                setIsLookingUp(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [surah, aayahRaw]);

    return isLookingUp;
}

export default function StudentOnboardingForm({ userId }: { userId: string }) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<FormState>({
        gender: "",
        matricNumber: "",
        faculty: "",
        department: "",
        level: "",
        currentMemorization: { surah: "", aayah: 0, juz: 0, page: 0 },
        expectedMemorization: { surah: "", aayah: 0, juz: 0, page: 0 },
    });

    // Callbacks for updating automatic juz and page fields safely
    const handleCurrentUpdate = useCallback((juz: number, page: number) => {
        setFormData((prev) => ({
            ...prev,
            currentMemorization: { ...prev.currentMemorization, juz, page },
        }));
    }, []);

    const handleGoalUpdate = useCallback((juz: number, page: number) => {
        setFormData((prev) => ({
            ...prev,
            expectedMemorization: { ...prev.expectedMemorization, juz, page },
        }));
    }, []);

    const lookingUpCurrent = useMemorizationLookup(
        formData.currentMemorization,
        handleCurrentUpdate
    );
    const lookingUpExpected = useMemorizationLookup(
        formData.expectedMemorization,
        handleGoalUpdate
    );

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleMemorizationChange = (
        target: "currentMemorization" | "expectedMemorization",
        name: string,
        value: string | number
    ) => {
        setFormData((prev) => ({
            ...prev,
            [target]: {
                ...prev[target],
                [name]: value,
            },
        }));
    };


    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        if (!formData.gender) {
            setError("Select your gender.");
            scrollToTop()
            return;
        }

        if (!formData.matricNumber) {
            setError("Enter your Matric number.");
            scrollToTop()
            return;
        }


        if (!formData.faculty) {
            setError("Select your faculty.");
            scrollToTop()
            return;
        }

        if (!formData.department) {
            setError("Select your department.");
            scrollToTop()
            return;
        }

        if (!formData.level) {
            setError("Select your academic level.");
            scrollToTop()
            return;
        }

        if (!formData.currentMemorization.surah || !formData.currentMemorization.aayah) {
            setError("Provide both your current Surah and Ayah.");
            scrollToTop()
            return;
        }

        // Fixed logic bug: second condition now checks .aayah instead of .surah twice
        if (!formData.expectedMemorization.surah || !formData.expectedMemorization.aayah) {
            setError("Provide both your expected Surah and Ayah.");
            scrollToTop()
            return;
        }


        setLoading(true);

        try {
            const payload = {
                userId,
                gender: formData.gender as "male" | "female",
                matricNumber: formData.matricNumber,
                faculty: formData.faculty,
                department: formData.department,
                level: formData.level ? Number(formData.level) : undefined,
                currentMemorization: {
                    surah: formData.currentMemorization.surah,
                    aayah: formData.currentMemorization.aayah
                        ? Number(formData.currentMemorization.aayah)
                        : "",
                    juz: formData.currentMemorization.juz
                        ? Number(formData.currentMemorization.juz)
                        : "",
                    page: formData.currentMemorization.page
                        ? Number(formData.currentMemorization.page)
                        : "",
                },
                expectedMemorization: {
                    surah: formData.expectedMemorization.surah,
                    aayah: formData.expectedMemorization.aayah
                        ? Number(formData.expectedMemorization.aayah)
                        : "",
                    juz: formData.expectedMemorization.juz
                        ? Number(formData.expectedMemorization.juz)
                        : "",
                    page: formData.expectedMemorization.page
                        ? Number(formData.expectedMemorization.page)
                        : "",
                },
            };

            console.log("payload", payload)
            const res = await completeStudentOnboarding(payload);

            if (!res.success) {
                setError(res.message || "An error occurred during onboarding.");
                setLoading(false);
            } else {
                // router.push("/dashboard");
                router.push("/enroll");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
            setLoading(false);
        }
    }

    return (
        <div className="max-w-xl mx-auto my-8 p-6 sm:p-8 bg-white border border-emerald-900/15 rounded-2xl shadow-sm space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-emerald-950">Student Onboarding</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Complete your academic profile and current Qur'an memorization progress.
                </p>
            </div>

            {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Gender & Matric Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-emerald-950 uppercase tracking-wider mb-1">
                            Gender *
                        </label>
                        <SearchableSelect
                            name="gender"
                            options={["male", "female"]}
                            value={formData.gender}
                            onChange={(val: string) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    gender: val as FormState["gender"],
                                }))
                            }
                            required
                        />

                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-emerald-950 uppercase tracking-wider mb-1">
                            Matric Number *
                        </label>
                        <input
                            type="text"
                            name="matricNumber"
                            value={formData.matricNumber}
                            onChange={handleChange}
                            // required
                            placeholder="e.g. 21/15CD001"
                            className="w-full border border-emerald-900/20 p-2.5 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800"
                        />
                    </div>
                </div>

                {/* Faculty & Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-emerald-950 uppercase tracking-wider mb-1">
                            Faculty *
                        </label>
                        <SearchableSelect
                            required
                            name="faculty"
                            value={formData.faculty}
                            onChange={(val: string) =>
                                setFormData((prev) => ({ ...prev, faculty: val }))
                            }
                            options={getFaculties()}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-emerald-950 uppercase tracking-wider mb-1">
                            Department *
                        </label>
                        <SearchableSelect
                            required
                            name="department"
                            value={formData.department}
                            onChange={(val: string) =>
                                setFormData((prev) => ({ ...prev, department: val }))
                            }
                            options={getDepartments(formData.faculty)}
                        />
                    </div>
                </div>

                {/* Level */}
                <div>
                    <label className="block text-xs font-semibold text-emerald-950 uppercase tracking-wider mb-1">
                        Academic Level *
                    </label>

                    <SearchableSelect
                        required
                        name="level"
                        value={formData.level}
                        onChange={(val: string) =>
                            setFormData((prev) => ({ ...prev, level: val }))
                        }
                        options={[
                            "100", "200", "300", "400", "500", "600", "700"
                        ]}
                    />
                </div>

                {/* Current Memorization Section */}
                <div className="p-4 border border-emerald-900/15 rounded-xl bg-emerald-50/50 space-y-3">
                    <div className="space-y-1">
                        <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                            Current Memorization Status
                        </h3>
                        <p className="text-xs text-emerald-800/80">
                            Enter where you would like to be at the end of the semester.
                        </p>
                    </div>

                    <SearchableSelect
                        required
                        placeholder="Current Surah *"
                        name="surah"
                        value={formData.currentMemorization.surah}
                        options={QURAN_SURAHS.map((s) => s.name)}
                        onChange={(val: string) =>
                            handleMemorizationChange("currentMemorization", "surah", val)
                        }
                    />

                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                                Aayah *
                            </label>
                            <input
                                type="number"
                                name="aayah"
                                value={formData.currentMemorization.aayah || ""}
                                onChange={(e) =>
                                    handleMemorizationChange(
                                        "currentMemorization",
                                        "aayah",
                                        e.target.value
                                    )
                                }
                                // required
                                placeholder="e.g. 255"
                                min={1}
                                max={
                                    QURAN_SURAHS.find(
                                        (s) => s.name === formData.currentMemorization.surah
                                    )?.totalAayahs
                                }
                                className="w-full border border-emerald-900/20 p-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                                Juz (auto)
                            </label>
                            <input
                                type="number"
                                readOnly
                                tabIndex={-1}
                                value={formData.currentMemorization.juz || ""}
                                placeholder="—"
                                className="w-full border border-emerald-900/20 p-2 rounded-lg text-sm bg-gray-100 text-gray-600 cursor-not-allowed focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                                Page (auto)
                            </label>
                            <input
                                type="number"
                                readOnly
                                tabIndex={-1}
                                value={formData.currentMemorization.page || ""}
                                placeholder="—"
                                className="w-full border border-emerald-900/20 p-2 rounded-lg text-sm bg-gray-100 text-gray-600 cursor-not-allowed focus:outline-none"
                            />
                        </div>
                    </div>
                    <p className="text-[10px] text-gray-500">
                        {lookingUpCurrent
                            ? "Looking up juz & page…"
                            : "Juz & page fill in automatically from surah + aayah."}
                    </p>
                </div>

                {/* Goal Memorization Section */}
                <div className="p-4 border border-emerald-900/15 rounded-xl bg-emerald-50/50 space-y-3">
                    <div className="space-y-1">
                        <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                            Memorization Goal
                        </h3>
                        <p className="text-xs text-emerald-800/80">
                            Enter where you would like to be at the end of the semester.
                        </p>
                    </div>

                    <SearchableSelect
                        required
                        placeholder="Target Surah *"
                        name="surah"
                        value={formData.expectedMemorization.surah}
                        options={QURAN_SURAHS.map((s) => s.name)}
                        onChange={(val: string) =>
                            handleMemorizationChange("expectedMemorization", "surah", val)
                        }
                    />

                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <label className="block text-xs font-medium text-emerald-900/80 mb-1">
                                Aayah *
                            </label>
                            <input
                                type="number"
                                name="aayah"
                                value={formData.expectedMemorization.aayah || ""}
                                onChange={(e) =>
                                    handleMemorizationChange(
                                        "expectedMemorization",
                                        "aayah",
                                        e.target.value
                                    )
                                }
                                // required
                                placeholder="e.g. 255"
                                min={1}
                                max={
                                    QURAN_SURAHS.find(
                                        (s) => s.name === formData.expectedMemorization.surah
                                    )?.totalAayahs
                                }
                                className="w-full border border-emerald-900/20 p-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-emerald-900/80 mb-1">
                                Juz (auto)
                            </label>
                            <input
                                type="number"
                                readOnly
                                tabIndex={-1}
                                value={formData.expectedMemorization.juz || ""}
                                placeholder="—"
                                className="w-full border border-emerald-900/20 p-2 rounded-lg text-sm bg-gray-100 text-gray-600 cursor-not-allowed focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-emerald-900/80 mb-1">
                                Page (auto)
                            </label>
                            <input
                                type="number"
                                readOnly
                                tabIndex={-1}
                                value={formData.expectedMemorization.page || ""}
                                placeholder="—"
                                className="w-full border border-emerald-900/20 p-2 rounded-lg text-sm bg-gray-100 text-gray-600 cursor-not-allowed focus:outline-none"
                            />
                        </div>
                    </div>
                    <p className="text-[11px] text-emerald-800/70">
                        {lookingUpExpected
                            ? "Looking up juz & page…"
                            : "Juz & page fill in automatically from surah + aayah."}
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={loading || lookingUpCurrent || lookingUpExpected}
                    className="w-full py-3 bg-emerald-900 text-white text-sm font-semibold rounded-xl hover:bg-emerald-950 transition disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-950/10"
                >
                    {loading ? "Saving Setup..." : "Complete Setup"}
                </button>
            </form>
        </div>
    );
}