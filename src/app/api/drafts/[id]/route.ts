import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getDraftByIdForUserId } from "@/lib/db/queries";

/**
 * GET /api/drafts/[id]
 * Get a single draft by ID (user-scoped)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await context.params;

    const draft = await getDraftByIdForUserId(id, user.id);

    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json({ draft }, { status: 200 });
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
