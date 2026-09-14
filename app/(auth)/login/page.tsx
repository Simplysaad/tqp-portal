import { Metadata } from "next";
import { generateOSFAMetadata } from "@/lib/metadata";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = generateOSFAMetadata({
    path: "/login",
    title: "Sign In | TQP System",
    description: "Log in to your TQP portal account to access your dashboard, schedules, and learning groups.",
});

export default function LoginPage() {
    return <LoginForm />;
}