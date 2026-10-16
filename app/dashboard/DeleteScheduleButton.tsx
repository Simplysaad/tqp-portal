"use client";

import { deleteSchedule } from "@/actions/tutor.action";
import { minutesToTime } from "@/models/tutor.model";

type ScheduleForDelete = {
    _id: string;
    dayOfWeek: string;
    startTime: number;
    endTime: number;
    mode?: string;
    googleMeetLink?: string;
};

export default function DeleteScheduleButton({ schedule }: { schedule: ScheduleForDelete }) {
    async function handleDelete() {
        const message =
`Are you sure you want to delete this schedule?

Day: ${schedule.dayOfWeek}
Time: ${minutesToTime(schedule.startTime)} - ${minutesToTime(schedule.endTime)}
Mode: ${schedule.mode || "online"}
${schedule.googleMeetLink ? `Link: ${schedule.googleMeetLink}` : ""}

This cannot be undone.`;

        const confirmed = window.confirm(message);
        if (!confirmed) return;

        try {
            const res = await deleteSchedule(schedule._id);
            if (res.success) {
                window.alert("Schedule deleted successfully");
            } else {
                window.alert(res.error || "Failed to delete schedule");
            }
        } catch {
            window.alert("Something went wrong while deleting");
        }
    }

    return (
        <button
            onClick={handleDelete}
            className="text-xs text-red-600 hover:text-red-800 border border-red-200 px-2 py-1 rounded"
        >
            Delete
        </button>
    );
}