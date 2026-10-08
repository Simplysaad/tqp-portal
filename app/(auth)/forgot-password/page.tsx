// app/forgot-password/page.tsx
"use client";

import { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import {
  BookOpen,
  Mail,
  ShieldCheck,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { requestPasswordReset } from "@/actions/auth-reset.action";

function ForgotPasswordContent() {
  const [isPending, startTransition] = useTransition();

  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  async function handleSubmit(formData: FormData) {
    setMessage(null);

    startTransition(async () => {
      try {
        const res = await requestPasswordReset(formData);

        if (res.error) {
          setMessage({
            type: "error",
            text: res.error,
          });
        } else if (res.success) {
          setMessage({
            type: "success",
            text: res.success,
          });
        }
      } catch (error) {
        console.error("Password reset request error:", error);

        setMessage({
          type: "error",
          text: "An unexpected error occurred. Please try again.",
        });
      }
    });
  }

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-amber-100 selection:text-amber-900">
      {/* Header / Brand */}
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
          Forgot Your Password?
        </h2>

        <p className="text-xs sm:text-sm text-gray-600">
          Enter your account email and we&apos;ll send you a link to reset your
          password.
        </p>
      </div>

      {/* Main Form Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-emerald-950/5 rounded-2xl border border-amber-900/10 space-y-6">
          {/* Status Message */}
          {message && (
            <div
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
            {/* Email Address */}
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
                  placeholder="example@email.com"
                  autoComplete="email"
                  className="block w-full pl-10 pr-3 py-2.5 sm:py-3 text-sm text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 px-4 bg-emerald-900 hover:bg-emerald-950 disabled:bg-emerald-900/70 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-950/15 border border-amber-500/20 flex items-center justify-center gap-2 transition-all hover:gap-3 cursor-pointer disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Sending link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
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

        {/* Security Note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
          <ShieldCheck className="w-4 h-4 text-emerald-800" />
          <span>Secure password recovery</span>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-900" />
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
