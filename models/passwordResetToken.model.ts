// models/PasswordResetToken.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPasswordResetToken extends Document {
  tokenHash: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>(
  {
    tokenHash: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // Document automatically expires and gets deleted after 15 minutes (900 seconds)
    createdAt: { type: Date, default: Date.now, expires: 900 },
  }
);

export const PasswordResetToken: Model<IPasswordResetToken> =
  mongoose.models.PasswordResetToken ||
  mongoose.model<IPasswordResetToken>("PasswordResetToken", PasswordResetTokenSchema);