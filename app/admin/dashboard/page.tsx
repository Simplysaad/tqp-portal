import { getSession, registerUser } from "@/actions/user.action";

import AdminDashboard from "./AdminDashboard";
import { redirect } from "next/navigation";
import { generateOSFAMetadata } from "@/lib/metadata";

export const metadata = generateOSFAMetadata({
    path: "/admin/dashboard",
    title: "Admin Dashboard | TQP Management",
    description: "High-level platform statistics, active tutor group metrics, and ecosystem activity overview.",
})

const Dashboard = async () => {
    const currentUser = await getSession();

    if (!currentUser) {
        redirect("/login");
    }

    const { id: userId, role } = currentUser as { id: string; role: string }

    if (role !== "admin") {
        redirect("/onboarding");
    }

    // redirect("/dashboard")


    return <AdminDashboard />;

};

export default Dashboard;