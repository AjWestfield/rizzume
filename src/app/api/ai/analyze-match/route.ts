import { NextRequest, NextResponse } from "next/server";
import { getCompletion } from "@/lib/ai/openrouter-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobTitle, companyName, jobDescription, resume } = body;

    if (!jobTitle || !jobDescription) {
      return NextResponse.json(
        { error: "Job title and description are required" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert career coach and resume analyst. Your job is to analyze how well a candidate's resume matches a job posting and provide actionable feedback.

Be specific, constructive, and encouraging. Focus on:
1. Skills match (which required skills the candidate has vs missing)
2. Experience alignment
3. Keywords that should be added
4. Specific suggestions to improve the match

Format your response with clear sections using markdown.`;

    const userPrompt = resume
      ? `Analyze how well this resume matches the following job posting:

**Job Title:** ${jobTitle}
**Company:** ${companyName}
**Job Description:**
${jobDescription}

**Candidate's Resume:**
${resume}

Provide a detailed analysis with:
1. Match Score (out of 100)
2. Key Strengths (skills/experience that match well)
3. Gaps to Address (missing skills or experience)
4. Keywords to Add (terms from the job description to incorporate)
5. Specific Recommendations (actionable steps to improve the application)`
      : `Analyze this job posting and provide guidance on what an ideal candidate should highlight:

**Job Title:** ${jobTitle}
**Company:** ${companyName}
**Job Description:**
${jobDescription}

Provide:
1. Key Skills Required (must-have vs nice-to-have)
2. Experience Level Expected
3. Keywords to Include in Resume
4. Tips for Standing Out
5. Potential Interview Topics to Prepare For`;

    const analysis = await getCompletion(systemPrompt, userPrompt, {
      temperature: 0.7,
      maxTokens: 2048,
    });

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("[API] Resume analysis error:", error);

    const message = error instanceof Error ? error.message : "An error occurred";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
