import { ReactNode } from "react";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import { IUser } from "@/models/user.model";
import { getSession } from "@/actions/user.action";
import AdminNav from "@/components/AdminNav";

interface AdminLayoutProps {
    children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
    await connectDB();

    const user: IUser | null = await getSession();

    if (!user || user.role?.toLowerCase() !== "admin") {
        redirect("/dashboard");
    }

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-[#FBFBF9]">
            {/* Responsive Header & Navigation */}
            <AdminNav userEmail={user.email} />

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                {children}
            </main>
        </div>
    );
}