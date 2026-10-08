// lib/tokens.ts
import crypto from "crypto";

export function generateResetToken() {
  // Unhashed token sent to the user's email
  const rawToken = crypto.randomBytes(32).toString("hex");

  // SHA-256 hashed token stored in the database
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  return { rawToken, tokenHash };
}

export function hashToken(rawToken: string) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}