import { NextRequest, NextResponse } from "next/server";
import type { ToneStatus } from "@/lib/training";

// In-memory store for tone profile status (resets on server restart — fine for MVP)
// Maps userId -> { trainedAt: ISO string }
export const __toneProfileStore = new Map<string, { trainedAt: string }>();

export async function GET(request: NextRequest) {
  // Check for x-user-id header (test environment) or session
  const userId = request.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const profile = __toneProfileStore.get(userId);

  const status: ToneStatus = {
    trained: !!profile,
    trainedAt: profile?.trainedAt ?? null,
  };

  return NextResponse.json(status);
}
