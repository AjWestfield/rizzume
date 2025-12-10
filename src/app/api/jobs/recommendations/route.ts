import { NextRequest, NextResponse } from "next/server";
import { searchAllJobsForRecommendations } from "@/lib/jobs/combined-job-search";
import type { Job } from "@/types/job";
import type { Skill, Experience } from "@/lib/ai/resume-analyzer";

interface ParsedData {
  skills: Skill[];
  experience: Experience[];
  summary?: string;
}

interface JobWithMatch extends Job {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
}

interface RecommendationsResponse {
  jobs: JobWithMatch[];
  searchQuery: string;
  extractedTitles: string[];
  extractedSkills: string[];
}

// Skill synonyms for better matching
const SKILL_SYNONYMS: Record<string, string[]> = {
  "javascript": ["js", "es6", "es2015", "ecmascript"],
  "typescript": ["ts"],
  "react": ["reactjs", "react.js", "react js"],
  "node": ["nodejs", "node.js", "node js"],
  "python": ["py", "python3"],
  "java": ["java8", "java11", "java17"],
  "c#": ["csharp", "c sharp", ".net", "dotnet"],
  "c++": ["cpp", "cplusplus"],
  "sql": ["mysql", "postgresql", "postgres", "sqlite", "mssql", "sql server"],
  "aws": ["amazon web services", "ec2", "s3", "lambda"],
  "azure": ["microsoft azure"],
  "gcp": ["google cloud", "google cloud platform"],
  "docker": ["containers", "containerization"],
  "kubernetes": ["k8s"],
  "git": ["github", "gitlab", "version control"],
  "ci/cd": ["cicd", "continuous integration", "continuous deployment", "jenkins", "github actions"],
  "api": ["rest", "restful", "graphql", "apis"],
  "frontend": ["front end", "front-end", "ui", "user interface"],
  "backend": ["back end", "back-end", "server side"],
  "fullstack": ["full stack", "full-stack"],
  "mobile": ["ios", "android", "react native", "flutter"],
  "database": ["db", "databases", "data storage"],
  "machine learning": ["ml", "ai", "artificial intelligence", "deep learning"],
  "data science": ["data analysis", "analytics", "data analyst"],
  "devops": ["dev ops", "site reliability", "sre"],
  "agile": ["scrum", "kanban", "sprint"],
  "testing": ["qa", "quality assurance", "test automation", "unit testing"],
};

// Extended list of tech skills to extract from job descriptions
const EXTENDED_SKILLS = [
  // Languages
  "javascript", "typescript", "python", "java", "c#", "c++", "go", "golang", "rust", "ruby", "php", "swift", "kotlin", "scala", "r",
  // Frontend
  "react", "angular", "vue", "svelte", "next", "nextjs", "gatsby", "html", "css", "sass", "scss", "tailwind", "bootstrap", "jquery",
  // Backend
  "node", "express", "fastify", "django", "flask", "spring", "rails", "laravel", "asp.net", "fastapi",
  // Databases
  "sql", "mysql", "postgresql", "postgres", "mongodb", "redis", "elasticsearch", "cassandra", "dynamodb", "firebase", "supabase",
  // Cloud & DevOps
  "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible", "jenkins", "circleci", "github actions", "linux", "nginx",
  // Data & ML
  "machine learning", "data science", "tensorflow", "pytorch", "pandas", "numpy", "spark", "hadoop", "tableau", "power bi",
  // Mobile
  "ios", "android", "react native", "flutter", "swift", "kotlin",
  // Tools
  "git", "jira", "confluence", "figma", "sketch", "postman",
  // Concepts
  "api", "rest", "graphql", "microservices", "ci/cd", "agile", "scrum", "testing", "tdd", "devops",
  // Soft skills
  "leadership", "communication", "teamwork", "problem solving", "analytical",
];

/**
 * Normalize skill names for comparison
 */
function normalizeSkill(skill: string): string {
  return skill
    .toLowerCase()
    .replace(/\.js$/i, "")
    .replace(/\.ts$/i, "")
    .replace(/[-_]/g, " ")
    .trim();
}

/**
 * Check if two skills match (including synonyms)
 */
function skillsMatch(userSkill: string, jobSkill: string): boolean {
  const normalizedUser = normalizeSkill(userSkill);
  const normalizedJob = normalizeSkill(jobSkill);

  // Direct match
  if (normalizedUser === normalizedJob) return true;
  if (normalizedUser.includes(normalizedJob) || normalizedJob.includes(normalizedUser)) return true;

  // Check synonyms
  for (const [primary, synonyms] of Object.entries(SKILL_SYNONYMS)) {
    const allVariants = [primary, ...synonyms];
    const userMatches = allVariants.some(v => normalizedUser.includes(v) || v.includes(normalizedUser));
    const jobMatches = allVariants.some(v => normalizedJob.includes(v) || v.includes(normalizedJob));
    if (userMatches && jobMatches) return true;
  }

  return false;
}

/**
 * Extract unique job titles from experience (most recent first)
 */
function extractJobTitles(experience: Experience[]): string[] {
  const titles = experience
    .slice(0, 3) // Top 3 most recent
    .map((exp) => exp.title)
    .filter((title): title is string => Boolean(title));

  // Remove duplicates while preserving order
  return [...new Set(titles)].slice(0, 2);
}

/**
 * Extract ALL skills from resume (not just top 5)
 */
function extractAllSkills(skills: Skill[]): string[] {
  // Get all unique skill names, prioritizing by proficiency
  const proficiencyOrder = ["expert", "advanced", "intermediate", "beginner"];

  const sortedSkills = [...skills].sort((a, b) => {
    const aIndex = proficiencyOrder.indexOf(a.proficiency);
    const bIndex = proficiencyOrder.indexOf(b.proficiency);
    return aIndex - bIndex;
  });

  // Get ALL skill names (up to 20)
  const allSkills = sortedSkills
    .slice(0, 20)
    .map((s) => s.name);

  return [...new Set(allSkills)];
}

/**
 * Extract top skills for search query (keep this limited)
 */
function extractTopSkills(skills: Skill[]): string[] {
  const proficiencyOrder = ["expert", "advanced", "intermediate", "beginner"];

  const sortedSkills = [...skills].sort((a, b) => {
    const aIndex = proficiencyOrder.indexOf(a.proficiency);
    const bIndex = proficiencyOrder.indexOf(b.proficiency);
    return aIndex - bIndex;
  });

  const topSkills = sortedSkills
    .filter((s) => s.category === "technical" || s.category === "framework" || s.category === "tool")
    .slice(0, 5)
    .map((s) => s.name);

  return [...new Set(topSkills)];
}

/**
 * Check if job title matches user's experience
 */
function jobTitleMatches(jobTitle: string, userTitles: string[]): boolean {
  const normalizedJobTitle = jobTitle.toLowerCase();

  for (const userTitle of userTitles) {
    const normalizedUserTitle = userTitle.toLowerCase();

    // Check for common title patterns
    const titleKeywords = ["developer", "engineer", "analyst", "manager", "designer", "specialist", "coordinator", "administrator", "consultant"];

    for (const keyword of titleKeywords) {
      if (normalizedJobTitle.includes(keyword) && normalizedUserTitle.includes(keyword)) {
        return true;
      }
    }

    // Check if significant overlap in words
    const jobWords = normalizedJobTitle.split(/\s+/).filter(w => w.length > 2);
    const userWords = normalizedUserTitle.split(/\s+/).filter(w => w.length > 2);
    const matchingWords = jobWords.filter(w => userWords.some(uw => uw.includes(w) || w.includes(uw)));

    if (matchingWords.length >= 1) return true;
  }

  return false;
}

/**
 * Calculate match score between user skills and job requirements
 */
function calculateMatchScore(
  userSkills: string[],
  userTitles: string[],
  jobTitle: string,
  jobSkills: string[] | null | undefined,
  jobDescription: string
): { score: number; matched: string[]; missing: string[] } {
  const normalizedUserSkills = userSkills.map(normalizeSkill);

  // Get job required skills or extract from description
  let requiredSkills: string[] = [];

  if (jobSkills && jobSkills.length > 0) {
    requiredSkills = jobSkills.map(normalizeSkill);
  } else {
    // Extract skills from job description using extended list
    const descLower = jobDescription.toLowerCase();
    requiredSkills = EXTENDED_SKILLS.filter((skill) => {
      const normalized = normalizeSkill(skill);
      return descLower.includes(normalized);
    });
  }

  // Calculate skill matches
  const matched: string[] = [];
  const missing: string[] = [];

  for (const reqSkill of requiredSkills) {
    const hasSkill = normalizedUserSkills.some((userSkill) => skillsMatch(userSkill, reqSkill));

    if (hasSkill) {
      matched.push(reqSkill);
    } else {
      missing.push(reqSkill);
    }
  }

  // Base score calculation
  let score = 0;

  if (requiredSkills.length === 0) {
    // No skills to match - check title match instead
    if (jobTitleMatches(jobTitle, userTitles)) {
      score = 75; // Title match but no skill data
    } else {
      score = 50; // No data to match
    }
  } else {
    // Calculate based on matched skills percentage (50-100 range)
    const matchPercentage = matched.length / requiredSkills.length;
    score = Math.round(50 + matchPercentage * 50);
  }

  // Boost score if job title matches user's experience
  if (jobTitleMatches(jobTitle, userTitles)) {
    score = Math.min(100, score + 15);
  }

  return { score, matched, missing: missing.slice(0, 3) };
}

/**
 * POST /api/jobs/recommendations
 * Get job recommendations based on parsed resume data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedData: ParsedData = body.parsedData;
    const location: string | undefined = body.location;

    if (!parsedData) {
      return NextResponse.json(
        { error: "parsedData is required" },
        { status: 400 }
      );
    }

    console.log("[Recommendations] User location:", location || "not provided");

    // Extract job titles and skills
    const jobTitles = extractJobTitles(parsedData.experience || []);
    const topSkills = extractTopSkills(parsedData.skills || []);

    if (jobTitles.length === 0 && topSkills.length === 0) {
      return NextResponse.json(
        { error: "No job titles or skills found in resume" },
        { status: 400 }
      );
    }

    // Build search query
    const queryParts: string[] = [];
    if (jobTitles.length > 0) {
      queryParts.push(jobTitles[0]); // Primary job title
    }
    if (topSkills.length > 0) {
      queryParts.push(topSkills.slice(0, 2).join(" ")); // Top 2 skills
    }

    const searchQuery = queryParts.join(" ");

    console.log("[Recommendations] Search query:", searchQuery);
    console.log("[Recommendations] Extracted titles:", jobTitles);
    console.log("[Recommendations] Extracted skills:", topSkills);

    // Fetch jobs from all sources (JSearch + free APIs)
    // First try with the full query and location
    let jobs = await searchAllJobsForRecommendations(searchQuery, 50, location);

    console.log(`[Recommendations] Found ${jobs.length} jobs from combined sources`);

    // If no results with full query, try with just job title
    if (jobs.length === 0 && jobTitles.length > 0) {
      console.log("[Recommendations] Trying fallback with job title only:", jobTitles[0]);
      jobs = await searchAllJobsForRecommendations(jobTitles[0], 50, location);
    }

    // If still no results, try a general search (without location restriction)
    if (jobs.length === 0) {
      console.log("[Recommendations] Fetching general jobs (no location filter)");
      jobs = await searchAllJobsForRecommendations("jobs hiring", 30);
    }

    // Get all skills for better matching (not just top 5 for search)
    const allSkills = extractAllSkills(parsedData.skills || []);

    // Calculate match scores and sort
    const jobsWithMatch = processJobs(jobs, allSkills, jobTitles);

    const response: RecommendationsResponse = {
      jobs: jobsWithMatch,
      searchQuery,
      extractedTitles: jobTitles,
      extractedSkills: topSkills,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Recommendations] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get recommendations" },
      { status: 500 }
    );
  }
}

/**
 * Process jobs: calculate match scores, filter low matches, return top 10
 */
function processJobs(jobs: Job[], userSkills: string[], userTitles: string[]): JobWithMatch[] {
  const userSkillNames = userSkills.map((s) => s.toLowerCase());

  const jobsWithMatch: JobWithMatch[] = jobs.map((job) => {
    const { score, matched, missing } = calculateMatchScore(
      userSkillNames,
      userTitles,
      job.job_title,
      job.job_required_skills,
      job.job_description
    );

    return {
      ...job,
      matchScore: score,
      matchedSkills: matched,
      missingSkills: missing,
    };
  });

  // Filter out low-match jobs (below 65%) and sort by score
  const relevantJobs = jobsWithMatch
    .filter((job) => job.matchScore >= 65)
    .sort((a, b) => b.matchScore - a.matchScore);

  // If we filtered too many, include some lower scores
  if (relevantJobs.length < 5) {
    const backupJobs = jobsWithMatch
      .filter((job) => job.matchScore >= 50 && job.matchScore < 65)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5 - relevantJobs.length);

    return [...relevantJobs, ...backupJobs].slice(0, 10);
  }

  return relevantJobs.slice(0, 10);
}
