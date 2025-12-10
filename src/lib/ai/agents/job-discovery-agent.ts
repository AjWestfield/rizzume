/**
 * AI Job Discovery Agent
 *
 * This agent autonomously:
 * 1. Searches for jobs matching the user's profile
 * 2. Analyzes each job against the user's resume
 * 3. Filters jobs above the match threshold (default 70%)
 * 4. Generates tailored cover letters for qualifying jobs
 * 5. Adds qualified jobs to the user's queue
 */

import { Job } from "@/types/job";
import { searchAllJobsForRecommendations } from "@/lib/jobs/combined-job-search";
import { analyzeJobMatch, JobMatchResult } from "@/lib/ai/job-match-analyzer";
import { getCompletion } from "@/lib/ai/openrouter-client";

export interface DiscoveryConfig {
  minMatchScore: number; // Minimum match percentage (default: 70)
  maxJobsToAnalyze: number; // Max jobs to analyze per session (default: 50)
  generateCoverLetters: boolean; // Whether to generate cover letters
  searchQueries: string[]; // Job titles/keywords to search for
  location?: string; // Location preference
  remoteOnly?: boolean;
}

export interface DiscoveryProgress {
  status: "idle" | "searching" | "analyzing" | "generating" | "complete" | "error";
  currentPhase: string;
  jobsFound: number;
  jobsAnalyzed: number;
  jobsQualified: number;
  averageMatchScore?: number; // Average match score of qualified jobs
  currentJob?: string;
  error?: string;
}

export interface DiscoveredJob {
  job: Job;
  matchResult: JobMatchResult;
  coverLetter?: string;
}

type ProgressCallback = (progress: DiscoveryProgress) => void;

const DEFAULT_CONFIG: DiscoveryConfig = {
  minMatchScore: 70,
  maxJobsToAnalyze: 15, // Reduced from 50 for faster results
  generateCoverLetters: false, // Disabled by default - generate on-demand
  searchQueries: [],
  remoteOnly: false,
};

/**
 * AI Job Discovery Agent
 * Finds and analyzes jobs that match the user's resume
 */
export class JobDiscoveryAgent {
  private config: DiscoveryConfig;
  private resumeText: string;
  private progress: DiscoveryProgress;
  private progressCallback?: ProgressCallback;
  private abortController: AbortController;

  constructor(resumeText: string, config: Partial<DiscoveryConfig> = {}) {
    this.resumeText = resumeText;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.abortController = new AbortController();
    this.progress = {
      status: "idle",
      currentPhase: "Initializing",
      jobsFound: 0,
      jobsAnalyzed: 0,
      jobsQualified: 0,
    };
  }

  /**
   * Set progress callback for real-time updates
   */
  onProgress(callback: ProgressCallback): void {
    this.progressCallback = callback;
  }

  /**
   * Stop the discovery process
   */
  stop(): void {
    this.abortController.abort();
    this.updateProgress({ status: "idle", currentPhase: "Stopped by user" });
  }

  /**
   * Update and emit progress
   */
  private updateProgress(update: Partial<DiscoveryProgress>): void {
    this.progress = { ...this.progress, ...update };
    this.progressCallback?.(this.progress);
  }

  /**
   * Run the discovery process
   */
  async discover(): Promise<DiscoveredJob[]> {
    const qualifiedJobs: DiscoveredJob[] = [];

    try {
      // Phase 1: Search for jobs
      this.updateProgress({
        status: "searching",
        currentPhase: "Searching job boards...",
      });

      const allJobs = await this.searchJobs();

      if (this.abortController.signal.aborted) {
        return qualifiedJobs;
      }

      this.updateProgress({
        jobsFound: allJobs.length,
        currentPhase: `Found ${allJobs.length} potential jobs`,
      });

      // Phase 2: Analyze jobs in parallel batches for speed
      this.updateProgress({
        status: "analyzing",
        currentPhase: "Analyzing job matches...",
      });

      const jobsToAnalyze = allJobs.slice(0, this.config.maxJobsToAnalyze);
      const BATCH_SIZE = 5; // Process 5 jobs in parallel

      for (let i = 0; i < jobsToAnalyze.length; i += BATCH_SIZE) {
        if (this.abortController.signal.aborted) break;

        const batch = jobsToAnalyze.slice(i, i + BATCH_SIZE);

        this.updateProgress({
          currentPhase: `Analyzing jobs ${i + 1}-${Math.min(i + BATCH_SIZE, jobsToAnalyze.length)} of ${jobsToAnalyze.length}...`,
          jobsAnalyzed: i,
        });

        // Process batch in parallel
        const batchResults = await Promise.allSettled(
          batch.map(async (job) => {
            try {
              const matchResult = await this.analyzeJob(job);
              return { job, matchResult };
            } catch (error) {
              console.error(`[Discovery] Failed to analyze job: ${job.job_title}`, error);
              return null;
            }
          })
        );

        // Collect qualified jobs from batch
        for (const result of batchResults) {
          if (result.status === "fulfilled" && result.value) {
            const { job, matchResult } = result.value;

            if (matchResult.overallMatch >= this.config.minMatchScore) {
              let coverLetter: string | undefined;

              // Generate cover letter if enabled (still sequential to avoid rate limits)
              if (this.config.generateCoverLetters) {
                this.updateProgress({
                  status: "generating",
                  currentPhase: `Generating cover letter for ${job.job_title}...`,
                });
                coverLetter = await this.generateCoverLetter(job, matchResult);
              }

              qualifiedJobs.push({ job, matchResult, coverLetter });
            }
          }
        }

        // Calculate running average match score
        const avgScore = qualifiedJobs.length > 0
          ? Math.round(qualifiedJobs.reduce((sum, j) => sum + j.matchResult.overallMatch, 0) / qualifiedJobs.length)
          : 0;

        this.updateProgress({
          jobsAnalyzed: Math.min(i + BATCH_SIZE, jobsToAnalyze.length),
          jobsQualified: qualifiedJobs.length,
          averageMatchScore: avgScore,
        });

        // Small delay between batches to avoid rate limits
        if (i + BATCH_SIZE < jobsToAnalyze.length) {
          await this.delay(300);
        }
      }

      // Calculate final average match score
      const finalAvgScore = qualifiedJobs.length > 0
        ? Math.round(qualifiedJobs.reduce((sum, j) => sum + j.matchResult.overallMatch, 0) / qualifiedJobs.length)
        : 0;

      // Complete
      this.updateProgress({
        status: "complete",
        currentPhase: `Discovery complete! Found ${qualifiedJobs.length} qualified jobs.`,
        currentJob: undefined,
        averageMatchScore: finalAvgScore,
      });

      return qualifiedJobs;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.updateProgress({
        status: "error",
        currentPhase: "Discovery failed",
        error: errorMessage,
      });
      throw error;
    }
  }

  /**
   * Search for jobs using configured queries
   */
  private async searchJobs(): Promise<Job[]> {
    const allJobs: Job[] = [];
    const seenJobIds = new Set<string>();

    // If no search queries provided, use generic ones based on resume
    const queries = this.config.searchQueries.length > 0
      ? this.config.searchQueries
      : await this.extractSearchQueriesFromResume();

    // Execute all search queries in parallel to speed up discovery
    this.updateProgress({
      currentPhase: `Searching for ${queries.length} job titles simultaneously...`
    });

    const results = await Promise.allSettled(
      queries.map(async (query) => {
        if (this.abortController.signal.aborted) return [];
        try {
          const jobs = await searchAllJobsForRecommendations(
            query,
            10, // Reduced from 30 for faster results
            this.config.location
          );
          // Filter for remote if configured
          const filteredJobs = this.config.remoteOnly
            ? jobs.filter(j => j.job_is_remote)
            : jobs;

          return filteredJobs;
        } catch (error) {
          console.error(`[Discovery] Search failed for query: ${query}`, error);
          return [];
        }
      })
    );

    // Collect and deduplicate results
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        result.value.forEach(job => {
          const jobKey = `${job.job_title}|${job.employer_name}`.toLowerCase();
          if (!seenJobIds.has(jobKey)) {
            seenJobIds.add(jobKey);
            allJobs.push(job);
          }
        });
      }
    });

    return allJobs;
  }

  /**
   * Analyze a single job against the resume
   */
  private async analyzeJob(job: Job): Promise<JobMatchResult> {
    const description = job.job_description || "";
    const requirements = job.job_highlights?.Qualifications || [];

    return analyzeJobMatch(
      this.resumeText,
      job.job_title,
      job.employer_name,
      description,
      requirements
    );
  }

  /**
   * Generate a cover letter for a qualified job
   */
  private async generateCoverLetter(job: Job, matchResult: JobMatchResult): Promise<string> {
    const systemPrompt = `You are an expert career coach and professional writer. Generate a compelling, personalized cover letter that:
1. Highlights the candidate's relevant experience and skills
2. Shows genuine interest in the company and role
3. Addresses the key requirements from the job posting
4. Is professional but personable
5. Is concise (3-4 paragraphs max)

Do NOT use generic phrases like "I am writing to express my interest". Start with something engaging.
Do NOT include placeholders like [Your Name] - write as if for a real person.`;

    const userPrompt = `Write a cover letter for this job application.

JOB:
Title: ${job.job_title}
Company: ${job.employer_name}
Location: ${job.job_city || "Remote"}, ${job.job_state || ""}

KEY REQUIREMENTS:
${job.job_highlights?.Qualifications?.join("\n") || "See job description"}

CANDIDATE'S MATCHING STRENGTHS:
${matchResult.strengths.join("\n")}

MATCHED SKILLS: ${matchResult.matchedSkills.join(", ")}

CANDIDATE'S RESUME:
${this.resumeText.substring(0, 2000)}...

Write a compelling cover letter (3-4 paragraphs) that positions this candidate as an ideal fit.`;

    try {
      const coverLetter = await this.withRetry(
        () =>
          getCompletion(systemPrompt, userPrompt, {
            temperature: 0.7,
            maxTokens: 1024,
          }),
        3, // maxRetries
        1000 // baseDelayMs
      );

      return coverLetter.trim();
    } catch (error) {
      console.error("[Discovery] Failed to generate cover letter after retries:", error);
      return ""; // Return empty if generation fails
    }
  }

  /**
   * Extract job search queries from resume using AI
   */
  private async extractSearchQueriesFromResume(): Promise<string[]> {
    const systemPrompt = `You are a career advisor. Based on the resume, suggest exactly 3 job titles that would be a good match for this candidate. Return ONLY a JSON array of 3 strings with no explanation.

Example output: ["Software Engineer", "Full Stack Developer", "Backend Developer"]`;

    const userPrompt = `Based on this resume, what are the top 3 job titles this person should search for?

${this.resumeText.substring(0, 2000)}`;

    try {
      const response = await getCompletion(systemPrompt, userPrompt, {
        temperature: 0.3,
        maxTokens: 128,
      });

      // Parse JSON array from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const queries = JSON.parse(jsonMatch[0]) as string[];
        return queries.slice(0, 3); // Ensure max 3 queries
      }
    } catch (error) {
      console.error("[Discovery] Failed to extract search queries:", error);
    }

    // Fallback generic queries
    return ["Software Engineer", "Developer", "Engineer"];
  }

  /**
   * Helper delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry helper with exponential backoff for network errors
   */
  private async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelayMs: number = 1000
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Check if it's a network error that should be retried
        const errorMessage = lastError.message.toLowerCase();
        const isNetworkError =
          errorMessage.includes("terminated") ||
          errorMessage.includes("socket") ||
          errorMessage.includes("econnreset") ||
          errorMessage.includes("network") ||
          errorMessage.includes("timeout");

        if (!isNetworkError || attempt === maxRetries - 1) {
          throw lastError;
        }

        // Exponential backoff: 1s, 2s, 4s
        const delay = baseDelayMs * Math.pow(2, attempt);
        console.log(
          `[Discovery] Network error, retrying after ${delay}ms (attempt ${attempt + 1}/${maxRetries})`
        );
        await this.delay(delay);
      }
    }

    throw lastError;
  }
}

/**
 * Quick helper to run discovery
 */
export async function discoverJobs(
  resumeText: string,
  config: Partial<DiscoveryConfig> = {},
  onProgress?: ProgressCallback
): Promise<DiscoveredJob[]> {
  const agent = new JobDiscoveryAgent(resumeText, config);
  if (onProgress) {
    agent.onProgress(onProgress);
  }
  return agent.discover();
}
