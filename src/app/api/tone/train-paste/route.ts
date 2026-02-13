import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { analyzeTone } from "@/lib/tone/analyze";
import { MAX_SAMPLE_CHARS } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }

    // Parse body
    const body = await request.json();
    const { text } = body;

    // Validate text field
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Check character limit
    if (text.length > MAX_SAMPLE_CHARS) {
      return NextResponse.json(
        { error: `Text exceeds maximum length of ${MAX_SAMPLE_CHARS} characters` },
        { status: 413 }
      );
    }

    // Check if user already has a tone profile
    const existingProfile = await prisma.toneProfile.findUnique({
      where: { userId: user.id },
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: "Tone profile already exists" },
        { status: 409 }
      );
    }

    // Analyze tone
    const toneAnalysis = await analyzeTone(text.trim());

    // Create tone profile
    const toneProfile = await prisma.toneProfile.create({
      data: {
        userId: user.id,
        tone: toneAnalysis.tone,
        style: toneAnalysis.style,
        audience: toneAnalysis.audience,
      },
    });

    return NextResponse.json({
      trained: true,
      trainedAt: toneProfile.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error in train-paste:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
