"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    BookOpen,
    Mail,
    Lock,
    ShieldCheck,
    ArrowRight,
    Loader2,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import { PasswordInput } from "@/components/PasswordInput";
import { temporaryAdminPasswordReset } from "@/actions/auth-reset.action";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [message, setMessage] = useState<{
        type: "error" | "success";
        text: string;
    } | null>(null);

    async function handleSubmit(formData: FormData) {
        setMessage(null);

        const password = formData.get("password");
        const confirmPassword = formData.get("confirmPassword");

        if (
            typeof password !== "string" ||
            typeof confirmPassword !== "string" ||
            password.length < 8
        ) {
            setMessage({
                type: "error",
                text: "Your password must be at least 8 characters long.",
            });
            return;
        }

        if (password !== confirmPassword) {
            setMessage({
                type: "error",
                text: "Passwords do not match.",
            });
            return;
        }

        startTransition(async () => {
            try {
                const res = await temporaryAdminPasswordReset(formData);

                if (res?.error) {
                    setMessage({
                        type: "error",
                        text: res.error,
                    });
                } else if (res?.success) {
                    setMessage({
                        type: "success",
                        text: res.success,
                    });

                    setTimeout(() => router.push("/login"), 2000);
                } else {
                    setMessage({
                        type: "error",
                        text: "Unable to update your password. Please try again.",
                    });
                }
            } catch (error) {
                console.error("Temporary password reset error:", error);

                setMessage({
                    type: "error",
                    text: "An unexpected error occurred. Please try again.",
                });
            }
        });
    }

    return (
        <div className="min-h-screen bg-[#FBFBF9] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-amber-100 selection:text-amber-900">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 px-4">
                <Link href="/" className="inline-flex items-center gap-3 group">
                    <div className="w-12 h-12 rounded-xl bg-emerald-950 flex items-center justify-center text-amber-400 shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform border border-amber-500/30">
                        <BookOpen className="w-6 h-6" />
                    </div>

                    <span className="font-bold text-2xl tracking-tight text-emerald-950">
                        TQP{" "}
                        <span className="text-amber-600 font-serif font-normal text-xl">
                            Portal
                        </span>
                    </span>
                </Link>

                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-950 font-serif">
                    Reset Your Password
                </h2>

                <p className="text-xs sm:text-sm text-gray-600">
                    Enter your account email and choose a new password.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
                <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-emerald-950/5 rounded-2xl border border-amber-900/10 space-y-6">
                    {message && (
                        <div
                            role="status"
                            aria-live="polite"
                            className={`flex items-start gap-3 p-3 rounded-xl text-xs font-medium border ${
                                message.type === "error"
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : "bg-emerald-50 text-emerald-800 border-emerald-200"
                            }`}
                        >
                            {message.type === "error" ? (
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            ) : (
                                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                            )}
                            <span>{message.text}</span>
                        </div>
                    )}

                    <form action={handleSubmit} className="space-y-5">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
                            >
                                Email Address
                            </label>

                            <div className="relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <Mail className="w-4 h-4" />
                                </div>

                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    autoComplete="email"
                                    placeholder="example@email.com"
                                    className="block w-full pl-10 pr-3 py-2.5 sm:py-3 text-sm text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
                            >
                                New Password
                            </label>

                            <div className="relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 z-10">
                                    <Lock className="w-4 h-4" />
                                </div>

                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                    placeholder="At least 8 characters"
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
                            >
                                Confirm Password
                            </label>

                            <div className="relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 z-10">
                                    <Lock className="w-4 h-4" />
                                </div>

                                <PasswordInput
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                    placeholder="Re-enter your password"
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full py-3.5 px-4 bg-emerald-900 hover:bg-emerald-950 disabled:bg-emerald-900/70 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-950/15 border border-amber-500/20 flex items-center justify-center gap-2 transition-all hover:gap-3 cursor-pointer disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                                    <span>Updating password...</span>
                                </>
                            ) : (
                                <>
                                    <span>Update Password</span>
                                    <ArrowRight className="w-4 h-4 text-amber-400" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="pt-4 border-t border-gray-100 text-center text-xs text-gray-600">
                        Remember your password?{" "}
                        <Link
                            href="/login"
                            className="font-bold text-emerald-900 hover:text-emerald-950 hover:underline transition"
                        >
                            Login Here
                        </Link>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-800" />
                    <span>Temporary password recovery</span>
                </div>
            </div>
        </div>
    );
}
