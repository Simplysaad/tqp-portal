"use client";

import React, { useState, useMemo, useEffect } from "react";
import SearchableSelect from "@/components/SearchableSelect";
import { NURU_AL_BAYAN_ENTRIES } from "@/lib/nuralbayan";
import { NuruAlBayanPosition } from "@/app/onboarding/BeginnerOnboarding";
import { INuruAlBayanRange } from "@/models/session.model";

interface EditBeginnerSessionModalContentProps {
  initialNewPosition?: INuruAlBayanRange;
  onSave: (newPosition: INuruAlBayanRange) => void;
  onClose: () => void;
}

export default function EditBeginnerSessionModalContent({
  initialNewPosition,
  onSave,
  onClose,
}: EditBeginnerSessionModalContentProps) {
  // 1. Start Position State
  const [startChapter, setStartChapter] = useState(initialNewPosition?.start?.chapter || "");
  const [startPage, setStartPage] = useState<number | "">(Number(initialNewPosition?.start?.page) || "");
  const [startSection, setStartSection] = useState(initialNewPosition?.start?.section || "");
  const [startIndex, setStartIndex] = useState<number>(Number(initialNewPosition?.start?.index) || 0);

  // 2. End Position State
  const [endChapter, setEndChapter] = useState(initialNewPosition?.end?.chapter || "");
  const [endPage, setEndPage] = useState<number | "">(Number(initialNewPosition?.end?.page) || "");
  const [endSection, setEndSection] = useState(initialNewPosition?.end?.section || "");
  const [endIndex, setEndIndex] = useState<number>(Number(initialNewPosition?.end?.index) || 0);

  // 3. UI Status State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chapterOptions = useMemo(() => {
    return NURU_AL_BAYAN_ENTRIES.map((item) => ({
      label: `${item.index}. ${item.chapter} (${item.section}) - Page ${item.page}`,
      value: `${item.index}. ${item.chapter}`,
    }));
  }, []);

  // Handle Start Chapter Change (Auto-fills page, section, index)
  const handleStartChange = (val: string) => {
    const selectedIndex = parseInt(val.split(".")[0], 10);
    const found = NURU_AL_BAYAN_ENTRIES.find((item) => item.index === selectedIndex);

    if (found) {
      setStartChapter(found.chapter);
      setStartPage(found.page);
      setStartSection(found.section);
      setStartIndex(found.index);
    }
  };

  // Handle End Chapter Change (Auto-fills page, section, index)
  const handleEndChange = (val: string) => {
    const selectedIndex = parseInt(val.split(".")[0], 10);
    const found = NURU_AL_BAYAN_ENTRIES.find((item) => item.index === selectedIndex);

    if (found) {
      setEndChapter(found.chapter);
      setEndPage(found.page);
      setEndSection(found.section);
      setEndIndex(found.index);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!startChapter || !endChapter) {
      setError("Please select both starting and ending Nuru Al-Bayan positions.");
      return;
    }

    if (endIndex < startIndex) {
      setError("Ending position cannot be behind starting position.");
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedRange: INuruAlBayanRange = {
        start: {
          chapter: startChapter,
          page: Number(startPage),
          section: startSection,
          index: startIndex,
        },
        end: {
          chapter: endChapter,
          page: Number(endPage),
          section: endSection,
          index: endIndex,
        },
      };

      onSave(updatedRange);
    } catch (err: any) {
      setError(err.message || "Failed to update Nuru Al-Bayan position. Please check your inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-5">
      <p className="text-xs text-gray-500">
        Correct or adjust the student's logged Nuru Al-Bayan lesson range.
      </p>

      {error && (
        <div className="p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
          {error}
        </div>
      )}

      {/* START POSITION SECTION */}
      <div className="space-y-3 pb-2">
        <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
          Start Position
        </h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label className="block text-xs text-gray-600 mb-1">Start Lesson / Chapter</label>
            <SearchableSelect
              options={chapterOptions}
              value={startChapter ? `${startIndex}. ${startChapter}` : ""}
              onChange={handleStartChange}
              placeholder="Select Start Chapter"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Page (Auto)</label>
            <input
              type="number"
              value={startPage}
              disabled
              placeholder="Auto"
              className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 rounded-lg text-sm cursor-not-allowed outline-none"
            />
          </div>
        </div>
      </div>

      {/* END POSITION SECTION */}
      <div className="space-y-3 pb-2">
        <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
          End Position
        </h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label className="block text-xs text-gray-600 mb-1">End Lesson / Chapter</label>
            <SearchableSelect
              options={chapterOptions}
              value={endChapter ? `${endIndex}. ${endChapter}` : ""}
              onChange={handleEndChange}
              placeholder="Select End Chapter"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Page (Auto)</label>
            <input
              type="number"
              value={endPage}
              disabled
              placeholder="Auto"
              className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 rounded-lg text-sm cursor-not-allowed outline-none"
            />
          </div>
        </div>
      </div>

      {/* Modal Actions */}
      <div className="flex justify-end space-x-2 pt-4">
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
              Saving...
            </>
          ) : (
            "Apply Changes"
          )}
        </button>
      </div>
    </form>
  );
}