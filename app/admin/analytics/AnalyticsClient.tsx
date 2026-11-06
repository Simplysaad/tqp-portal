"use client";
import { useState } from "react";
import { JuzStackedBar } from "@/components/analytics/JuzStackedBar";
import { ProgramPie } from "@/components/analytics/ProgramPie";
import { StatusDonut } from "@/components/analytics/StatusDonut";
import { FacultyBar } from "@/components/analytics/FacultyBar";
import { RegistrationTrend } from "@/components/analytics/RegistrationTrend";
import { TutorCoverage } from "@/components/analytics/TutorCoverage";
import { LevelJuzBar } from "@/components/analytics/LevelJuzBar";

export default function AnalyticsClient(props: any) {
  const [viewMode, setViewMode] = useState<"time" | "gender">("time");

  return (
    <div className="space-y-6">
      {/* Main Stacked Bar with Radio */}
      <div className="border rounded-xl p-5 bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Students by Juz'</h3>
          <div className="flex gap-2 text-sm border rounded-full p-1">
            <button onClick={() => setViewMode("time")} className={`px-3 py-1 rounded-full ${viewMode==="time" ? "bg-zinc-900 text-white" : ""}`}>By Time</button>
            <button onClick={() => setViewMode("gender")} className={`px-3 py-1 rounded-full ${viewMode==="gender" ? "bg-zinc-900 text-white" : ""}`}>By Gender</button>
          </div>
        </div>
        <JuzStackedBar data={viewMode==="time" ? props.juzTimePivot : props.juzGenderPivot} mode={viewMode} />
      </div>

      {/* Row 2: Program, Status, Faculty */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="border rounded-xl p-5 bg-white">
          <h3 className="font-medium mb-4">By Program</h3>
          <ProgramPie data={props.byProgram} />
        </div>
        <div className="border rounded-xl p-5 bg-white">
          <h3 className="font-medium mb-4">By Status</h3>
          <StatusDonut data={props.byStatus} />
        </div>
        <div className="border rounded-xl p-5 bg-white">
          <h3 className="font-medium mb-4">By Faculty (Top 10)</h3>
          <FacultyBar data={props.byFaculty} />
        </div>
      </div>

      {/* Row 3: Registration Trend + Tutor Coverage */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-xl p-5 bg-white">
          <h3 className="font-medium mb-4">Registration Trend (Last 30 Days)</h3>
          <RegistrationTrend data={props.registrationTrend} />
        </div>
        <div className="border rounded-xl p-5 bg-white">
          <h3 className="font-medium mb-4">Tutor Coverage</h3>
          <TutorCoverage data={props.tutorCoverage} />
        </div>
      </div>

      {/* Row 4: Level Distribution by Juz' */}
      <div className="border rounded-xl p-5 bg-white">
        <h3 className="font-medium mb-1">Level Distribution by Juz'</h3>
        <p className="text-sm text-zinc-500 mb-4">Use this to balance academic levels when assigning tutors to Juz'</p>
        <LevelJuzBar data={props.levelPivot} />
      </div>
    </div>
  );
}