import mongoose, { Schema, Document, Model, model, Types } from "mongoose";
import { IUser } from "./user.model";

// Union Types
export type DayOfWeek =
    | "sunday"
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday";

export type Gender = "male" | "female";

// Time Conversion Utility Functions
export const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
};

export const minutesToTime = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60)
        .toString()
        .padStart(2, "0");
    const minutes = (totalMinutes % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}`;
};

// Sub-document Interface

// Base Tutor Interface
export interface ITutor {
    user: Types.ObjectId | IUser
    gender: Gender;
    maximumStudents: number;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// Document Interface
export interface ITutorDocument extends ITutor, Document { }

// Model Interface
export interface ITutorModel extends Model<ITutorDocument> { }

// Main Tutor Schema
const tutorSchema = new Schema<ITutorDocument, ITutorModel>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
            unique: true,
            index: true,
        },
        gender: {
            type: String,
            enum: {
                values: ["male", "female"],
                message: "{VALUE} is not a valid gender",
            },
            required: [true, "Gender is required"],
        },
        // maximumStudents: {
        //     type: Number,
        //     required: [true, "Maximum students capacity is required"],
        //     min: [3, "Maximum students must be at least 3"],
        //     default: 5,
        // },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        }
    },
    {
        timestamps: true,
    }
);

const Tutor =
    (mongoose.models.Tutor as ITutorModel) ||
    model<ITutorDocument, ITutorModel>("Tutor", tutorSchema);

export default Tutor;