/**
 * Combined Job Search
 * Aggregates jobs from both RapidAPI/JSearch and free job APIs
 */

import type { Job, JobSearchParams } from "@/types/job";
import { searchJobs } from "./jsearch-client";
import { searchFreeJobs, type FreeJobSearchParams } from "./free-jobs-api";
import { enhanceJobsWithLogos } from "./company-logo";

/**
 * Generate a unique key for a job based on title + company
 * Used for deduplication across different sources
 */
function getJobKey(job: Job): string {
  const title = (job.job_title || "").toLowerCase().trim();
  const company = (job.employer_name || "").toLowerCase().trim();
  return `${title}|${company}`;
}

/**
 * Deduplicate jobs from multiple sources
 * Keeps the first occurrence (JSearch results are prioritized)
 */
function deduplicateJobs(jobs: Job[]): Job[] {
  const seen = new Map<string, Job>();

  for (const job of jobs) {
    const key = getJobKey(job);
    if (!seen.has(key)) {
      seen.set(key, job);
    }
  }

  return Array.from(seen.values());
}

/**
 * Search all job sources (JSearch + Free APIs) in parallel
 * Returns combined, deduplicated results
 */
export async function searchAllJobs(params: JobSearchParams): Promise<Job[]> {
  console.log("[CombinedSearch] Searching all sources for:", params.query);

  // Prepare params for free APIs
  const freeParams: FreeJobSearchParams = {
    query: params.query,
    limit: 30, // Get up to 30 from free APIs
  };

  // Fetch from both sources in parallel
  const [jsearchResult, freeResult] = await Promise.allSettled([
    searchJobs(params),
    searchFreeJobs(freeParams),
  ]);

  // Collect successful results
  const jsearchJobs: Job[] = jsearchResult.status === "fulfilled" ? jsearchResult.value : [];
  const freeJobs: Job[] = freeResult.status === "fulfilled" ? freeResult.value : [];

  // Log results
  if (jsearchResult.status === "rejected") {
    console.error("[CombinedSearch] JSearch failed:", jsearchResult.reason);
  } else {
    console.log(`[CombinedSearch] JSearch returned ${jsearchJobs.length} jobs`);
  }

  if (freeResult.status === "rejected") {
    console.error("[CombinedSearch] Free APIs failed:", freeResult.reason);
  } else {
    console.log(`[CombinedSearch] Free APIs returned ${freeJobs.length} jobs`);
  }

  // If both failed, throw error
  if (jsearchJobs.length === 0 && freeJobs.length === 0) {
    if (jsearchResult.status === "rejected" && freeResult.status === "rejected") {
      throw new Error("All job sources failed. Please try again later.");
    }
    // Both succeeded but returned empty - that's okay, just no results
    return [];
  }

  // Combine jobs: JSearch first (usually higher quality), then free APIs
  const allJobs = [...jsearchJobs, ...freeJobs];

  // Deduplicate by title + company
  const uniqueJobs = deduplicateJobs(allJobs);

  // Sort by date (most recent first)
  uniqueJobs.sort((a, b) => {
    const dateA = a.job_posted_at_datetime_utc ? new Date(a.job_posted_at_datetime_utc).getTime() : 0;
    const dateB = b.job_posted_at_datetime_utc ? new Date(b.job_posted_at_datetime_utc).getTime() : 0;
    return dateB - dateA;
  });

  // Enhance jobs with company logos where missing
  const jobsWithLogos = enhanceJobsWithLogos(uniqueJobs);

  console.log(`[CombinedSearch] Total unique jobs: ${jobsWithLogos.length}`);

  return jobsWithLogos;
}

/**
 * Check if a job location matches the user's location
 */
function jobMatchesLocation(job: Job, userLocation?: string): boolean {
  if (!userLocation) return true; // No filter if no location

  const userLoc = userLocation.toLowerCase();
  const jobCountry = (job.job_country || "").toLowerCase();
  const jobCity = (job.job_city || "").toLowerCase();
  const jobState = (job.job_state || "").toLowerCase();

  // Check for US-based jobs
  if (userLoc.includes("united states") || userLoc.includes("usa") || userLoc.includes("us")) {
    if (jobCountry.includes("us") || jobCountry.includes("united states") || jobCountry.includes("usa")) {
      return true;
    }
    // Also accept "worldwide" or "anywhere" jobs
    if (jobCountry.includes("worldwide") || jobCountry.includes("anywhere") || jobCountry.includes("remote")) {
      return true;
    }
  }

  // General location matching
  if (jobCountry.includes(userLoc) || userLoc.includes(jobCountry)) return true;
  if (jobCity && (jobCity.includes(userLoc) || userLoc.includes(jobCity))) return true;
  if (jobState && (jobState.includes(userLoc) || userLoc.includes(jobState))) return true;

  // Accept worldwide/anywhere jobs for any location
  if (jobCountry.includes("worldwide") || jobCountry.includes("anywhere")) return true;

  return false;
}

/**
 * Search all job sources for recommendations (simpler params)
 * Used by the recommendations API after rizzing a resume
 */
export async function searchAllJobsForRecommendations(
  query: string,
  limit: number = 50,
  location?: string
): Promise<Job[]> {
  console.log("[CombinedSearch] Fetching recommendations for:", query, "location:", location || "any");

  // Prepare params - add location to JSearch query
  const jsearchParams: JobSearchParams = {
    query,
    page: 1,
    location: location || undefined,
  };

  const freeParams: FreeJobSearchParams = {
    query,
    limit: Math.ceil(limit / 2), // Split limit between sources
  };

  // Fetch from both sources in parallel
  const [jsearchResult, freeResult] = await Promise.allSettled([
    searchJobs(jsearchParams),
    searchFreeJobs(freeParams),
  ]);

  // Collect successful results
  const jsearchJobs: Job[] = jsearchResult.status === "fulfilled" ? jsearchResult.value : [];
  const freeJobs: Job[] = freeResult.status === "fulfilled" ? freeResult.value : [];

  // Log results
  if (jsearchResult.status === "rejected") {
    console.error("[CombinedSearch] JSearch failed for recommendations:", jsearchResult.reason);
  } else {
    console.log(`[CombinedSearch] JSearch returned ${jsearchJobs.length} jobs for recommendations`);
  }

  if (freeResult.status === "rejected") {
    console.error("[CombinedSearch] Free APIs failed for recommendations:", freeResult.reason);
  } else {
    console.log(`[CombinedSearch] Free APIs returned ${freeJobs.length} jobs for recommendations`);
  }

  // Combine: JSearch first, then free APIs
  const allJobs = [...jsearchJobs, ...freeJobs];

  // Deduplicate
  let uniqueJobs = deduplicateJobs(allJobs);

  // Filter by location if provided (especially important for free APIs that don't support location search)
  if (location) {
    const locationFilteredJobs = uniqueJobs.filter(job => jobMatchesLocation(job, location));
    console.log(`[CombinedSearch] Location filter: ${uniqueJobs.length} -> ${locationFilteredJobs.length} jobs for "${location}"`);

    // If we have enough location-matched jobs, use those; otherwise include some global/remote jobs
    if (locationFilteredJobs.length >= 5) {
      uniqueJobs = locationFilteredJobs;
    } else {
      // Keep location-matched jobs first, then add worldwide/remote jobs
      const globalJobs = uniqueJobs.filter(job =>
        !jobMatchesLocation(job, location) &&
        ((job.job_country || "").toLowerCase().includes("worldwide") ||
         (job.job_country || "").toLowerCase().includes("anywhere") ||
         job.job_is_remote)
      );
      uniqueJobs = [...locationFilteredJobs, ...globalJobs.slice(0, 10)];
    }
  }

  // Sort by date
  uniqueJobs.sort((a, b) => {
    const dateA = a.job_posted_at_datetime_utc ? new Date(a.job_posted_at_datetime_utc).getTime() : 0;
    const dateB = b.job_posted_at_datetime_utc ? new Date(b.job_posted_at_datetime_utc).getTime() : 0;
    return dateB - dateA;
  });

  // Limit results
  const limitedJobs = uniqueJobs.slice(0, limit);

  // Enhance jobs with company logos where missing
  const jobsWithLogos = enhanceJobsWithLogos(limitedJobs);

  console.log(`[CombinedSearch] Total recommendations: ${jobsWithLogos.length}`);

  return jobsWithLogos;
}

/**
 * Get stats about combined search sources
 */
export function getCombinedSearchStats() {
  return {
    sources: ["JSearch (RapidAPI)", "Arbeitnow", "Remotive", "Jobicy", "RemoteOK", "Himalayas"],
    totalSources: 6,
  };
}
