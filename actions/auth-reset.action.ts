// app/actions/auth-reset.ts
"use server";

import crypto from "crypto";
import { Resend } from "resend";
import bcrypt from "bcryptjs";
import connectDB  from "@/lib/db"; 
import { PasswordResetToken } from "@/models/passwordResetToken.model";
import { generateResetToken, hashToken } from "@/lib/tokens";
import User from "@/models/user.model";

const resend = new Resend(process.env.RESEND_API_KEY);


// Action 1: Request Password Reset
export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email || typeof email !== "string") {
    return { error: "Please provide a valid email address." };
  }

  try {
    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Prevent account enumeration by returning generic success message
    if (!user) {
      return {
        success:
          "If an account exists with that email, we sent a link to reset your password.",
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

    const resetUrl = `${process.env.BASE_URL}/reset-password?token=${rawToken}`;

    // Send email via Resend
    await resend.emails.send({
      from: "Security <onboarding@resend.dev>", // Replace with your verified domain
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

    return {
      success:
        "If an account exists with that email, we sent a link to reset your password.",
    };
  } catch (error) {
    console.error("Forgot password error:", error);
    return { error: "An unexpected error occurred. Please try again later." };
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
      hashedPassword,
    });

    // Delete the used reset token
    await PasswordResetToken.deleteOne({ _id: resetRecord._id });

    return { success: "Password successfully updated. You can now log in." };
  } catch (error) {
    console.error("Reset password error:", error);
    return { error: "Failed to reset password. Please try again." };
  }
}