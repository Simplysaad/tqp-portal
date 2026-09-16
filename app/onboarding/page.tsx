import { getSession, logoutUser } from "@/actions/user.action";
import StudentOnboardingForm from "./StudentOnboarding";
import TutorOnboardingForm from "./TutorOnboarding";
import Student from "@/models/student.model";
import Tutor from "@/models/tutor.model";
import connectDB from "@/lib/db";
import { redirect } from "next/navigation";

import { generateOSFAMetadata } from "@/lib/metadata";
import { Metadata } from "next";
import User from "@/models/user.model";
export const metadata: Metadata = generateOSFAMetadata({
    path: "/onboarding",
    title: "Complete Onboarding | TQP System",
    description: "Complete your profile setup, select your gender, and set your initial memorisation level for group placement.",
})


const Onboarding = async () => {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    const { id: userId, role } = session;

    await connectDB();

    const currentUser = await User.findOne({ _id: userId });
    if (!currentUser) {
        logoutUser()
        redirect("/login?next=/onboarding")
    }

    const isStudent = await Student.findOne({ user: userId });
    const isTutor = await Tutor.findOne({ user: userId });

    const hasOnboarded = Boolean(isStudent || isTutor);

    if (hasOnboarded) {
        redirect("/dashboard");
    }

    if (role === "student") {
        return <StudentOnboardingForm userId={userId} />;
    }

    if (role === "tutor") {
        return <TutorOnboardingForm userId={userId} />;
    }

    redirect("/dashboard");
};

export default Onboarding;