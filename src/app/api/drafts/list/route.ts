import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { listDraftsByUserId } from "@/lib/db/queries";

/**
 * GET /api/drafts/list
 * List all drafts for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const drafts = await listDraftsByUserId(user.id);

    return NextResponse.json({ drafts }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
