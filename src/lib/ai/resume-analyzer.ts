// AI Resume Analyzer - Uses OpenRouter (Grok 4.1 Fast) to analyze and score resumes

import { getCompletion } from "./openrouter-client";

export interface PersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  portfolio?: string;
}

export interface Skill {
  name: string;
  category: "technical" | "soft_skill" | "tool" | "language" | "framework" | "other";
  proficiency: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface Experience {
  company: string;
  title: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  achievements: string[];
  skills: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  gpa?: number;
  achievements: string[];
}

export interface ScoreBreakdown {
  completeness: number;
  skillsRelevance: number;
  experienceQuality: number;
  formatting: number;
  keywordOptimization: number;
}

export interface Suggestion {
  category: string;
  issue: string;
  suggestion: string;
  priority: "high" | "medium" | "low";
}

export interface ResumeAnalysis {
  // Parsed data
  parsedData: {
    personalInfo: PersonalInfo;
    summary?: string;
    skills: Skill[];
    experience: Experience[];
    education: Education[];
  };

  // Scoring
  score: number;
  scoreBreakdown: ScoreBreakdown;

  // Feedback
  strengths: string[];
  weaknesses: string[];
  suggestions: Suggestion[];
}

const ANALYSIS_SYSTEM_PROMPT = `You are an expert resume analyst and career coach. Your job is to thoroughly analyze resumes and provide actionable feedback.

You will analyze the resume text and return a JSON response with the following structure:

{
  "parsedData": {
    "personalInfo": {
      "name": "string or null",
      "email": "string or null",
      "phone": "string or null",
      "location": "string or null",
      "linkedin": "string or null",
      "portfolio": "string or null"
    },
    "summary": "professional summary text or null",
    "skills": [
      {
        "name": "skill name",
        "category": "technical|soft_skill|tool|language|framework|other",
        "proficiency": "beginner|intermediate|advanced|expert"
      }
    ],
    "experience": [
      {
        "company": "company name",
        "title": "job title",
        "startDate": "YYYY-MM or null",
        "endDate": "YYYY-MM or null",
        "isCurrent": true/false,
        "description": "role description or null",
        "achievements": ["achievement 1", "achievement 2"],
        "skills": ["skill used 1", "skill used 2"]
      }
    ],
    "education": [
      {
        "institution": "school name",
        "degree": "degree type",
        "field": "field of study or null",
        "startDate": "YYYY-MM or null",
        "endDate": "YYYY-MM or null",
        "gpa": number or null,
        "achievements": []
      }
    ]
  },
  "score": 0-100,
  "scoreBreakdown": {
    "completeness": 0-100,
    "skillsRelevance": 0-100,
    "experienceQuality": 0-100,
    "formatting": 0-100,
    "keywordOptimization": 0-100
  },
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "suggestions": [
    {
      "category": "Experience|Skills|Summary|Education|Formatting|Keywords",
      "issue": "what's wrong",
      "suggestion": "how to fix it",
      "priority": "high|medium|low"
    }
  ]
}

SCORING CRITERIA:
- completeness (25%): Has name, email, summary, 5+ skills, 1+ experience, 1+ education
- skillsRelevance (25%): Diverse skill categories, in-demand skills, appropriate proficiency levels
- experienceQuality (25%): Has achievements with metrics/numbers, shows progression, uses action verbs
- formatting (10%): Good summary length (50-200 words), uses bullet points, balanced sections
- keywordOptimization (15%): Uses industry keywords, action verbs, avoids clichés/buzzwords

BE HONEST with scoring - most resumes should score 50-75. Only truly excellent resumes score 80+.
A resume missing major sections or with weak content should score below 60.

Return ONLY valid JSON, no markdown or explanations.`;

/**
 * Analyze a resume using AI
 */
export async function analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
  const userPrompt = `Analyze this resume and provide a detailed JSON response with parsing, scoring, and feedback:

---
${resumeText}
---

Remember: Return ONLY valid JSON matching the specified structure. Be honest with the score - most resumes need improvement.`;

  try {
    const response = await getCompletion(ANALYSIS_SYSTEM_PROMPT, userPrompt, {
      temperature: 0.3, // Lower temperature for more consistent JSON
      maxTokens: 4096,
    });

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid AI response - no JSON found");
    }

    const analysis = JSON.parse(jsonMatch[0]) as ResumeAnalysis;

    // Validate and normalize the response
    return normalizeAnalysis(analysis);
  } catch (error) {
    console.error("[Resume Analyzer] Error:", error);
    throw new Error(
      `Failed to analyze resume: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Normalize and validate the analysis response
 */
function normalizeAnalysis(analysis: ResumeAnalysis): ResumeAnalysis {
  // Ensure score is within bounds
  analysis.score = Math.max(0, Math.min(100, Math.round(analysis.score)));

  // Normalize score breakdown
  const breakdown = analysis.scoreBreakdown;
  breakdown.completeness = Math.max(0, Math.min(100, Math.round(breakdown.completeness)));
  breakdown.skillsRelevance = Math.max(0, Math.min(100, Math.round(breakdown.skillsRelevance)));
  breakdown.experienceQuality = Math.max(0, Math.min(100, Math.round(breakdown.experienceQuality)));
  breakdown.formatting = Math.max(0, Math.min(100, Math.round(breakdown.formatting)));
  breakdown.keywordOptimization = Math.max(
    0,
    Math.min(100, Math.round(breakdown.keywordOptimization))
  );

  // Ensure arrays exist
  analysis.strengths = analysis.strengths || [];
  analysis.weaknesses = analysis.weaknesses || [];
  analysis.suggestions = analysis.suggestions || [];

  // Ensure parsed data exists
  if (!analysis.parsedData) {
    analysis.parsedData = {
      personalInfo: {},
      skills: [],
      experience: [],
      education: [],
    };
  }

  return analysis;
}

/**
 * Get score color based on score value
 */
export function getScoreColor(score: number): "red" | "yellow" | "green" {
  if (score < 60) return "red";
  if (score < 80) return "yellow";
  return "green";
}

/**
 * Get score label based on score value
 */
export function getScoreLabel(score: number): string {
  if (score < 60) return "Needs Improvement";
  if (score < 80) return "Good";
  return "Excellent";
}

/**
 * Calculate overall score from breakdown (weighted)
 */
export function calculateOverallScore(breakdown: ScoreBreakdown): number {
  const weights = {
    completeness: 0.25,
    skillsRelevance: 0.25,
    experienceQuality: 0.25,
    formatting: 0.1,
    keywordOptimization: 0.15,
  };

  return Math.round(
    breakdown.completeness * weights.completeness +
      breakdown.skillsRelevance * weights.skillsRelevance +
      breakdown.experienceQuality * weights.experienceQuality +
      breakdown.formatting * weights.formatting +
      breakdown.keywordOptimization * weights.keywordOptimization
  );
}
