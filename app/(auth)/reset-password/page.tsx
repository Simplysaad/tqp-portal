// app/reset-password/page.tsx
"use client";

import { useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/actions/auth-reset.action";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
        <div className="w-full max-w-md bg-white border border-zinc-200 rounded-xl p-6 text-center space-y-3">
          <h1 className="text-lg font-bold text-red-600">Invalid Link</h1>
          <p className="text-xs text-zinc-500">Missing password reset token from URL.</p>
        </div>
      </div>
    );
  }

  async function handleSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const res = await resetPassword(formData);
      if (res.error) {
        setMessage({ type: "error", text: res.error });
      } else if (res.success) {
        setMessage({ type: "success", text: res.success });
        setTimeout(() => router.push("/login"), 2000);
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Set New Password</h1>
          <p className="text-xs text-zinc-500 mt-1">Please enter your new password below.</p>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg text-xs font-medium ${
              message.type === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="token" value={token} />

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">New Password</label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              placeholder="At least 8 characters"
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
          >
            {isPending ? "Updating password..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}