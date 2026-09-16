"use client";

import React, { useState, useMemo, useEffect } from "react";
import SearchableSelect from "@/components/SearchableSelect";
import { QURAN_SURAHS } from "@/lib/surah";
import { IMemorizationRange } from "@/models/session.model";
import { getMemorizationPosition } from "@/lib/quran";

interface EditSessionModalContentProps {
  initialNewMem?: IMemorizationRange;
  initialRev?: IMemorizationRange;
  onSave: (newMem: IMemorizationRange, rev: IMemorizationRange) => void;
  onClose: () => void;
}

export default function EditSessionModalContent({
  initialNewMem,
  initialRev,
  onSave,
  onClose,
}: EditSessionModalContentProps) {
  // 1. New Memorization State
  const [startSurah, setStartSurah] = useState(initialNewMem?.start?.surah || "");
  const [startAayah, setStartAayah] = useState<number | "">(Number(initialNewMem?.start?.aayah) || "");
  const [startPage, setStartPage] = useState<number | "">(Number(initialNewMem?.start?.page) || "");

  const [endSurah, setEndSurah] = useState(initialNewMem?.end?.surah || "");
  const [endAayah, setEndAayah] = useState<number | "">(Number(initialNewMem?.end?.aayah) || "");
  const [endPage, setEndPage] = useState<number | "">(Number(initialNewMem?.end?.page) || "");

  // 2. Revision State
  const [revStartSurah, setRevStartSurah] = useState(initialRev?.start?.surah || "");
  const [revStartAayah, setRevStartAayah] = useState<number | "">(Number(initialRev?.start?.aayah) || "");
  const [revStartPage, setRevStartPage] = useState<number | "">(Number(initialRev?.start?.page) || "");

  const [revEndSurah, setRevEndSurah] = useState(initialRev?.end?.surah || "");
  const [revEndAayah, setRevEndAayah] = useState<number | "">(Number(initialRev?.end?.aayah) || "");
  const [revEndPage, setRevEndPage] = useState<number | "">(Number(initialRev?.end?.page) || "");

  // 3. UI Status State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const surahOptions = useMemo(
    () => QURAN_SURAHS.map((s) => ({ label: `${s.number}. ${s.name}`, value: s.name })),
    []
  );

  const getMaxAyahs = (surahName: string) => {
    const found = QURAN_SURAHS.find((s) => s.name.toLowerCase() === surahName.toLowerCase());
    return found ? found.totalAayahs : 286;
  };

  // --- Auto-calculate Pages using useEffect ---

  // New Mem Start Page
  useEffect(() => {
    if (!startSurah || startAayah === "") {
      setStartPage("");
      return;
    }
    let isMounted = true;
    getMemorizationPosition(startSurah, Number(startAayah))
      .then((pos) => isMounted && setStartPage(Number(pos.page)))
      .catch(() => isMounted && setStartPage(""));
    return () => { isMounted = false; };
  }, [startSurah, startAayah]);

  // New Mem End Page
  useEffect(() => {
    if (!endSurah || endAayah === "") {
      setEndPage("");
      return;
    }
    let isMounted = true;
    getMemorizationPosition(endSurah, Number(endAayah))
      .then((pos) => isMounted && setEndPage(Number(pos.page)))
      .catch(() => isMounted && setEndPage(""));
    return () => { isMounted = false; };
  }, [endSurah, endAayah]);

  // Revision Start Page
  useEffect(() => {
    if (!revStartSurah || revStartAayah === "") {
      setRevStartPage("");
      return;
    }
    let isMounted = true;
    getMemorizationPosition(revStartSurah, Number(revStartAayah))
      .then((pos) => isMounted && setRevStartPage(Number(pos.page)))
      .catch(() => isMounted && setRevStartPage(""));
    return () => { isMounted = false; };
  }, [revStartSurah, revStartAayah]);

  // Revision End Page
  useEffect(() => {
    if (!revEndSurah || revEndAayah === "") {
      setRevEndPage("");
      return;
    }
    let isMounted = true;
    getMemorizationPosition(revEndSurah, Number(revEndAayah))
      .then((pos) => isMounted && setRevEndPage(Number(pos.page)))
      .catch(() => isMounted && setRevEndPage(""));
    return () => { isMounted = false; };
  }, [revEndSurah, revEndAayah]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      let updatedNewMem: IMemorizationRange = {};
      if (startSurah && startAayah && endSurah && endAayah) {
        const start = await getMemorizationPosition(startSurah, Number(startAayah));
        const end = await getMemorizationPosition(endSurah, Number(endAayah));
        updatedNewMem = { start, end };
      }

      let updatedRev: IMemorizationRange = {};
      if (revStartSurah && revStartAayah && revEndSurah && revEndAayah) {
        const start = await getMemorizationPosition(revStartSurah, Number(revStartAayah));
        const end = await getMemorizationPosition(revEndSurah, Number(revEndAayah));
        updatedRev = { start, end };
      }

      onSave(updatedNewMem, updatedRev);
    } catch (err: any) {
      setError(err.message || "Failed to calculate Quran positions. Please check your inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-5">
      <p className="text-xs text-gray-500">
        Correct or adjust the student's logged memorization and revision ranges.
      </p>

      {error && (
        <div className="p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
          {error}
        </div>
      )}

      {/* NEW MEMORIZATION SECTION */}
      <div className="space-y-3 border-b pb-4">
        <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
          New Memorization (Sabqi)
        </h4>

        {/* Start Position */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Start Surah</label>
            <SearchableSelect
              options={surahOptions}
              value={startSurah}
              onChange={setStartSurah}
              placeholder="Start Surah"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Start Ayah</label>
            <input
              type="number"
              min={1}
              max={getMaxAyahs(startSurah)}
              value={startAayah}
              onChange={(e) => setStartAayah(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
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

        {/* End Position */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">End Surah</label>
            <SearchableSelect
              options={surahOptions}
              value={endSurah}
              onChange={setEndSurah}
              placeholder="End Surah"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">End Ayah</label>
            <input
              type="number"
              min={1}
              max={getMaxAyahs(endSurah)}
              value={endAayah}
              onChange={(e) => setEndAayah(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
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

      {/* REVISION SECTION */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider">
          Revision (Manzil)
        </h4>

        {/* Rev Start Position */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Start Surah</label>
            <SearchableSelect
              options={surahOptions}
              value={revStartSurah}
              onChange={setRevStartSurah}
              placeholder="Start Surah"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Start Ayah</label>
            <input
              type="number"
              min={1}
              max={getMaxAyahs(revStartSurah)}
              value={revStartAayah}
              onChange={(e) => setRevStartAayah(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Page (Auto)</label>
            <input
              type="number"
              value={revStartPage}
              disabled
              placeholder="Auto"
              className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 rounded-lg text-sm cursor-not-allowed outline-none"
            />
          </div>
        </div>

        {/* Rev End Position */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">End Surah</label>
            <SearchableSelect
              options={surahOptions}
              value={revEndSurah}
              onChange={setRevEndSurah}
              placeholder="End Surah"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">End Ayah</label>
            <input
              type="number"
              min={1}
              max={getMaxAyahs(revEndSurah)}
              value={revEndAayah}
              onChange={(e) => setRevEndAayah(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Page (Auto)</label>
            <input
              type="number"
              value={revEndPage}
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