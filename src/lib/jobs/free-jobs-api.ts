/**
 * Free Jobs API Aggregator
 * Aggregates jobs from multiple free APIs that don't require authentication
 */

import type { Job } from "@/types/job";

// Unified search params
export interface FreeJobSearchParams {
  query?: string;
  category?: string;
  limit?: number;
}

// Cache for API responses
interface CacheEntry {
  data: Job[];
  timestamp: number;
}

const jobCache = new Map<string, CacheEntry>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function isCacheValid(entry: CacheEntry | undefined): boolean {
  if (!entry) return false;
  return Date.now() - entry.timestamp < CACHE_TTL;
}

/**
 * Normalize jobs from different APIs to our standard Job format
 */
function normalizeJob(source: string, rawJob: Record<string, unknown>): Job {
  switch (source) {
    case "arbeitnow":
      return {
        job_id: `arbeitnow-${rawJob.slug || rawJob.id || Math.random().toString(36)}`,
        employer_name: (rawJob.company_name as string) || "Unknown Company",
        employer_logo: (rawJob.company_logo as string) || null,
        employer_website: null,
        job_employment_type: (rawJob.job_types as string[])?.join(", ") || null,
        job_title: (rawJob.title as string) || "Untitled Position",
        job_apply_link: (rawJob.url as string) || "",
        job_description: (rawJob.description as string) || "",
        job_is_remote: (rawJob.remote as boolean) || false,
        job_posted_at_datetime_utc: (rawJob.created_at as string) || null,
        job_city: null,
        job_state: null,
        job_country: (rawJob.location as string) || null,
        job_benefits: null,
        job_min_salary: null,
        job_max_salary: null,
        job_salary_currency: null,
        job_salary_period: null,
        job_highlights: null,
        job_required_experience: null,
        job_required_skills: (rawJob.tags as string[]) || null,
        job_required_education: null,
      };

    case "remotive":
      return {
        job_id: `remotive-${rawJob.id || Math.random().toString(36)}`,
        employer_name: (rawJob.company_name as string) || "Unknown Company",
        employer_logo: (rawJob.company_logo as string) || (rawJob.company_logo_url as string) || null,
        employer_website: null,
        job_employment_type: (rawJob.job_type as string) || null,
        job_title: (rawJob.title as string) || "Untitled Position",
        job_apply_link: (rawJob.url as string) || "",
        job_description: (rawJob.description as string) || "",
        job_is_remote: true, // Remotive is remote-only
        job_posted_at_datetime_utc: (rawJob.publication_date as string) || null,
        job_city: null,
        job_state: null,
        job_country: (rawJob.candidate_required_location as string) || "Worldwide",
        job_benefits: null,
        job_min_salary: null,
        job_max_salary: null,
        job_salary_currency: null,
        job_salary_period: null,
        job_highlights: null,
        job_required_experience: null,
        job_required_skills: (rawJob.tags as string[]) || null,
        job_required_education: null,
      };

    case "jobicy":
      return {
        job_id: `jobicy-${rawJob.id || Math.random().toString(36)}`,
        employer_name: (rawJob.companyName as string) || "Unknown Company",
        employer_logo: (rawJob.companyLogo as string) || null,
        employer_website: null,
        job_employment_type: (rawJob.jobType as string) || null,
        job_title: (rawJob.jobTitle as string) || "Untitled Position",
        job_apply_link: (rawJob.url as string) || "",
        job_description: (rawJob.jobDescription as string) || (rawJob.jobExcerpt as string) || "",
        job_is_remote: true, // Jobicy is remote-focused
        job_posted_at_datetime_utc: (rawJob.pubDate as string) || null,
        job_city: null,
        job_state: null,
        job_country: (rawJob.jobGeo as string) || "Anywhere",
        job_benefits: null,
        job_min_salary: (rawJob.annualSalaryMin as number) || null,
        job_max_salary: (rawJob.annualSalaryMax as number) || null,
        job_salary_currency: (rawJob.salaryCurrency as string) || null,
        job_salary_period: "YEAR",
        job_highlights: null,
        job_required_experience: {
          experience_mentioned: !!(rawJob.jobLevel as string),
        },
        job_required_skills: null,
        job_required_education: null,
      };

    case "remoteok":
      return {
        job_id: `remoteok-${rawJob.id || Math.random().toString(36)}`,
        employer_name: (rawJob.company as string) || "Unknown Company",
        employer_logo: (rawJob.company_logo as string) || (rawJob.logo as string) || null,
        employer_website: null,
        job_employment_type: null,
        job_title: (rawJob.position as string) || "Untitled Position",
        job_apply_link: (rawJob.url as string) || (rawJob.apply_url as string) || "",
        job_description: (rawJob.description as string) || "",
        job_is_remote: true, // RemoteOK is remote-only
        job_posted_at_datetime_utc: (() => {
          if (!rawJob.date) return null;
          try {
            const timestamp = typeof rawJob.date === "number" ? rawJob.date * 1000 : Date.parse(rawJob.date as string);
            if (isNaN(timestamp)) return null;
            return new Date(timestamp).toISOString();
          } catch {
            return null;
          }
        })(),
        job_city: null,
        job_state: null,
        job_country: (rawJob.location as string) || "Worldwide",
        job_benefits: null,
        job_min_salary: (rawJob.salary_min as number) || null,
        job_max_salary: (rawJob.salary_max as number) || null,
        job_salary_currency: "USD",
        job_salary_period: "YEAR",
        job_highlights: null,
        job_required_experience: null,
        job_required_skills: (rawJob.tags as string[]) || null,
        job_required_education: null,
      };

    case "himalayas":
      return {
        job_id: `himalayas-${rawJob.id || Math.random().toString(36)}`,
        employer_name: ((rawJob.company as Record<string, unknown>)?.name as string) || (rawJob.companyName as string) || "Unknown Company",
        employer_logo: ((rawJob.company as Record<string, unknown>)?.logo as string) || (rawJob.companyLogo as string) || null,
        employer_website: null,
        job_employment_type: (rawJob.employmentType as string) || null,
        job_title: (rawJob.title as string) || "Untitled Position",
        job_apply_link: (rawJob.applicationUrl as string) || (rawJob.url as string) || "",
        job_description: (rawJob.description as string) || "",
        job_is_remote: true, // Himalayas is remote-focused
        job_posted_at_datetime_utc: (rawJob.publishedAt as string) || (rawJob.pubDate as string) || null,
        job_city: null,
        job_state: null,
        job_country: (rawJob.locationRestrictions as string[])?.join(", ") || "Worldwide",
        job_benefits: null,
        job_min_salary: (rawJob.minSalary as number) || null,
        job_max_salary: (rawJob.maxSalary as number) || null,
        job_salary_currency: (rawJob.currency as string) || null,
        job_salary_period: "YEAR",
        job_highlights: null,
        job_required_experience: null,
        job_required_skills: (rawJob.skills as string[]) || null,
        job_required_education: null,
      };

    default:
      throw new Error(`Unknown source: ${source}`);
  }
}

/**
 * Fetch jobs from Arbeitnow API
 * https://www.arbeitnow.com/api/job-board-api
 */
async function fetchArbeitnow(params: FreeJobSearchParams): Promise<Job[]> {
  try {
    const url = "https://www.arbeitnow.com/api/job-board-api";
    const response = await fetch(url, {
      headers: { "Accept": "application/json" },
      next: { revalidate: 900 }, // Cache for 15 minutes
    });

    if (!response.ok) {
      console.error("[Arbeitnow] API error:", response.status);
      return [];
    }

    const data = await response.json();
    const jobs = (data.data || data.jobs || []) as Record<string, unknown>[];

    // Filter by query if provided
    let filtered = jobs;
    if (params.query) {
      const queryLower = params.query.toLowerCase();
      filtered = jobs.filter((job) => {
        const title = ((job.title as string) || "").toLowerCase();
        const desc = ((job.description as string) || "").toLowerCase();
        const company = ((job.company_name as string) || "").toLowerCase();
        return title.includes(queryLower) || desc.includes(queryLower) || company.includes(queryLower);
      });
    }

    return filtered.slice(0, params.limit || 20).map((job) => normalizeJob("arbeitnow", job));
  } catch (error) {
    console.error("[Arbeitnow] Error:", error);
    return [];
  }
}

/**
 * Fetch jobs from Remotive API
 * https://remotive.com/api/remote-jobs
 */
async function fetchRemotive(params: FreeJobSearchParams): Promise<Job[]> {
  try {
    const url = new URL("https://remotive.com/api/remote-jobs");
    if (params.query) {
      url.searchParams.set("search", params.query);
    }
    if (params.limit) {
      url.searchParams.set("limit", String(params.limit));
    }

    const response = await fetch(url.toString(), {
      headers: { "Accept": "application/json" },
      next: { revalidate: 900 },
    });

    if (!response.ok) {
      console.error("[Remotive] API error:", response.status);
      return [];
    }

    const data = await response.json();
    const jobs = (data.jobs || []) as Record<string, unknown>[];

    return jobs.slice(0, params.limit || 20).map((job) => normalizeJob("remotive", job));
  } catch (error) {
    console.error("[Remotive] Error:", error);
    return [];
  }
}

/**
 * Fetch jobs from Jobicy API
 * https://jobicy.com/api/v2/remote-jobs
 */
async function fetchJobicy(params: FreeJobSearchParams): Promise<Job[]> {
  try {
    const url = new URL("https://jobicy.com/api/v2/remote-jobs");
    url.searchParams.set("count", String(params.limit || 20));
    if (params.query) {
      url.searchParams.set("tag", params.query);
    }

    const response = await fetch(url.toString(), {
      headers: { "Accept": "application/json" },
      next: { revalidate: 900 },
    });

    if (!response.ok) {
      console.error("[Jobicy] API error:", response.status);
      return [];
    }

    const data = await response.json();
    const jobs = (data.jobs || []) as Record<string, unknown>[];

    return jobs.map((job) => normalizeJob("jobicy", job));
  } catch (error) {
    console.error("[Jobicy] Error:", error);
    return [];
  }
}

/**
 * Fetch jobs from RemoteOK API
 * https://remoteok.com/api
 */
async function fetchRemoteOK(params: FreeJobSearchParams): Promise<Job[]> {
  try {
    const response = await fetch("https://remoteok.com/api", {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Rizzume Job Aggregator"
      },
      next: { revalidate: 900 },
    });

    if (!response.ok) {
      console.error("[RemoteOK] API error:", response.status);
      return [];
    }

    const data = await response.json();
    // RemoteOK returns array, first item is legal notice
    const jobs = (Array.isArray(data) ? data.slice(1) : []) as Record<string, unknown>[];

    // Filter by query if provided
    let filtered = jobs;
    if (params.query) {
      const queryLower = params.query.toLowerCase();
      filtered = jobs.filter((job) => {
        const position = ((job.position as string) || "").toLowerCase();
        const desc = ((job.description as string) || "").toLowerCase();
        const company = ((job.company as string) || "").toLowerCase();
        const tags = ((job.tags as string[]) || []).join(" ").toLowerCase();
        return position.includes(queryLower) || desc.includes(queryLower) ||
               company.includes(queryLower) || tags.includes(queryLower);
      });
    }

    return filtered.slice(0, params.limit || 20).map((job) => normalizeJob("remoteok", job));
  } catch (error) {
    console.error("[RemoteOK] Error:", error);
    return [];
  }
}

/**
 * Fetch jobs from Himalayas API
 * https://himalayas.app/jobs/api
 */
async function fetchHimalayas(params: FreeJobSearchParams): Promise<Job[]> {
  try {
    const url = new URL("https://himalayas.app/jobs/api");
    url.searchParams.set("limit", String(params.limit || 20));

    const response = await fetch(url.toString(), {
      headers: { "Accept": "application/json" },
      next: { revalidate: 900 },
    });

    if (!response.ok) {
      console.error("[Himalayas] API error:", response.status);
      return [];
    }

    const data = await response.json();
    const jobs = (data.jobs || data || []) as Record<string, unknown>[];

    // Filter by query if provided
    let filtered = Array.isArray(jobs) ? jobs : [];
    if (params.query) {
      const queryLower = params.query.toLowerCase();
      filtered = filtered.filter((job) => {
        const title = ((job.title as string) || "").toLowerCase();
        const desc = ((job.description as string) || "").toLowerCase();
        const companyName = ((job.company as Record<string, unknown>)?.name as string || "").toLowerCase();
        return title.includes(queryLower) || desc.includes(queryLower) || companyName.includes(queryLower);
      });
    }

    return filtered.slice(0, params.limit || 20).map((job) => normalizeJob("himalayas", job));
  } catch (error) {
    console.error("[Himalayas] Error:", error);
    return [];
  }
}

/**
 * Aggregate jobs from all free APIs
 * Fetches from multiple sources in parallel and combines results
 */
export async function searchFreeJobs(params: FreeJobSearchParams = {}): Promise<Job[]> {
  const cacheKey = JSON.stringify(params);

  // Check cache
  const cached = jobCache.get(cacheKey);
  if (cached && isCacheValid(cached)) {
    console.log("[FreeJobsAPI] Cache hit");
    return cached.data;
  }

  console.log("[FreeJobsAPI] Fetching from all sources...", params);

  // Fetch from all sources in parallel
  const [arbeitnowJobs, remotiveJobs, jobicyJobs, remoteokJobs, himalayasJobs] = await Promise.all([
    fetchArbeitnow(params),
    fetchRemotive(params),
    fetchJobicy(params),
    fetchRemoteOK(params),
    fetchHimalayas(params),
  ]);

  console.log(`[FreeJobsAPI] Results - Arbeitnow: ${arbeitnowJobs.length}, Remotive: ${remotiveJobs.length}, Jobicy: ${jobicyJobs.length}, RemoteOK: ${remoteokJobs.length}, Himalayas: ${himalayasJobs.length}`);

  // Combine all jobs
  const allJobs = [
    ...arbeitnowJobs,
    ...remotiveJobs,
    ...jobicyJobs,
    ...remoteokJobs,
    ...himalayasJobs,
  ];

  // Sort by date (most recent first)
  allJobs.sort((a, b) => {
    const dateA = a.job_posted_at_datetime_utc ? new Date(a.job_posted_at_datetime_utc).getTime() : 0;
    const dateB = b.job_posted_at_datetime_utc ? new Date(b.job_posted_at_datetime_utc).getTime() : 0;
    return dateB - dateA;
  });

  // Cache results
  jobCache.set(cacheKey, {
    data: allJobs,
    timestamp: Date.now(),
  });

  return allJobs;
}

/**
 * Get jobs specifically for resume recommendations
 * Searches based on job titles and skills
 */
export async function getRecommendedFreeJobs(
  jobTitles: string[],
  skills: string[],
  limit: number = 10
): Promise<Job[]> {
  // Build search queries from job titles and skills
  const queries: string[] = [];

  if (jobTitles.length > 0) {
    queries.push(jobTitles[0]); // Primary job title
  }

  if (skills.length > 0) {
    queries.push(skills.slice(0, 2).join(" ")); // Top 2 skills
  }

  // If no queries, return general jobs
  if (queries.length === 0) {
    return searchFreeJobs({ limit });
  }

  // Fetch jobs for each query
  const jobPromises = queries.map((query) =>
    searchFreeJobs({ query, limit: Math.ceil(limit / queries.length) })
  );

  const results = await Promise.all(jobPromises);

  // Combine and deduplicate
  const jobMap = new Map<string, Job>();
  results.flat().forEach((job) => {
    if (!jobMap.has(job.job_id)) {
      jobMap.set(job.job_id, job);
    }
  });

  // Return limited results
  return Array.from(jobMap.values()).slice(0, limit);
}

/**
 * Get API source statistics
 */
export function getApiStats() {
  return {
    cacheSize: jobCache.size,
    sources: ["Arbeitnow", "Remotive", "Jobicy", "RemoteOK", "Himalayas"],
  };
}
