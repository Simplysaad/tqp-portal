"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getDepartments, getFaculties } from "@/lib/faculties";
import SearchableSelect from "@/components/SearchableSelect";
import { completeBeginnerOnboarding } from "@/actions/student.action";
import { NURU_AL_BAYAN_ENTRIES } from "@/lib/nuralbayan";

export interface NuruAlBayanPosition {
  index: number;
  section: string;
  chapter: string;
  page: number;
}

export interface FormState {
  gender: "male" | "female" | "";
  matricNumber: string;
  faculty: string;
  preferredTime: "morning" | "afternoon" | "night" | string;
  department: string;
  level: string;
  currentPosition: NuruAlBayanPosition;
  expectedPosition: NuruAlBayanPosition;
}

const START_POSITION = NURU_AL_BAYAN_ENTRIES[0];
const END_POSITION = NURU_AL_BAYAN_ENTRIES[NURU_AL_BAYAN_ENTRIES.length - 1];

export default function BeginnerOnboardingForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormState>({
    gender: "",
    matricNumber: "",
    faculty: "",
    department: "",
    level: "",
    preferredTime: "night",
    currentPosition: START_POSITION,
    expectedPosition: END_POSITION,
  });

  const chapterOptions = NURU_AL_BAYAN_ENTRIES.map(
    (e) => `${e.index}. ${e.chapter}`,
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePositionSelect = (
    type: "currentPosition" | "expectedPosition",
    selectedOption: string,
  ) => {
    const selectedIndex = parseInt(selectedOption.split(".")[0], 10);
    const entry = NURU_AL_BAYAN_ENTRIES.find(
      (item) => item.index === selectedIndex,
    );

    if (entry) {
      setFormData((prev) => ({ ...prev, [type]: entry }));
    }
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
      scrollToTop();
      return;
    }

    if (!formData.matricNumber) {
      setError("Enter your Matric number.");
      scrollToTop();
      return;
    }

    if (!formData.faculty) {
      setError("Select your faculty.");
      scrollToTop();
      return;
    }

    if (!formData.department) {
      setError("Select your department.");
      scrollToTop();
      return;
    }

    if (!formData.level) {
      setError("Select your academic level.");
      scrollToTop();
      return;
    }

    setLoading(true);

    try {
      const payload = {
        userId,
        gender: formData.gender as "male" | "female",
        matricNumber: formData.matricNumber,
        faculty: formData.faculty,
        preferredTime: formData.preferredTime,
        department: formData.department,
        level: formData.level ? Number(formData.level) : undefined,
        currentPosition: formData.currentPosition,
        expectedPosition: formData.expectedPosition,
      };

      console.log("payload", payload);
      // return;

      const res = await completeBeginnerOnboarding(payload);
      console.log("res", res);

      if (!res.success) {
        setError(res.message || "An error occurred during onboarding.");
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto my-8 p-6 sm:p-8 bg-white border border-emerald-900/15 rounded-2xl shadow-sm space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-emerald-950">
          Beginner Student Onboarding
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Complete your academic profile and set your initial Nur Al-Bayan
          learning target.
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
          <div>
            <label className="block mb-1">
              <span className="block text-xs font-semibold text-emerald-950 uppercase tracking-wider">
                Academic Level *
              </span>
              <span className="block text-xs text-gray-600 font-normal normal-case mt-1">
                Your level next session
              </span>
            </label>
            <SearchableSelect
              required
              name="level"
              value={formData.level}
              onChange={(val: string) =>
                setFormData((prev) => ({ ...prev, level: val }))
              }
              options={["100", "200", "300", "400", "500", "600", "Graduated"]}
            />
          </div>
          <div>
            <label className="block mb-1">
              <span className="block text-xs font-semibold text-emerald-950 uppercase tracking-wider">
                Preferred Time *
              </span>
            </label>
            <SearchableSelect
              required
              name="preferredTime"
              value={formData.preferredTime}
              onChange={(val: string) =>
                setFormData((prev) => ({ ...prev, preferredTime: val }))
              }
              options={["morning", "afternoon", "night"]}
            />
          </div>
        </div>
        preferredTime
        {/* Starting Progress Position */}
        <div className="p-4 border border-emerald-900/15 rounded-xl bg-emerald-50/50 space-y-3">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
              Starting Point
            </h3>
            <p className="text-xs text-emerald-800/80">
              This is where you'll be starting from
            </p>
          </div>

          <div>
            <SearchableSelect
              options={chapterOptions}
              disabled
              value={`${formData.currentPosition.index}. ${formData.currentPosition.chapter}`}
              onChange={(val: string) =>
                handlePositionSelect("currentPosition", val)
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 pt-1">
            <div>
              <span className="font-semibold text-emerald-900">Section:</span>{" "}
              {formData.currentPosition.section}
            </div>
            <div>
              <span className="font-semibold text-emerald-900">Page:</span>{" "}
              {formData.currentPosition.page}
            </div>
          </div>
        </div>
        {/* Semester Goal Target Position */}
        <div className="p-4 border border-emerald-900/15 rounded-xl bg-emerald-50/50 space-y-3">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
              Program Target
            </h3>
            <p className="text-xs text-emerald-800/80">
              Where you are expected to be by the end of the program.
            </p>
          </div>

          <div>
            <SearchableSelect
              options={chapterOptions}
              disabled={true}
              value={`${formData.expectedPosition.index}. ${formData.expectedPosition.chapter}`}
              onChange={(val: string) =>
                handlePositionSelect("expectedPosition", val)
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 pt-1">
            <div>
              <span className="font-semibold text-emerald-900">Section:</span>{" "}
              {formData.expectedPosition.section}
            </div>
            <div>
              <span className="font-semibold text-emerald-900">Page:</span>{" "}
              {formData.expectedPosition.page}
            </div>
          </div>
        </div>
        <button
          type="submit"
          // disabled={loading}
          className="w-full py-3 bg-emerald-900 text-white text-sm font-semibold rounded-xl hover:bg-emerald-950 transition disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-950/10"
        >
          {loading ? "Saving Setup..." : "Complete Setup"}
        </button>
      </form>
    </div>
  );
}
