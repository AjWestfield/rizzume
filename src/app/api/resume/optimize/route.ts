import { NextRequest, NextResponse } from "next/server";
import { optimizeResume } from "@/lib/ai/resume-optimizer";
import { getScoreColor, getScoreLabel, type ResumeAnalysis } from "@/lib/ai/resume-analyzer";

export const maxDuration = 60; // Allow up to 60 seconds for AI processing

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeText, analysis } = body as {
      resumeText: string;
      analysis: ResumeAnalysis;
    };

    if (!resumeText || resumeText.length < 50) {
      return NextResponse.json(
        { error: "Resume text is required and must be at least 50 characters" },
        { status: 400 }
      );
    }

    if (!analysis) {
      return NextResponse.json(
        { error: "Original analysis is required for optimization" },
        { status: 400 }
      );
    }

    // Optimize resume with AI
    console.log("[Resume Optimize] Optimizing resume, original score:", analysis.score);
    const optimization = await optimizeResume(resumeText, analysis);

    // Add color and label to response
    const response = {
      success: true,
      optimization,
      scoreColor: getScoreColor(optimization.newScore),
      scoreLabel: getScoreLabel(optimization.newScore),
    };

    console.log("[Resume Optimize] Optimization complete, new score:", optimization.newScore);

    return NextResponse.json(response);
  } catch (error) {
    console.error("[API] Resume optimization error:", error);

    const message = error instanceof Error ? error.message : "An error occurred during optimization";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
