// @/actions/quran.action.ts
"use server";

import { getMemorizationPosition as getPosServer } from "@/lib/quran";

export async function fetchMemorizationPositionAction(surah: string, aayah: number) {
    try {
        const pos = await getPosServer(surah, aayah);
        return { success: true, pos };
    } catch (err: any) {
        console.error("Failed to fetch memorization position on server:", err);
        return { success: false, error: err.message || "Failed to fetch position" };
    }
}