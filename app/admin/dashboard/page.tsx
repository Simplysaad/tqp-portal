import { getSession, registerUser } from "@/actions/user.action";

import AdminDashboard from "./AdminDashboard";
import { redirect } from "next/navigation";

const Dashboard = async () => {
    const currentUser = await getSession();

    if (!currentUser) {
        redirect("/login");
    }

    const { id: userId, role } = currentUser as { id: string; role: string }

    if (role !== "admin" && role !== "coordinator") {
        // redirect("/onboarding");

        // let data = await registerUser({
        //     name: "admin",
        //     email: "admin@tqp.mssnoau.org",
        //     password: "#saadid007",
        //     isActive: true,
        //     role: "admin",
        //     isOnboarded: true,
        //     whatsappNumber: "09076147178"
        // })
        // console.log("data", data)

    }


    // redirect("/dashboard")


    return <AdminDashboard />;

};

export default Dashboard;