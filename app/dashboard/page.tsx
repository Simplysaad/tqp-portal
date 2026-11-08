import { getSession } from "@/actions/user.action";
import StudentDashboard from "./StudentDashboard";
import TutorDashboard from "./TutorDashboard";
import AdminDashboard from "../admin/dashboard/AdminDashboard";
import Student from "@/models/student.model";
import Tutor from "@/models/tutor.model";
import connectDB from "@/lib/db";
import { redirect } from "next/navigation";
import { generateOSFAMetadata } from "@/lib/metadata";
import { checkIsCrawler } from "@/lib/crawler";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export const metadata = generateOSFAMetadata({
  path: "/dashboard",
  title: "Learning & Progress Dashboard | TQP System",
  description:
    "Monitor memorisation goals, review session updates, and track your ongoing learning progress.",
});

const Dashboard = async () => {
  const session = await getSession();
  const headersList = await headers();
  const isCrawler = checkIsCrawler(headersList);

  if (isCrawler) {
    return `NextResponse.json(
      { message: "Crawler detected. Access to the dashboard is restricted." },
      { status: 403 },
    ); `;
  }

  if (!session) {
    redirect("/login");
  }

  const { id: userId, role } = session;

  await connectDB();

  if (role === "admin") {
    redirect("/admin/dashboard");
  }

  if (role === "student") {
    const studentProfile = await Student.findOne({ user: userId });
    if (!studentProfile) {
      redirect("/onboarding");
    }
    return <StudentDashboard userId={userId} />;
  }

  if (role === "tutor") {
    const tutorProfile = await Tutor.findOne({ user: userId });
    if (!tutorProfile) {
      redirect("/onboarding");
    }
    return <TutorDashboard userId={userId} />;
  }

  redirect("/onboarding");
};

export default Dashboard;
