import { NextRequest, NextResponse } from "next/server";
import { extractTextFromFile, isValidResumeFileType } from "@/lib/resume/text-extractor";
import { analyzeResume, getScoreColor, getScoreLabel } from "@/lib/ai/resume-analyzer";

export const maxDuration = 60; // Allow up to 60 seconds for AI processing

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let resumeText: string;

    // Handle file upload (multipart/form-data)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      if (!isValidResumeFileType(file.type)) {
        return NextResponse.json(
          { error: "Invalid file type. Please upload a PDF or DOCX file." },
          { status: 400 }
        );
      }

      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Extract text from file
      const extraction = await extractTextFromFile(buffer, file.type);

      if (extraction.error) {
        return NextResponse.json({ error: extraction.error }, { status: 400 });
      }

      if (!extraction.text || extraction.text.length < 50) {
        return NextResponse.json(
          { error: "Could not extract text from file. Please ensure the file contains readable text." },
          { status: 400 }
        );
      }

      resumeText = extraction.text;
    }
    // Handle JSON body with text
    else if (contentType.includes("application/json")) {
      const body = await request.json();
      resumeText = body.text;

      if (!resumeText || resumeText.length < 50) {
        return NextResponse.json(
          { error: "Resume text is too short. Please provide a complete resume." },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Invalid content type. Send multipart/form-data with file or JSON with text." },
        { status: 400 }
      );
    }

    // Analyze resume with AI
    console.log("[Resume Analyze] Analyzing resume, text length:", resumeText.length);
    const analysis = await analyzeResume(resumeText);

    // Create a plain serializable response object
    const response = {
      success: true,
      analysis: {
        score: analysis.score,
        scoreBreakdown: analysis.scoreBreakdown,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        suggestions: analysis.suggestions,
        parsedData: analysis.parsedData,
      },
      scoreColor: getScoreColor(analysis.score),
      scoreLabel: getScoreLabel(analysis.score),
      resumeText: String(resumeText), // Ensure plain string
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[API] Resume analysis error:", error);

    const message = error instanceof Error ? error.message : "An error occurred during analysis";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
