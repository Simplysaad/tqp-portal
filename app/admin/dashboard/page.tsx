import { getSession } from "@/actions/user.action";
import { redirect } from "next/navigation";
import { generateOSFAMetadata } from "@/lib/metadata";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import connectDB from "@/lib/db";
import Student from "@/models/student.model";
import TutorGroup from "@/models/tutorGroup.model";
import Tutor from "@/models/tutor.model";
import { getAnalyticsData } from "@/lib/analytics";
import AdminDashboard from "./AdminDashboard";
import AssignmentTableView from "@/components/AssignmentTableView";
import { headers } from "next/headers";
import { checkIsCrawler } from "@/lib/crawler";

export const metadata = generateOSFAMetadata({
  path: "/admin/dashboard",
  title: "Admin Dashboard | TQP Management",
  description: "High-level platform statistics, active tutor group metrics, and ecosystem activity overview.",
});

export const revalidate = 0;

export default async function AdminDashboardPage() {
  // 1. Authenticate & Authorize Admin Role
  const currentUser = await getSession();

  const headersList = await headers();
  const isCrawler = checkIsCrawler(headersList);

  if (isCrawler) {
    return `NextResponse.json(
      { message: "Crawler detected. Access to the dashboard is restricted." },
      { status: 403 },
    ); `;
  }

  if (!currentUser) {
    redirect("/login");
  }

  const { role } = currentUser as { id: string; role: string };

  if (role !== "admin") {
    redirect("/dashboard");
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

      {/* Unified Client Component Dashboard containing KPIs, Gauges, Charts, & Tables */}
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