// AI Resume Optimizer - Uses OpenRouter (Grok 4.1 Fast) to optimize and improve resumes

import { getCompletion } from "./openrouter-client";
import type { ResumeAnalysis, Suggestion } from "./resume-analyzer";

export interface ResumeChange {
  section: string;
  before: string;
  after: string;
  reason: string;
}

export interface OptimizationResult {
  optimizedResume: string;
  changes: ResumeChange[];
  newScore: number;
  newScoreBreakdown: {
    completeness: number;
    skillsRelevance: number;
    experienceQuality: number;
    formatting: number;
    keywordOptimization: number;
  };
  improvementSummary: string;
}

const OPTIMIZATION_SYSTEM_PROMPT = `You are an expert resume writer and career coach. Your job is to take a resume and optimize it based on the identified weaknesses and suggestions.

You will receive:
1. The original resume text
2. The current analysis with weaknesses and suggestions
3. Instructions to improve the resume

Your task is to rewrite and improve the resume, then return a JSON response with:

{
  "optimizedResume": "The complete rewritten resume text with improvements",
  "changes": [
    {
      "section": "summary|experience|skills|education|formatting",
      "before": "original text snippet",
      "after": "improved text snippet",
      "reason": "why this change improves the resume"
    }
  ],
  "newScore": 85-100,
  "newScoreBreakdown": {
    "completeness": 80-100,
    "skillsRelevance": 80-100,
    "experienceQuality": 80-100,
    "formatting": 80-100,
    "keywordOptimization": 80-100
  },
  "improvementSummary": "A brief 1-2 sentence summary of key improvements made"
}

OPTIMIZATION GUIDELINES:
1. Add or improve the professional summary to be impactful and specific
2. Convert weak bullet points to achievement-focused statements with metrics
3. Add action verbs (Led, Developed, Implemented, Achieved, etc.)
4. Include quantifiable results where possible (%, $, time saved, etc.)
5. Optimize for ATS by including relevant keywords
6. Fix any formatting or structural issues
7. Remove clichés and generic statements
8. Ensure skills are categorized properly
9. Make job titles and dates clear and consistent
10. DO NOT use any markdown formatting (no asterisks, no bold syntax like **text**).
    Write section headers as plain text like "Professional Summary" not "**Professional Summary**".
    The resume should be plain text only - no markdown whatsoever.

The optimized resume should score significantly higher (80-100 range).

Return ONLY valid JSON, no markdown or explanations.`;

/**
 * Optimize a resume using AI based on the analysis
 */
export async function optimizeResume(
  originalText: string,
  analysis: ResumeAnalysis
): Promise<OptimizationResult> {
  // Build the user prompt with context
  const weaknessesText = analysis.weaknesses.join("\n- ");
  const suggestionsText = analysis.suggestions
    .map((s: Suggestion) => `[${s.priority.toUpperCase()}] ${s.category}: ${s.suggestion}`)
    .join("\n- ");

  const userPrompt = `Please optimize this resume based on the analysis provided:

---ORIGINAL RESUME---
${originalText}
---END RESUME---

---CURRENT ANALYSIS---
Current Score: ${analysis.score}/100

Weaknesses:
- ${weaknessesText}

Suggestions for Improvement:
- ${suggestionsText}
---END ANALYSIS---

Please rewrite and optimize this resume, addressing all weaknesses and implementing the suggestions. Return the complete optimized resume with a JSON response including the changes made and new score.

Remember: Return ONLY valid JSON matching the specified structure.`;

  try {
    const response = await getCompletion(OPTIMIZATION_SYSTEM_PROMPT, userPrompt, {
      temperature: 0.5, // Slightly higher for more creative improvements
      maxTokens: 6000, // Longer for complete resume rewrite
    });

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid AI response - no JSON found");
    }

    const result = JSON.parse(jsonMatch[0]) as OptimizationResult;

    // Validate and normalize the response
    return normalizeOptimization(result);
  } catch (error) {
    console.error("[Resume Optimizer] Error:", error);
    throw new Error(
      `Failed to optimize resume: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Normalize and validate the optimization response
 */
function normalizeOptimization(result: OptimizationResult): OptimizationResult {
  // Ensure new score is high (since it's optimized)
  result.newScore = Math.max(80, Math.min(100, Math.round(result.newScore)));

  // Normalize score breakdown
  const breakdown = result.newScoreBreakdown;
  breakdown.completeness = Math.max(75, Math.min(100, Math.round(breakdown.completeness)));
  breakdown.skillsRelevance = Math.max(75, Math.min(100, Math.round(breakdown.skillsRelevance)));
  breakdown.experienceQuality = Math.max(75, Math.min(100, Math.round(breakdown.experienceQuality)));
  breakdown.formatting = Math.max(75, Math.min(100, Math.round(breakdown.formatting)));
  breakdown.keywordOptimization = Math.max(
    75,
    Math.min(100, Math.round(breakdown.keywordOptimization))
  );

  // Ensure arrays exist
  result.changes = result.changes || [];

  // Ensure strings exist
  result.optimizedResume = result.optimizedResume || "";
  result.improvementSummary = result.improvementSummary || "Resume has been optimized.";

  return result;
}

/**
 * Generate a downloadable text version of the optimized resume
 */
export function formatResumeForDownload(optimizedResume: string): string {
  // Clean up any extra whitespace and format nicely
  return optimizedResume
    .replace(/\n{3,}/g, "\n\n") // Remove excessive line breaks
    .trim();
}
