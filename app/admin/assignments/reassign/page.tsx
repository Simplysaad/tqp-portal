"use client";

import React, { useState, useEffect } from "react";
import {
  UserCheck,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { assignStudentToTutor } from "@/actions/assignment.action";
import SearchableSelect, { Option } from "@/components/SearchableSelect";
import getData from "./action";
import { generateOSFAMetadata } from "@/lib/metadata";
import { Metadata } from "next";

export const metadata: Metadata = generateOSFAMetadata({
    path: "/admin/assignments/batch",
    title: "Reassign Students | TQP Admin",
    description: "Reassign students to tutor groups according to capacity, gender restrictions, and memorisation levels.",
});


export default function ReassignStudentPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [tutorGroups, setTutorGroups] = useState<any[]>([]);

  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Fetch student and tutor group options for dropdowns
  const loadInitialData = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await getData();

      if (res.success) {
        setStudents(res.students || []);
        setTutorGroups(res.tutorGroups || []);
      } else {
        setFeedback({
          success: false,
          message: "Failed to load options for reassignment.",
        });
      }
    } catch (err: any) {
      setFeedback({
        success: false,
        message: "Failed to load options for reassignment.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Map students into Option[] with sublabel formatting
  const studentOptions: Option[] = students.map((s) => ({
    value: s._id,
    label: s.user?.name || "Unnamed Student",
    sublabel: `Juz ${s.currentMemorization?.juz ?? "N/A"} • ${s.gender ?? "N/A"}`,
  }));

  // Map tutor groups into Option[] with sublabel formatting
  const groupOptions: Option[] = tutorGroups.map((g) => ({
    value: g._id,
    label: g.name || `Group ${g._id.slice(-4)}`,
    sublabel: `Tutor: ${g.tutor?.user?.name || g.tutor?.name || "Unassigned"} • Cap: ${g.students?.length || 0}/${g.rules?.maxCapacity || 5}`,
  }));


  // Target object details for preview card
  const activeStudent = students.find((s) => s._id === selectedStudentId);
  const activeGroup = tutorGroups.find((g) => g._id === selectedGroupId);

  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedGroupId) return;

    setSubmitting(true);
    setFeedback(null);

    const res = await assignStudentToTutor(selectedStudentId, selectedGroupId);

    setSubmitting(false);
    setFeedback({
      success: res.success,
      message: res.message,
    });

    if (res.success) {
      // Refresh options to reflect updated group capacity
      loadInitialData();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">
            Individual Student Reassignment
          </h1>
          <p className="text-xs text-zinc-500">
            Manually reassign a student to another tutor group with rule
            validation and automatic transfer.
          </p>
        </div>
        <button
          onClick={loadInitialData}
          disabled={loading}
          className="p-2 border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Reassignment Form */}
      <form
        onSubmit={handleReassign}
        className="bg-white p-6 rounded-xl border border-zinc-200 space-y-6 shadow-2xs"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Select Student */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700 block">
              Select Student
            </label>
            <SearchableSelect
              options={studentOptions}
              value={selectedStudentId}
              onChange={setSelectedStudentId}
              placeholder="Search student by name..."
              disabled={loading || submitting}
            />
          </div>

          {/* Select Tutor Group */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700 block">
              Target Tutor Group
            </label>
            <SearchableSelect
              options={groupOptions}
              value={selectedGroupId}
              onChange={setSelectedGroupId}
              placeholder="Search group or tutor..."
              disabled={loading || submitting}
            />
          </div>
        </div>

        {/* Dynamic Assignment Details Preview */}
        {(activeStudent || activeGroup) && (
          <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Student Summary */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400">
                Student Overview
              </span>
              {activeStudent ? (
                <div>
                  <p className="font-semibold text-zinc-900">
                    {activeStudent.user?.name}
                  </p>
                  <p className="text-zinc-500">
                    Gender:{" "}
                    <span className="capitalize text-zinc-700">
                      {activeStudent.gender}
                    </span>
                  </p>
                  <p className="text-zinc-500">
                    Memorization:{" "}
                    <span className="text-zinc-700">
                      Juz {activeStudent.currentMemorization?.juz || "N/A"}
                    </span>
                  </p>
                  <p className="text-zinc-500">
                    Preferred Time:{" "}
                    <span className="capitalize text-zinc-700">
                      {activeStudent.preferredTime || "Any"}
                    </span>
                  </p>
                </div>
              ) : (
                <p className="text-zinc-400 italic">No student selected</p>
              )}
            </div>

            {/* Target Group Summary */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400">
                Target Group Overview
              </span>
              {activeGroup ? (
                <div>
                  <p className="font-semibold text-zinc-900">
                    {activeGroup.name || "Tutor Group"}
                  </p>
                  <p className="text-zinc-500">
                    Assigned Tutor:{" "}
                    <span className="text-zinc-700">
                      {activeGroup.tutor?.user?.name || "Unassigned"}
                    </span>
                  </p>
                  <p className="text-zinc-500">
                    Current Occupancy:{" "}
                    <span className="text-zinc-700">
                      {activeGroup.students?.length || 0} /{" "}
                      {activeGroup.rules?.maxCapacity || 5}
                    </span>
                  </p>
                  <p className="text-zinc-500">
                    Female Only:{" "}
                    <span className="text-zinc-700">
                      {activeGroup.rules?.femaleOnly ? "Yes" : "No"}
                    </span>
                  </p>
                </div>
              ) : (
                <p className="text-zinc-400 italic">No target group selected</p>
              )}
            </div>
          </div>
        )}

        {/* Feedback Alert Banner */}
        {feedback && (
          <div
            className={`p-3.5 rounded-lg border text-xs flex items-center gap-2 ${
              feedback.success
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}
          >
            {feedback.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={!selectedStudentId || !selectedGroupId || submitting}
            className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-lg text-xs font-semibold hover:bg-zinc-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Reassigning...
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                Confirm Reassignment
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
