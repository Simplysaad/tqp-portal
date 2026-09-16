// @/types/index.ts
import { MemorizationPosition } from "@/lib/quran";
import { AttendanceStatus, PerformanceRating } from "@/models/session.model";
import { Types } from "mongoose";

export type Gender = "male" | "female";
export type StudentStatus = "active" | "inactive" | "pending" | "graduated";

export interface IMemorization {
    juz: number;
    surah?: number;
    ayah?: number;
}

export interface IMemorizationRange {
    start?: MemorizationPosition;
    end?: MemorizationPosition;
}

export interface ITutorGroupRules {
    maxCapacity: number;
    femaleOnly: boolean;
    memorizationRange?: IMemorizationRange;
}

export interface IUser {
    _id: string;
    name: string;
    email: string;
    role: string;
}

export interface IStudent {
    _id: string;
    user: IUser | Types.ObjectId;
    matricNumber?: string;
    gender: Gender;
    faculty?: string;
    department?: string;
    level?: number;
    currentMemorization?: IMemorization;
    status: StudentStatus;
    tutor?: Types.ObjectId | ITutor;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

export interface ITutor {
    _id: string;
    user: IUser | Types.ObjectId;
    specialization?: string;
    gender: Gender;
    isAvailable: boolean;
    createdAt?: string | Date;
}

export interface ITutorGroup {
    _id: string;
    tutor: ITutor | Types.ObjectId;
    name: string;
    students: Array<IStudent | Types.ObjectId>;
    rules: ITutorGroupRules;
    isActive: boolean;
    createdAt?: string | Date;
}
export interface IStudentLogPayload {
    sessionId: string;
    studentId: string;
    newMemorization?: IMemorizationRange;
    revision?: IMemorizationRange;
}

export interface ITutorVerifyPayload {
    sessionId: string;
    tutorId: string;
    attendance: AttendanceStatus;
    performance?: PerformanceRating;
    tutorsComment?: string;
    newMemorization: IMemorizationRange;
    revision?: IMemorizationRange;
}

