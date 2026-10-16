// app/actions/auth-reset.ts
"use server";

import crypto from "crypto";
import { Resend } from "resend";
import bcrypt from "bcryptjs";
import connectDB  from "@/lib/db"; 
import { PasswordResetToken } from "@/models/passwordResetToken.model";
import { generateResetToken, hashToken } from "@/lib/tokens";
import User from "@/models/user.model";
import { redirect } from "next/navigation"; // Added for direct redirection

const resend = new Resend(process.env.RESEND_API_KEY);


// Action 1: Request Password Reset
export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email || typeof email !== "string") {
    return { error: "Please provide a valid email address." };
  }

  // Define this outside the try block so it's accessible by the redirect function
  let resetUrl = "";

  try {
    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Prevent account enumeration by returning generic success message
    if (!user) {
      return {
        success:
          // "If an account exists with that email, we sent a link to reset your password.",
          "If an account exists with that email, you will be redirected in a few seconds...",
      };
    }

    // Clear existing reset tokens for this user
    await PasswordResetToken.deleteMany({ userId: user._id });

    // Generate raw & hashed token
    const { rawToken, tokenHash } = generateResetToken();

    await PasswordResetToken.create({
      tokenHash,
      userId: user._id,
    });

    // Generate the URL (Fallback to localhost if BASE_URL environment variable is missing)
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

    /* -------------------------------------------------------------------------- */
    /* BYPASSED: Email system skipped temporarily                                 */
    /* -------------------------------------------------------------------------- */
    /*
    await resend.emails.send({
      from: "Security <onboarding@resend.dev>", 
      to: user.email,
      subject: "Reset your password",
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset. Click the button below to set a new password. This link expires in 15 minutes.</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 16px 0;">Reset Password</a>
          <p style="color: #666; font-size: 12px;">If you did not request this email, you can safely ignore it.</p>
        </div>
      `,
    });
    */

  } catch (error) {
    console.error("Forgot password error:", error);
    return { error: "An unexpected error occurred. Please try again later." };
  }

  // Next.js redirect must be called outside the try/catch block 
  // because it works by throwing an internal routing error.
  if (resetUrl) {
    redirect(resetUrl);
    //return;
  }
}


// Action 2: Reset Password with Token
export async function resetPassword(formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;

  if (!token || !password || password.length < 8) {
    return { error: "Password must be at least 8 characters long." };
  }

  try {
    await connectDB();

    const tokenHash = hashToken(token);

    const resetRecord = await PasswordResetToken.findOne({ tokenHash });

    if (!resetRecord) {
      return {
        error: "Invalid or expired password reset link. Please request a new one.",
      };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password on User document
    await User.findByIdAndUpdate(resetRecord.userId, {
      password: hashedPassword,
    });

    // Delete the used reset token
    await PasswordResetToken.deleteOne({ _id: resetRecord._id });

    return { success: "Password successfully updated. You can now log in." };
  } catch (error) {
    console.error("Reset password error:", error);
    return { error: "Failed to reset password. Please try again." };
  }
}



// export function getLagosDate(): string {
//     const parts = new Intl.DateTimeFormat("en-GB", {
//         timeZone: "Africa/Lagos",
//         year: "numeric",
//         month: "2-digit",
//         day: "2-digit",
//     }).formatToParts(new Date());

//     const values = Object.fromEntries(
//         parts.map((part) => [part.type, part.value])
//     );

//     return `${values.year}-${values.month}-${values.day}`;
// }

// function safeCompare(a: string, b: string): boolean {
//     const aBuffer = Buffer.from(a, "utf8");
//     const bBuffer = Buffer.from(b, "utf8");

//     if (aBuffer.length !== bBuffer.length) return false;

//     return crypto.timingSafeEqual(aBuffer, bBuffer);
// }

// export async function temporaryAdminPasswordReset(
//     formData: FormData
// ) {
//     const email = formData.get("email");
//     const password = formData.get("password");
//     const confirmPassword = formData.get("confirmPassword");
//     const date = formData.get("date");
//     // const accessCode = formData.get("accessCode");

//     if (
//         typeof email !== "string" ||
//         typeof password !== "string" ||
//         typeof confirmPassword !== "string" ||
//         typeof date !== "string" ||
//         // typeof accessCode !== "string"
//     ) {
//         return { error: "Please complete all fields." };
//     }

//     const normalizedEmail = email.trim().toLowerCase();

//     if (
//         !normalizedEmail ||
//         !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
//     ) {
//         return { error: "Please enter a valid email address." };
//     }

//     if (password.length < 8) {
//         return {
//             error: "Your password must be at least 8 characters long.",
//         };
//     }

//     if (password !== confirmPassword) {
//         return { error: "Passwords do not match." };
//     }

//     // Enforce the date check on the server, not just in the UI.
//     // if (date !== getLagosDate()) {
//     //     return {
//     //         error: "This reset link has expired. Please request a new link through WhatsApp.",
//     //     };
//     // }

//     // const expectedSecret = process.env.TEMP_RESET_SECRET;

//     // if (!expectedSecret || !safeCompare(accessCode, expectedSecret)) {
//     //     return {
//     //         error: "Invalid access code. Please request a new reset code from the administrator.",
//     //     };
//     // }

//     try {
//         await connectDB();

//         const user = await User.findOne({ email: normalizedEmail });

//         if (!user) {
//             return {
//                 error: "No account was found with that email address.",
//             };
//         }

//         const hashedPassword = await bcrypt.hash(password, 12);

//         user.password = hashedPassword;
//         await user.save();

//         return {
//             success: "Password successfully updated. You can now log in.",
//         };
//     } catch (error) {
//         console.error("Temporary password reset error:", error);

//         return {
//             error: "Failed to reset the password. Please try again later.",
//         };
//     }
// }
