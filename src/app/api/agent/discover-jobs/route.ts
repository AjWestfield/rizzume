import { NextRequest, NextResponse } from "next/server";
import {
  JobDiscoveryAgent,
  DiscoveryConfig,
  DiscoveredJob,
} from "@/lib/ai/agents/job-discovery-agent";
import {
  discoveryProgressStore,
  discoveryResultsStore,
  type DiscoveryProgress,
} from "@/lib/session-registry";

export const maxDuration = 300; // 5 minute timeout for discovery

export interface DiscoverySession extends DiscoveryProgress {
  discoveredJobs: DiscoveredJob[];
}

interface DiscoverJobsRequest {
  resumeText: string;
  config?: Partial<DiscoveryConfig>;
}

interface DiscoverJobsResponse {
  success: boolean;
  sessionId?: string;
  data?: {
    jobs: Array<{
      id: string;
      jobTitle: string;
      company: string;
      location: string;
      salary: string | null;
      jobType: string | null;
      remote: boolean;
      description: string;
      applyLink: string;
      source: string;
      matchScore: number;
      matchAnalysis: string;
      matchedSkills: string[];
      missingSkills: string[];
      coverLetter: string | null;
      employerLogo: string | null;
    }>;
    stats: {
      totalFound: number;
      qualified: number;
      averageMatchScore: number;
    };
  };
  error?: string;
}

// GET handler to fetch progress/results for a session
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json(
      { success: false, error: "Session ID required" },
      { status: 400 }
    );
  }

  const progress = discoveryProgressStore.get(sessionId);
  const results = discoveryResultsStore.get(sessionId);

  if (!progress) {
    return NextResponse.json(
      { success: false, error: "Session not found" },
      { status: 404 }
    );
  }

  // If completed, include transformed jobs
  if (progress.status === "complete" && results?.completed) {
    const jobs = results.jobs.map((dj: DiscoveredJob) => ({
      id: dj.job.job_id,
      jobTitle: dj.job.job_title,
      company: dj.job.employer_name,
      location: formatLocation({
        job_city: dj.job.job_city ?? undefined,
        job_state: dj.job.job_state ?? undefined,
        job_country: dj.job.job_country ?? undefined,
        job_is_remote: dj.job.job_is_remote,
      }),
      salary: formatSalary({
        job_min_salary: dj.job.job_min_salary ?? undefined,
        job_max_salary: dj.job.job_max_salary ?? undefined,
        job_salary_currency: dj.job.job_salary_currency ?? undefined,
        job_salary_period: dj.job.job_salary_period ?? undefined,
      }),
      jobType: dj.job.job_employment_type
        ? String(dj.job.job_employment_type)
        : null,
      remote: dj.job.job_is_remote ?? false,
      description: dj.job.job_description || "",
      applyLink: dj.job.job_apply_link || "",
      source: "jsearch",
      matchScore: dj.matchResult.overallMatch,
      matchAnalysis: dj.matchResult.summary,
      matchedSkills: dj.matchResult.matchedSkills,
      missingSkills: dj.matchResult.missingSkills,
      coverLetter: dj.coverLetter || null,
      employerLogo: dj.job.employer_logo || null,
    }));

    return NextResponse.json({
      success: true,
      progress,
      data: {
        jobs,
        stats: {
          totalFound: jobs.length,
          qualified: results.jobs.length,
          averageMatchScore: progress.averageMatchScore,
        },
      },
    });
  }

  return NextResponse.json({ success: true, progress });
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<DiscoverJobsResponse>> {
  try {
    const body = (await request.json()) as DiscoverJobsRequest;

    // Validate request
    if (!body.resumeText || body.resumeText.length < 100) {
      return NextResponse.json(
        {
          success: false,
          error: "Resume text is required and must be at least 100 characters",
        },
        { status: 400 }
      );
    }

    // Generate session ID
    const sessionId = `discovery_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Initialize progress
    const initialProgress: DiscoveryProgress = {
      sessionId,
      status: "searching",
      currentPhase: "Starting job search...",
      jobsFound: 0,
      jobsAnalyzed: 0,
      jobsQualified: 0,
      averageMatchScore: 0,
    };
    discoveryProgressStore.set(sessionId, initialProgress);
    discoveryResultsStore.set(sessionId, { jobs: [], completed: false });

    // Create discovery agent
    const agent = new JobDiscoveryAgent(body.resumeText, {
      minMatchScore: body.config?.minMatchScore ?? 70,
      maxJobsToAnalyze: body.config?.maxJobsToAnalyze ?? 30,
      generateCoverLetters: body.config?.generateCoverLetters ?? true,
      searchQueries: body.config?.searchQueries ?? [],
      location: body.config?.location,
      remoteOnly: body.config?.remoteOnly ?? false,
    });

    // Track progress and update store in real-time
    agent.onProgress((progress) => {
      console.log("[Discovery API] Progress:", progress.currentPhase, progress);

      // Use the progress values directly from the agent
      const updatedProgress: DiscoveryProgress = {
        sessionId,
        status: progress.status === "complete" ? "complete" :
                progress.status === "error" ? "failed" :
                progress.status === "searching" ? "searching" : "analyzing",
        currentPhase: progress.currentPhase,
        jobsFound: progress.jobsFound,
        jobsAnalyzed: progress.jobsAnalyzed,
        jobsQualified: progress.jobsQualified,
        averageMatchScore: progress.averageMatchScore || 0,
        error: progress.error,
      };

      discoveryProgressStore.set(sessionId, updatedProgress);
    });

    // Run discovery in background (don't await)
    agent.discover()
      .then((discoveredJobs) => {
        // Calculate final stats
        const totalMatchScore = discoveredJobs.reduce(
          (sum, dj) => sum + dj.matchResult.overallMatch,
          0
        );
        const avgMatch = discoveredJobs.length > 0
          ? Math.round(totalMatchScore / discoveredJobs.length)
          : 0;

        // Get last known progress for jobsFound count
        const lastProgress = discoveryProgressStore.get(sessionId);

        // Update final progress
        const finalProgress: DiscoveryProgress = {
          sessionId,
          status: "complete",
          currentPhase: "Discovery complete!",
          jobsFound: lastProgress?.jobsFound || discoveredJobs.length,
          jobsAnalyzed: discoveredJobs.length,
          jobsQualified: discoveredJobs.length,
          averageMatchScore: avgMatch,
        };
        discoveryProgressStore.set(sessionId, finalProgress);
        discoveryResultsStore.set(sessionId, { jobs: discoveredJobs, completed: true });

        console.log("[Discovery API] Complete:", {
          sessionId,
          jobsFound: finalProgress.jobsFound,
          qualified: discoveredJobs.length,
          avgMatch,
        });
      })
      .catch((error) => {
        console.error("[Discovery API] Error:", error);
        const lastProgress = discoveryProgressStore.get(sessionId);
        const errorProgress: DiscoveryProgress = {
          sessionId,
          status: "failed",
          currentPhase: "Discovery failed",
          jobsFound: lastProgress?.jobsFound || 0,
          jobsAnalyzed: lastProgress?.jobsAnalyzed || 0,
          jobsQualified: lastProgress?.jobsQualified || 0,
          averageMatchScore: 0,
          error: error instanceof Error ? error.message : "Unknown error",
        };
        discoveryProgressStore.set(sessionId, errorProgress);
      });

    // Return session ID immediately (don't wait for discovery to complete)
    return NextResponse.json({
      success: true,
      sessionId,
    });
  } catch (error) {
    console.error("[Discovery API] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to discover jobs",
      },
      { status: 500 }
    );
  }
}

/**
 * Format job location
 */
function formatLocation(job: {
  job_city?: string;
  job_state?: string;
  job_country?: string;
  job_is_remote?: boolean;
}): string {
  const parts: string[] = [];

  if (job.job_city) parts.push(job.job_city);
  if (job.job_state) parts.push(job.job_state);
  if (job.job_country && !parts.length) parts.push(job.job_country);

  const location = parts.join(", ");

  if (job.job_is_remote) {
    return location ? `${location} (Remote)` : "Remote";
  }

  return location || "Location not specified";
}

/**
 * Format salary range
 */
function formatSalary(job: {
  job_min_salary?: number;
  job_max_salary?: number;
  job_salary_currency?: string;
  job_salary_period?: string;
}): string | null {
  if (!job.job_min_salary && !job.job_max_salary) {
    return null;
  }

  const currency = job.job_salary_currency || "USD";
  const period = job.job_salary_period || "year";

  const formatNumber = (n: number) => {
    if (n >= 1000) {
      return `${(n / 1000).toFixed(0)}K`;
    }
    return n.toString();
  };

  if (job.job_min_salary && job.job_max_salary) {
    return `$${formatNumber(job.job_min_salary)} - $${formatNumber(
      job.job_max_salary
    )}/${period}`;
  }

  if (job.job_min_salary) {
    return `$${formatNumber(job.job_min_salary)}+/${period}`;
  }

  if (job.job_max_salary) {
    return `Up to $${formatNumber(job.job_max_salary)}/${period}`;
  }

  return null;
}
