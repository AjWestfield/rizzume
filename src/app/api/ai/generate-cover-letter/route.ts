import { NextRequest, NextResponse } from "next/server";
import { getCompletion } from "@/lib/ai/openrouter-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobTitle, companyName, jobDescription, resume, userName } = body;

    if (!jobTitle || !companyName) {
      return NextResponse.json(
        { error: "Job title and company name are required" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert career coach who writes compelling, personalized cover letters that get interviews.

Your cover letters should be:
- Professional but personable
- Specific to the job and company
- Highlighting relevant achievements with metrics when possible
- 3-4 paragraphs maximum
- Free of clichés and generic phrases

Never use phrases like "I believe I would be a great fit" or "I am writing to apply for...". Start with something more engaging.`;

    const userPrompt = `Write a compelling cover letter for:

**Position:** ${jobTitle}
**Company:** ${companyName}
**Applicant Name:** ${userName || "[Your Name]"}

${jobDescription ? `**Job Description:**\n${jobDescription}\n` : ""}
${resume ? `**Applicant's Background:**\n${resume}\n` : ""}

Write a professional cover letter that:
1. Opens with a compelling hook related to the company or role
2. Highlights 2-3 most relevant qualifications or achievements
3. Shows enthusiasm for the specific company and role
4. Ends with a confident call to action

Keep it concise (under 350 words) and impactful. Do NOT include any word count, character count, or metadata at the end of the letter.`;

    const coverLetter = await getCompletion(systemPrompt, userPrompt, {
      temperature: 0.8,
      maxTokens: 1024,
    });

    return NextResponse.json({
      success: true,
      coverLetter,
    });
  } catch (error) {
    console.error("[API] Cover letter generation error:", error);

    const message = error instanceof Error ? error.message : "An error occurred";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
