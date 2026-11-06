import mongoose, { Schema, Document, Model, model, Types } from "mongoose";
import { IStudent } from "./student.model";
import { MemorizationPosition } from "@/lib/quran";

export type AttendanceStatus = "present" | "absent" | "partial" | "cancelled";
export type PerformanceRating = "excellent" | "good" | "fair" | "needs_work";

export interface IMemorizationRange {
    start?: MemorizationPosition;
    end?: MemorizationPosition;
}

// 1. Types for Nuru Al-Bayan / Beginner tracking
export interface INuruAlBayanPosition {
    chapter: string;
    page: number;
    index: number;
    section: string;
}

export interface INuruAlBayanRange {
    start?: INuruAlBayanPosition;
    end?: INuruAlBayanPosition;
}

export interface ISession {
    name: string;
    schedule: Types.ObjectId;
    student: Types.ObjectId | IStudent;
    tutor: Types.ObjectId;
    date: Date;
    startTime: number; // Minutes from midnight (0-1439)
    endTime: number;   // Minutes from midnight (0-1439)

    // Link & Metrics Extensions
    isLinkActive?: boolean;   // Turned true when the tutor activates the pseudo link
    joinedAt?: Date;          // Timestamp when the student clicked the join pseudo link
    clickCount?: number;      // Number of times student clicked the join link

    // Performance & Attendance Logged by Tutor After Class
    attendance: AttendanceStatus;
    approved: boolean;
    newMemorization?: IMemorizationRange; // Optional for Quran students
    newPosition?: INuruAlBayanRange;     // Optional for Beginner/Nuru Al-Bayan students
    revision?: IMemorizationRange;
    performance?: PerformanceRating;
    tutorsComment?: string;

    createdAt?: Date;
    updatedAt?: Date;
}

export interface ISessionDocument extends ISession, Document { }
export interface ISessionModel extends Model<ISessionDocument> { }

// --- Sub-Schemas ---

const quranPositionSchema = new Schema<MemorizationPosition>(
    {
        surah: { type: String, trim: true },
        aayah: { type: Number, min: 1 },
        page: { type: Number, min: 1, max: 604 },
        juz: { type: Number, min: 1, max: 30 },
    },
    { _id: false }
);

const memorizationRangeSchema = new Schema<IMemorizationRange>(
    {
        start: quranPositionSchema,
        end: quranPositionSchema,
    },
    { _id: false }
);

const nuruAlBayanPositionSchema = new Schema<INuruAlBayanPosition>(
    {
        chapter: { type: String, trim: true, default: "" },
        page: { type: Number, default: 1 },
        index: { type: Number, default: 0 },
        section: { type: String, trim: true, default: "" },
    },
    { _id: false }
);


const nuruAlBayanRangeSchema = new Schema<INuruAlBayanRange>(
    {
        start: nuruAlBayanPositionSchema,
        end: nuruAlBayanPositionSchema,
    },
    { _id: false }
);

// --- Session Main Schema ---

const sessionSchema = new Schema<ISessionDocument, ISessionModel>(
    {
        name: String,
        schedule: {
            type: Schema.Types.ObjectId,
            ref: "Schedule",
            required: [true, "Schedule reference is required"],
            index: true,
        },
        student: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            required: [true, "Student reference is required"],
            index: true,
        },
        tutor: {
            type: Schema.Types.ObjectId,
            ref: "Tutor",
            required: [true, "Tutor reference is required"],
            index: true,
        },
        date: {
            type: Date,
            required: [true, "Session date is required"],
            index: true,
        },
        startTime: {
            type: Number,
            required: [true, "Start time is required"],
            min: [0, "Start time cannot be less than 0"],
            max: [1439, "Start time cannot exceed 1439"],
        },
        endTime: {
            type: Number,
            required: [true, "End time is required"],
            min: [0, "Start time cannot be less than 0"],
            max: [1439, "End time cannot exceed 1439"],
        },

        // Extensions
        isLinkActive: {
            type: Boolean,
            default: false,
        },
        joinedAt: {
            type: Date,
        },
        clickCount: {
            type: Number,
            default: 0,
        },

        attendance: {
            type: String,
            enum: {
                values: ["present", "absent", "partial", "cancelled"],
                message: "{VALUE} is not a valid attendance status",
            },
            required: [true, "Attendance status is required"],
            default: "absent",
        },

        // Progress Ranges
        newMemorization: {
            type: memorizationRangeSchema,
            required: false,
        },
        newPosition: {
            type: nuruAlBayanRangeSchema,
            required: false,
        },
        revision: {
            type: memorizationRangeSchema,
            required: false,
        },

        performance: {
            type: String,
            enum: {
                values: ["excellent", "good", "fair", "needs_work"],
                message: "{VALUE} is not a valid performance rating",
            },
        },
        approved: {
            type: Boolean,
            default: false,
        },
        tutorsComment: {
            type: String,
            trim: true,
            maxlength: [1000, "Comment cannot exceed 1000 characters"],
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
sessionSchema.index({ schedule: 1, student: 1, date: 1 }, { unique: true });
sessionSchema.index({ student: 1, date: -1 });
sessionSchema.index({ tutor: 1, date: -1 });

// Time Validation Pre-hook
sessionSchema.pre("validate", function () {
    if (
        this.startTime !== undefined &&
        this.endTime !== undefined &&
        this.startTime >= this.endTime
    ) {
        this.invalidate("endTime", "End time must be strictly after start time");
    }
});

const Session =
    (mongoose.models.Session as ISessionModel) ||
    model<ISessionDocument, ISessionModel>("Session", sessionSchema);

export default Session;