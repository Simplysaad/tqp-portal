// app/api/quran-position/route.ts
import { NextResponse } from "next/server";
import { getMemorizationPosition } from "@/lib/quran"; // Your server-safe file

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const surah = searchParams.get("surah");
  const aayah = searchParams.get("aayah");

  if (!surah || !aayah) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const position = await getMemorizationPosition(surah, Number(aayah));
    return NextResponse.json(position);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
