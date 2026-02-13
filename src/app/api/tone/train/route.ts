import { NextRequest, NextResponse } from "next/server";
import { __toneProfileStore } from "../status/route";

export async function POST(request: NextRequest) {
  // Check for x-user-id header (test environment) or session
  const userId = request.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const body = await request.json();
  const { url } = body;

  if (!url || typeof url !== "string" || url.trim().length === 0) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  // Simulate training (in real app, this would crawl the URL and extract tone)
  const trainedAt = new Date().toISOString();
  __toneProfileStore.set(userId, { trainedAt });

  return NextResponse.json({ ok: true, trainedAt });
}
