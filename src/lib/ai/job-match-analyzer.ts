// AI Job Match Analyzer - Uses OpenRouter (Grok 4.1 Fast) to analyze resume-job fit

import { getCompletion } from "./openrouter-client";

export interface JobMatchResult {
  overallMatch: number; // 0-100 percentage
  matchLevel: "excellent" | "good" | "fair" | "poor";

  // Skill analysis
  matchedSkills: string[];
  missingSkills: string[];
  partialMatchSkills: string[]; // Skills that are similar but not exact

  // Experience analysis
  experienceMatch: {
    score: number;
    feedback: string;
    yearsRequired?: string;
    yearsHave?: string;
  };

  // Qualification analysis
  qualificationMatch: {
    score: number;
    met: string[];
    notMet: string[];
  };

  // Key insights
  strengths: string[]; // Why you're a good fit
  gaps: string[]; // Areas to improve

  // Actionable recommendations
  recommendations: {
    priority: "high" | "medium" | "low";
    action: string;
    impact: string;
  }[];

  // Summary for display
  summary: string;
}

const JOB_MATCH_SYSTEM_PROMPT = `You are an expert career advisor and recruiter. Your job is to analyze how well a candidate's resume matches a specific job posting.

Analyze the resume against the job requirements and return a JSON response with this exact structure:

{
  "overallMatch": 0-100,
  "matchLevel": "excellent|good|fair|poor",
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "partialMatchSkills": ["skill with similar variant"],
  "experienceMatch": {
    "score": 0-100,
    "feedback": "analysis of experience fit",
    "yearsRequired": "X years" or null,
    "yearsHave": "X years" or null
  },
  "qualificationMatch": {
    "score": 0-100,
    "met": ["qualification1", "qualification2"],
    "notMet": ["qualification1", "qualification2"]
  },
  "strengths": ["why they're a good fit point 1", "point 2"],
  "gaps": ["area to improve 1", "area 2"],
  "recommendations": [
    {
      "priority": "high|medium|low",
      "action": "specific action to take",
      "impact": "how this helps their application"
    }
  ],
  "summary": "2-3 sentence summary of the match"
}

SCORING GUIDELINES:
- 85-100 (excellent): Strong match, meets most requirements, relevant experience
- 70-84 (good): Solid match, meets core requirements, some gaps fillable
- 50-69 (fair): Partial match, has transferable skills but notable gaps
- 0-49 (poor): Significant mismatch, missing critical requirements

BE REALISTIC - consider transferable skills and related experience.
Focus on actionable feedback that helps the candidate improve their application.

Return ONLY valid JSON, no markdown or explanations.`;

/**
 * Analyze how well a resume matches a job posting
 */
export async function analyzeJobMatch(
  resumeText: string,
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  qualifications?: string[]
): Promise<JobMatchResult> {
  const qualificationsText = qualifications?.length
    ? `\nRequired Qualifications:\n${qualifications.map(q => `- ${q}`).join("\n")}`
    : "";

  const userPrompt = `Analyze how well this resume matches the job posting.

JOB DETAILS:
Title: ${jobTitle}
Company: ${companyName}
Description: ${jobDescription}
${qualificationsText}

---

CANDIDATE RESUME:
${resumeText}

---

Provide a detailed JSON analysis of the match. Be honest but constructive - focus on actionable insights.`;

  try {
    const response = await getCompletion(JOB_MATCH_SYSTEM_PROMPT, userPrompt, {
      temperature: 0.3,
      maxTokens: 2048,
    });

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid AI response - no JSON found");
    }

    const result = JSON.parse(jsonMatch[0]) as JobMatchResult;
    return normalizeJobMatchResult(result);
  } catch (error) {
    console.error("[Job Match Analyzer] Error:", error);
    throw new Error(
      `Failed to analyze job match: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Normalize and validate the job match result
 */
function normalizeJobMatchResult(result: JobMatchResult): JobMatchResult {
  // Ensure overall match is within bounds
  result.overallMatch = Math.max(0, Math.min(100, Math.round(result.overallMatch)));

  // Normalize match level based on score if not properly set
  if (!result.matchLevel || !["excellent", "good", "fair", "poor"].includes(result.matchLevel)) {
    if (result.overallMatch >= 85) result.matchLevel = "excellent";
    else if (result.overallMatch >= 70) result.matchLevel = "good";
    else if (result.overallMatch >= 50) result.matchLevel = "fair";
    else result.matchLevel = "poor";
  }

  // Ensure arrays exist
  result.matchedSkills = result.matchedSkills || [];
  result.missingSkills = result.missingSkills || [];
  result.partialMatchSkills = result.partialMatchSkills || [];
  result.strengths = result.strengths || [];
  result.gaps = result.gaps || [];
  result.recommendations = result.recommendations || [];

  // Ensure experience match exists
  if (!result.experienceMatch) {
    result.experienceMatch = {
      score: 50,
      feedback: "Experience analysis unavailable",
    };
  }

  // Ensure qualification match exists
  if (!result.qualificationMatch) {
    result.qualificationMatch = {
      score: 50,
      met: [],
      notMet: [],
    };
  }

  // Ensure summary exists
  if (!result.summary) {
    result.summary = `${result.overallMatch}% match for this position.`;
  }

  return result;
}

/**
 * Get match level color for UI
 */
export function getMatchLevelColor(matchLevel: JobMatchResult["matchLevel"]): string {
  switch (matchLevel) {
    case "excellent":
      return "green";
    case "good":
      return "blue";
    case "fair":
      return "yellow";
    case "poor":
      return "red";
    default:
      return "gray";
  }
}

/**
 * Get match level label for display
 */
export function getMatchLevelLabel(matchLevel: JobMatchResult["matchLevel"]): string {
  switch (matchLevel) {
    case "excellent":
      return "Excellent Match";
    case "good":
      return "Good Match";
    case "fair":
      return "Fair Match";
    case "poor":
      return "Needs Work";
    default:
      return "Unknown";
  }
}
