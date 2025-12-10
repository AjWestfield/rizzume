import { NextRequest, NextResponse } from "next/server";
import { analyzeJobMatch, getMatchLevelColor, getMatchLevelLabel } from "@/lib/ai/job-match-analyzer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeText, jobTitle, companyName, jobDescription, qualifications } = body;

    // Validate required fields
    if (!resumeText) {
      return NextResponse.json(
        { error: "Resume text is required. Please upload and analyze your resume first." },
        { status: 400 }
      );
    }

    if (!jobTitle || !companyName) {
      return NextResponse.json(
        { error: "Job title and company name are required" },
        { status: 400 }
      );
    }

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required for analysis" },
        { status: 400 }
      );
    }

    console.log(`[Analyze Match] Analyzing match for ${jobTitle} at ${companyName}`);

    // Analyze the job match using AI
    const result = await analyzeJobMatch(
      resumeText,
      jobTitle,
      companyName,
      jobDescription,
      qualifications
    );

    return NextResponse.json({
      success: true,
      result,
      matchColor: getMatchLevelColor(result.matchLevel),
      matchLabel: getMatchLevelLabel(result.matchLevel),
    });
  } catch (error) {
    console.error("[Analyze Match] Error:", error);

    const errorMessage = error instanceof Error ? error.message : "Failed to analyze job match";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
