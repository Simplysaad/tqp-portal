import { getSession, registerUser } from "@/actions/user.action";

import AdminDashboard from "../admin/AdminDashboard";
import { redirect } from "next/navigation";

const Dashboard = async () => {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    const { id: userId, role } = session;

    if (role !== "admin" && role !== "coordinator") {
        redirect("/onboarding");

    }


    // redirect("/dashboard")


    return <AdminDashboard userId={userId} />;

};

export default Dashboard;