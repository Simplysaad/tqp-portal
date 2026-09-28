"use client";

import React, { useState, useMemo } from "react";
import SearchableSelect from "@/components/SearchableSelect";
import { INuruAlBayanPosition, INuruAlBayanRange } from "@/models/session.model";
import { NURU_AL_BAYAN_ENTRIES } from "@/lib/nuralbayan"; // Adjust import path as needed

interface EditBeginnerSessionModalContentProps {
    initialNewPosition?: INuruAlBayanRange;
    onSave: (newPosition: INuruAlBayanRange) => void | Promise<void>;
    onClose: () => void;
}

export default function EditBeginnerSessionModalContent({
    initialNewPosition,
    onSave,
    onClose,
}: EditBeginnerSessionModalContentProps) {
    // 1. Start Position State
    const [startPos, setStartPos] = useState<INuruAlBayanPosition>({
        chapter: initialNewPosition?.start?.chapter || "",
        page: initialNewPosition?.start?.page || 1,
        index: initialNewPosition?.start?.index || 0,
        section: initialNewPosition?.start?.section || "",
    });

    // 2. End Position State
    const [endPos, setEndPos] = useState<INuruAlBayanPosition>({
        chapter: initialNewPosition?.end?.chapter || "",
        page: initialNewPosition?.end?.page || 1,
        index: initialNewPosition?.end?.index || 0,
        section: initialNewPosition?.end?.section || "",
    });

    // 3. UI Status State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // SearchableSelect options derived from Nuru Al-Bayan entries
    const chapterOptions = useMemo(() => {
        return NURU_AL_BAYAN_ENTRIES.map((item) => ({
            label: `${item.index}. ${item.chapter} (${item.section}) - Page ${item.page}`,
            value: `${item.index}. ${item.chapter}`,
        }));
    }, []);

    // Handle dropdown selection for Start Chapter
    const handleStartChapterChange = (val: string) => {
        const selectedIndex = parseInt(val.split(".")[0], 10);
        const selectedEntry = NURU_AL_BAYAN_ENTRIES.find(
            (item) => item.index === selectedIndex
        );

        if (selectedEntry) {
            setStartPos({
                index: selectedEntry.index,
                section: selectedEntry.section,
                chapter: selectedEntry.chapter,
                page: selectedEntry.page,
            });
        }
    };

    // Handle dropdown selection for End Chapter
    const handleEndChapterChange = (val: string) => {
        const selectedIndex = parseInt(val.split(".")[0], 10);
        const selectedEntry = NURU_AL_BAYAN_ENTRIES.find(
            (item) => item.index === selectedIndex
        );

        if (selectedEntry) {
            setEndPos({
                index: selectedEntry.index,
                section: selectedEntry.section,
                chapter: selectedEntry.chapter,
                page: selectedEntry.page,
            });
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!startPos.chapter || !endPos.chapter) {
            setError("Please select both a starting and ending position.");
            return;
        }

        if (endPos.index < startPos.index) {
            setError("Ending chapter cannot precede the starting chapter.");
            return;
        }

        setIsSubmitting(true);

        try {
            const updatedNewPosition: INuruAlBayanRange = {
                start: startPos,
                end: endPos,
            };

            await onSave(updatedNewPosition);
        } catch (err: any) {
            setError(
                err.message || "Failed to update beginner progress. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleFormSubmit} className="space-y-5">
            <p className="text-xs text-gray-500">
                Review and adjust the student's logged Nuru Al-Bayan lesson range.
            </p>

            {error && (
                <div className="p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                    {error}
                </div>
            )}

            {/* START POSITION SECTION */}
            <div className="space-y-3 border-b pb-4">
                <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    Start Position
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="md:col-span-2">
                        <label className="block text-xs text-gray-600 mb-1">
                            Start Chapter / Lesson *
                        </label>
                        <SearchableSelect
                            options={chapterOptions}
                            value={startPos.chapter ? `${startPos.index}. ${startPos.chapter}` : ""}
                            onChange={handleStartChapterChange}
                            placeholder="Select Start Chapter"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Page (Auto)</label>
                        <input
                            type="number"
                            value={startPos.page || ""}
                            disabled
                            placeholder="Auto"
                            className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 rounded-lg text-sm cursor-not-allowed outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* END POSITION SECTION */}
            <div className="space-y-3">
                <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    End Position
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="md:col-span-2">
                        <label className="block text-xs text-gray-600 mb-1">
                            End Chapter / Lesson *
                        </label>
                        <SearchableSelect
                            options={chapterOptions}
                            value={endPos.chapter ? `${endPos.index}. ${endPos.chapter}` : ""}
                            onChange={handleEndChapterChange}
                            placeholder="Select End Chapter"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Page (Auto)</label>
                        <input
                            type="number"
                            value={endPos.page || ""}
                            disabled
                            placeholder="Auto"
                            className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 rounded-lg text-sm cursor-not-allowed outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-1.5"
                >
                    {isSubmitting ? (
                        <>
                            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Saving Changes...
                        </>
                    ) : (
                        "Verify & Apply"
                    )}
                </button>
            </div>
        </form>
    );
}