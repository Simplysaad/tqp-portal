import React, { Suspense } from "react";
import Link from "next/link";
import { Metadata } from "next";
import { BookOpen, ShieldCheck } from "lucide-react";
import { generateOSFAMetadata } from "@/lib/metadata";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = generateOSFAMetadata({
    path: "/register",
    title: "Create Account | TQP System",
    description: "Register for the TQP program to begin your structured memorisation journey and connect with assigned tutors.",
});

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-[#FBFBF9] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-amber-100 selection:text-amber-900">
            {/* Header / Brand */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 px-4">
                <Link href="/" className="inline-flex items-center gap-3 group">
                    <div className="w-12 h-12 rounded-xl bg-emerald-950 flex items-center justify-center text-amber-400 shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform border border-amber-500/30">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-2xl tracking-tight text-emerald-950">
                        TQP <span className="text-amber-600 font-serif font-normal text-xl">Portal</span>
                    </span>
                </Link>

                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-950 font-serif">
                    Create Your Account
                </h2>
                <p className="text-xs sm:text-sm text-gray-600">
                    Begin your structured Qur&apos;an memorisation journey today.
                </p>
            </div>

            {/* Main Form Container wrapped in Suspense */}
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
                <Suspense fallback={<div className="text-center py-8 text-sm text-gray-500">Loading form...</div>}>
                    <RegisterForm />
                </Suspense>

                {/* Security Note */}
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-800" />
                    <span>Protected with secure authentication & session logging</span>
                </div>
            </div>
        </div>
    );
}