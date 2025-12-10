import { NextRequest } from "next/server";
import {
  discoveryProgressStore,
  discoveryResultsStore,
  type DiscoveryProgress,
} from "@/lib/session-registry";
import type { DiscoveredJob } from "@/lib/ai/agents/job-discovery-agent";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return new Response("Session ID required", { status: 400 });
  }

  // Create SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      controller.enqueue(encoder.encode("event: connected\ndata: {}\n\n"));

      let lastProgressJson: string | null = null;
      let pollCount = 0;
      let notFoundRetries = 0;
      const maxPolls = 600; // 10 minutes max
      const maxNotFoundRetries = 10; // Retry up to 10 times before giving up

      /**
       * Try to get progress data from the session registry.
       * If not found, fall back to HTTP request to main endpoint.
       */
      const getProgressData = async (): Promise<{
        progress: DiscoveryProgress | null;
        results: { jobs: DiscoveredJob[]; completed: boolean } | null;
      }> => {
        // Try direct registry access first (fastest)
        let progress = discoveryProgressStore.get(sessionId) || null;
        let results =
          progress?.status === "complete"
            ? discoveryResultsStore.get(sessionId) || null
            : null;

        // If found in registry, return it
        if (progress) {
          notFoundRetries = 0; // Reset retry count on success
          return { progress, results };
        }

        // Not found in registry - try HTTP fallback
        notFoundRetries++;
        console.log(
          `[Discovery SSE] Session ${sessionId} not in registry, trying HTTP fallback (attempt ${notFoundRetries}/${maxNotFoundRetries})`
        );

        try {
          const baseUrl =
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
          const response = await fetch(
            `${baseUrl}/api/agent/discover-jobs?sessionId=${sessionId}`,
            { cache: "no-store" }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.progress) {
              progress = data.progress;
              // Results included when complete
              if (data.data) {
                results = { jobs: data.data.jobs, completed: true };
              }
              console.log(
                `[Discovery SSE] Found session via HTTP fallback: ${sessionId}`
              );
              notFoundRetries = 0;
            }
          }
        } catch (e) {
          console.error("[Discovery SSE] HTTP fallback failed:", e);
        }

        return { progress, results };
      };

      const sendProgress = async (): Promise<boolean> => {
        try {
          const { progress, results } = await getProgressData();

          if (!progress) {
            // Session not found after retries
            if (notFoundRetries >= maxNotFoundRetries) {
              console.error(
                `[Discovery SSE] Session ${sessionId} not found after ${maxNotFoundRetries} retries`
              );
              controller.enqueue(
                encoder.encode(
                  'event: error\ndata: {"error": "Session not found"}\n\n'
                )
              );
              controller.close();
              return false;
            }
            // Keep polling - session might be created soon
            return true;
          }

          const progressJson = JSON.stringify(progress);

          // Only send if progress changed
          if (progressJson !== lastProgressJson) {
            controller.enqueue(
              encoder.encode(`event: progress\ndata: ${progressJson}\n\n`)
            );
            lastProgressJson = progressJson;
          }

          // Check if completed or failed
          if (progress.status === "complete" || progress.status === "failed") {
            // Send final results if available
            if (results?.completed && progress.status === "complete") {
              // Transform jobs for client
              const transformedJobs = results.jobs.map(
                (dj: DiscoveredJob) => ({
                  id: dj.job.job_id,
                  jobTitle: dj.job.job_title,
                  company: dj.job.employer_name,
                  location: formatLocation(dj.job),
                  salary: formatSalary(dj.job),
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
                })
              );

              controller.enqueue(
                encoder.encode(
                  `event: results\ndata: ${JSON.stringify({
                    jobs: transformedJobs,
                    stats: {
                      totalFound: transformedJobs.length,
                      qualified: transformedJobs.length,
                      averageMatchScore: progress.averageMatchScore,
                    },
                  })}\n\n`
                )
              );
            }

            controller.enqueue(encoder.encode("event: done\ndata: {}\n\n"));
            controller.close();
            return false;
          }
        } catch (error) {
          console.error("[Discovery SSE] Error:", error);
        }

        pollCount++;
        if (pollCount >= maxPolls) {
          controller.enqueue(encoder.encode("event: timeout\ndata: {}\n\n"));
          controller.close();
          return false;
        }

        return true;
      };

      // Poll for updates every 500ms
      const poll = async () => {
        const shouldContinue = await sendProgress();
        if (shouldContinue) {
          setTimeout(poll, 500);
        }
      };

      poll();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// Export dynamic config for streaming
export const dynamic = "force-dynamic";

/**
 * Format job location
 */
function formatLocation(job: {
  job_city?: string | null;
  job_state?: string | null;
  job_country?: string | null;
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
  job_min_salary?: number | null;
  job_max_salary?: number | null;
  job_salary_currency?: string | null;
  job_salary_period?: string | null;
}): string | null {
  if (!job.job_min_salary && !job.job_max_salary) {
    return null;
  }

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
