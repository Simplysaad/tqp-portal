"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  ShieldAlert,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { JuzStackedBar } from "@/components/analytics/JuzStackedBar";
import { ProgramPie } from "@/components/analytics/ProgramPie";
import { StatusDonut } from "@/components/analytics/StatusDonut";
import { FacultyBar } from "@/components/analytics/FacultyBar";
import { RegistrationTrend } from "@/components/analytics/RegistrationTrend";
import { TutorCoverage } from "@/components/analytics/TutorCoverage";
import { LevelJuzBar } from "@/components/analytics/LevelJuzBar";
import AssignmentTableView from "@/components/AssignmentTableView";

export default function AdminDashboard(props: any) {
  const [viewMode, setViewMode] = useState<"time" | "gender">("time");

  // Safely compute values from props passed by server or state
  const totalStudents = props.totalStudents ?? 0;
  const unassignedCount = props.unassignedCount ?? 0;
  const activeGroups = props.activeGroups ?? [];
  const totalTutors = props.totalTutors ?? 0;

  const totalCapacity = activeGroups.reduce(
    (acc: number, g: any) => acc + (g.rules?.maxCapacity ?? 5),
    0,
  );
  const totalOccupied = activeGroups.reduce(
    (acc: number, g: any) => acc + (g.students?.length ?? 0),
    0,
  );
  const capacityPercentage =
    totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Top Analytics Cards (2 cols on mobile, 4 on desktop) */}
      <div className="grid print:hidden grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <div className="bg-white p-4 md:p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] md:text-xs font-semibold tracking-wider uppercase text-zinc-500">
              Active Students
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-4 h-4 md:w-5 md:h-5" />
            </div>
          </div>
          <div className="mt-3 md:mt-4">
            <span className="text-2xl md:text-3xl font-bold text-zinc-900">
              {totalStudents}
            </span>
            <p className="text-[11px] md:text-xs text-zinc-500 mt-0.5">
              Enrolled faculties
            </p>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] md:text-xs font-semibold tracking-wider uppercase text-zinc-500">
              Unassigned
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <ShieldAlert className="w-4 h-4 md:w-5 md:h-5" />
            </div>
          </div>
          <div className="mt-3 md:mt-4">
            <span className="text-2xl md:text-3xl font-bold text-amber-600">
              {unassignedCount}
            </span>
            <p className="text-[11px] md:text-xs text-zinc-500 mt-0.5">
              Awaiting allocation
            </p>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] md:text-xs font-semibold tracking-wider uppercase text-zinc-500">
              Active Groups
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Layers className="w-4 h-4 md:w-5 md:h-5" />
            </div>
          </div>
          <div className="mt-3 md:mt-4">
            <span className="text-2xl md:text-3xl font-bold text-zinc-900">
              {activeGroups.length}
            </span>
            <p className="text-[11px] md:text-xs text-zinc-500 mt-0.5">
              Teaching units
            </p>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] md:text-xs font-semibold tracking-wider uppercase text-zinc-500">
              Total Tutors
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <UserCheck className="w-4 h-4 md:w-5 md:h-5" />
            </div>
          </div>
          <div className="mt-3 md:mt-4">
            <span className="text-2xl md:text-3xl font-bold text-zinc-900">
              {totalTutors}
            </span>
            <p className="text-[11px] md:text-xs text-zinc-500 mt-0.5">
              Verified instructors
            </p>
          </div>
        </div>
      </div>

      {/* Main Stacked Bar with Radio */}
      <div className="border rounded-xl p-4 md:p-5 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
          <h3 className="font-medium text-zinc-900">Students by Juz'</h3>
          <div className="flex gap-1 text-xs md:text-sm border rounded-full p-1 self-start sm:self-auto bg-zinc-50">
            <button
              onClick={() => setViewMode("time")}
              className={`px-3 py-1 rounded-full transition-colors ${
                viewMode === "time" ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              By Time
            </button>
            <button
              onClick={() => setViewMode("gender")}
              className={`px-3 py-1 rounded-full transition-colors ${
                viewMode === "gender" ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              By Gender
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <JuzStackedBar
            data={viewMode === "time" ? props.juzTimePivot : props.juzGenderPivot}
            mode={viewMode}
          />
        </div>
      </div>

      {/* Row: Program, Status, Faculty (3-column grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-xl p-4 md:p-5 bg-white shadow-sm">
          <h3 className="font-medium mb-4 text-zinc-900">By Program</h3>
          <ProgramPie data={props.byProgram} />
        </div>
        <div className="border rounded-xl p-4 md:p-5 bg-white shadow-sm">
          <h3 className="font-medium mb-4 text-zinc-900">By Status</h3>
          <StatusDonut data={props.byStatus} />
        </div>
        <div className="border rounded-xl p-4 md:p-5 bg-white shadow-sm">
          <h3 className="font-medium mb-4 text-zinc-900">By Faculty (Top 10)</h3>
          <FacultyBar data={props.byFaculty} />
        </div>
      </div>

      {/* Row: Registration Trend + Tutor Coverage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-xl p-4 md:p-5 bg-white shadow-sm">
          <h3 className="font-medium mb-4 text-zinc-900">Registration Trend (Last 30 Days)</h3>
          <RegistrationTrend data={props.registrationTrend} />
        </div>
        <div className="border rounded-xl p-4 md:p-5 bg-white shadow-sm">
          <h3 className="font-medium mb-4 text-zinc-900">Tutor Coverage</h3>
          <TutorCoverage data={props.tutorCoverage} />
        </div>
      </div>

      {/* Level Distribution by Juz' */}
      <div className="border rounded-xl p-4 md:p-5 bg-white shadow-sm">
        <h3 className="font-medium mb-1 text-zinc-900">Level Distribution by Juz'</h3>
        <p className="text-xs md:text-sm text-zinc-500 mb-4">
          Use this to balance academic levels when assigning tutors to Juz'
        </p>
        <LevelJuzBar data={props.levelPivot} />
      </div>

      {/* Active Groups Overview Table */}
      <div className="bg-white print:hidden rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="px-4 md:px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
          <h2 className="text-sm md:text-base font-semibold text-zinc-900">
            Active Tutor Groups Utilization
          </h2>
          <Link
            href="/admin/groups"
            className="text-xs font-medium text-emerald-600 hover:underline"
          >
            View All Groups &rarr;
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-zinc-50 text-[11px] md:text-xs font-semibold uppercase text-zinc-500 border-b border-zinc-200">
              <tr>
                <th className="px-4 md:px-6 py-3.5">Group ID</th>
                <th className="px-4 md:px-6 py-3.5">Capacity</th>
                <th className="px-4 md:px-6 py-3.5">Rules Enforcement</th>
                <th className="px-4 md:px-6 py-3.5">Status</th>
                <th className="px-4 md:px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {activeGroups.slice(0, 5).map((group: any) => {
                const occupied = group.students?.length || 0;
                const max = group.rules?.maxCapacity || 5;
                const isFull = occupied >= max;

                return (
                  <tr
                    key={group._id.toString()}
                    className="hover:bg-zinc-50/50 transition-colors"
                  >
                    <td className="px-4 md:px-6 py-4 font-medium text-zinc-900">
                      {group.name || group._id.toString()}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-950 text-xs md:text-sm">
                          {occupied}/{max}
                        </span>
                        <div className="w-16 md:w-20 bg-zinc-100 rounded-full h-1.5 overflow-hidden hidden sm:block">
                          <div
                            className="bg-emerald-500 h-full"
                            style={{ width: `${(occupied / max) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {group.rules?.femaleOnly && (
                          <span className="bg-pink-50 text-pink-700 text-[10px] md:text-xs px-2 py-0.5 rounded font-medium border border-pink-200">
                            Female Only
                          </span>
                        )}
                        {group.rules?.memorizationRange?.start?.juz && (
                          <span className="bg-indigo-50 text-indigo-700 text-[10px] md:text-xs px-2 py-0.5 rounded font-medium border border-indigo-200">
                            Juz {group.rules.memorizationRange.start.juz}-
                            {group.rules.memorizationRange.end?.juz}
                          </span>
                        )}
                        {!group.rules?.femaleOnly &&
                          !group.rules?.memorizationRange?.start?.juz && (
                            <span className="text-zinc-400 text-xs">
                              Standard Co-ed
                            </span>
                          )}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      {isFull ? (
                        <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          <AlertCircle className="w-3 h-3" /> Full
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Open
                        </span>
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right">
                      <Link
                        href={`/admin/groups/${group._id}`}
                        className="text-xs font-medium text-zinc-700 hover:text-emerald-600"
                      >
                        Details &rarr;
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}