import { getSession } from "@/actions/user.action";
import StudentDashboard from "./StudentDashboard";
import TutorDashboard from "./TutorDashboard";
import AdminDashboard from "../admin/dashboard/AdminDashboard";
import Student from "@/models/student.model";
import Tutor from "@/models/tutor.model";
import connectDB from "@/lib/db";
import { redirect } from "next/navigation";
import { generateOSFAMetadata } from "@/lib/metadata";


export const metadata = generateOSFAMetadata({
    path: "/dashboard",
    title: "Learning & Progress Dashboard | TQP System",
    description: "Monitor memorisation goals, review session updates, and track your ongoing learning progress.",
})

const Dashboard = async () => {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    const { id: userId, role } = session;


    if (role === "admin" || role === "coordinator") {
        redirect("/admin/dashboard");
    }

    await connectDB();



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