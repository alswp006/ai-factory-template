import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { updateDraftEditedText } from "@/lib/db/queries";

/**
 * POST /api/drafts/[id]/edit
 * Update the editedText of a draft (user-scoped)
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const body = await request.json();

    const { editedText } = body;

    if (typeof editedText !== "string") {
      return NextResponse.json(
        { error: "editedText must be a string" },
        { status: 400 }
      );
    }

    const draft = await updateDraftEditedText({
      id,
      userId: user.id,
      editedText,
    });

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
