import { getSession } from "@/actions/user.action";
import { redirect } from "next/navigation";
import { generateOSFAMetadata } from "@/lib/metadata";
import Link from "next/link";
import {
  Users,
  UserCheck,
  ShieldAlert,
  Layers,
  ArrowUpRight,
  BookOpen,
  GraduationCap,
} from "lucide-react";

import connectDB from "@/lib/db";
import Student from "@/models/student.model";
import TutorGroup from "@/models/tutorGroup.model";
import Tutor from "@/models/tutor.model";
import { getAnalyticsData } from "@/lib/analytics";
import AdminDashboard from "./AdminDashboard";
import AssignmentTableView from "@/components/AssignmentTableView";

export const metadata = generateOSFAMetadata({
  path: "/admin/dashboard",
  title: "Admin Dashboard | TQP Management",
  description: "High-level platform statistics, active tutor group metrics, and ecosystem activity overview.",
});

export const revalidate = 0;

export default async function AdminDashboardPage() {
  // 1. Authenticate & Authorize Admin Role
  const currentUser = await getSession();

  if (!currentUser) {
    redirect("/login");
  }

  const { role } = currentUser as { id: string; role: string };

  if (role !== "admin") {
    redirect("/onboarding");
  }

  // 2. Fetch Database Metrics & Analytics Data in parallel
  await connectDB();

  const [totalStudents, unassignedCount, activeGroupsRaw, totalTutors, analyticsDataRaw] =
    await Promise.all([
      Student.countDocuments({ status: "active" }),
      Student.countDocuments({ tutor: { $exists: false } }),
      TutorGroup.find({ isActive: true }).lean(),
      Tutor.countDocuments(),
      getAnalyticsData(),
    ]);

  // Sanitize Mongoose objects into clean plain JSON objects for Client Component props
  const activeGroups = JSON.parse(JSON.stringify(activeGroupsRaw));
  const analyticsData = JSON.parse(JSON.stringify(analyticsDataRaw));

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

  // Most populated Juz calculation
  const mostPopulatedJuz = analyticsData?.juzTimePivot 
    ? [...analyticsData.juzTimePivot].sort((a: any, b: any) => b.total - a.total)[0]?.juzNum 
    : "N/A";

  const atRiskCount = analyticsData?.byStatus?.find((s: any) => s._id === "at risk")?.count || 0;

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-8 md:max-w-7xl mx-auto">
      {/* Header & Quick Action */}
      <div className="flex print:hidden flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            Admin Analytics Dashboard
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Real-time system occupancy, assignment status, and student distribution.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/assignments/batch"
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-4 py-2.5 rounded-lg transition-colors shadow-sm w-full md:w-auto"
          >
            Run Auto-Assignment
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Top Overview Cards (Combined KPIs) */}
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
              Most Populated Juz
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <BookOpen className="w-4 h-4 md:w-5 md:h-5" />
            </div>
          </div>
          <div className="mt-3 md:mt-4">
            <span className="text-2xl md:text-3xl font-bold text-zinc-900">
              Juz {mostPopulatedJuz}
            </span>
            <p className="text-[11px] md:text-xs text-zinc-500 mt-0.5">
              Highest density
            </p>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] md:text-xs font-semibold tracking-wider uppercase text-zinc-500">
              At Risk
            </span>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <GraduationCap className="w-4 h-4 md:w-5 md:h-5" />
            </div>
          </div>
          <div className="mt-3 md:mt-4">
            <span className="text-2xl md:text-3xl font-bold text-red-600">
              {atRiskCount}
            </span>
            <p className="text-[11px] md:text-xs text-zinc-500 mt-0.5">
              Requires attention
            </p>
          </div>
        </div>
      </div>

      {/* System Capacity Gauge */}
      <div className="bg-white print:hidden p-5 md:p-6 rounded-xl border border-zinc-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h2 className="text-sm md:text-base font-semibold text-zinc-900">
              Total System Group Occupancy
            </h2>
            <p className="text-xs text-zinc-500">
              Aggregated capacity utilization across active groups ({activeGroups.length} active groups, {totalTutors} total tutors)
            </p>
          </div>
          <span className="text-xs md:text-sm font-semibold text-zinc-900">
            {totalOccupied} / {totalCapacity} Slots ({capacityPercentage}%)
          </span>
        </div>
        <div className="w-full bg-zinc-100 rounded-full h-2.5 md:h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              capacityPercentage > 90
                ? "bg-red-500"
                : capacityPercentage > 75
                ? "bg-amber-500"
                : "bg-emerald-500"
            }`}
            style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Analytics Client (Charts & Graphs) */}
      <AdminDashboard 
        {...analyticsData} 
        totalStudents={totalStudents}
        unassignedCount={unassignedCount}
        totalTutors={totalTutors}
        activeGroups={activeGroups} 
      />

      {/* Assignment Table View Component */}
       <AssignmentTableView />
    </div>
  );
}