import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { crawlUrl } from "@/lib/crawl";
import { analyzeTone } from "@/lib/tone/analyze";

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }

    // Parse body
    const body = await request.json();
    const { url } = body;

    // Validate URL field
    if (!url || typeof url !== "string" || url.trim().length === 0) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
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

    // Crawl URL
    const crawlResult = await crawlUrl(url.trim());

    if (!crawlResult.ok) {
      // Map error codes to HTTP status codes
      if (crawlResult.code === "TIMEOUT") {
        return NextResponse.json(
          { error: crawlResult.error },
          { status: 408 }
        );
      }

      // NETWORK or INVALID_CONTENT
      return NextResponse.json(
        { error: crawlResult.error },
        { status: 422 }
      );
    }

    // Analyze tone
    const toneAnalysis = await analyzeTone(crawlResult.text);

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
    console.error("Error in train-url:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
