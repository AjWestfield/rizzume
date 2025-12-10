import { Job, JSearchResponse, JSearchResponseSchema, JobSearchParams } from "@/types/job";

// In-memory cache
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const searchCache = new Map<string, CacheEntry<Job[]>>();
const SEARCH_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Generate cache key from search params
function generateCacheKey(params: JobSearchParams): string {
  return JSON.stringify({
    q: params.query,
    loc: params.location || "",
    radius: params.locationDistance || "25",
    date: params.datePosted || "all",
    remote: params.remoteOnly || false,
    office: params.officeType || "",
    type: params.employmentType || "",
    exp: params.experienceLevel || "",
    minSalary: params.minSalary || 0,
    reqSalary: params.requireSalary || false,
    func: params.jobFunction || "",
    industry: params.industry || "",
    page: params.page || 1,
  });
}

// Check if cache entry is still valid
function isCacheValid<T>(entry: CacheEntry<T> | undefined, ttl: number): entry is CacheEntry<T> {
  if (!entry) return false;
  return Date.now() - entry.timestamp < ttl;
}

// Search for jobs
export async function searchJobs(params: JobSearchParams): Promise<Job[]> {
  const cacheKey = generateCacheKey(params);

  // Check cache first
  const cached = searchCache.get(cacheKey);
  if (isCacheValid(cached, SEARCH_CACHE_TTL)) {
    console.log("[JSearch] Cache hit for:", params.query);
    return cached.data;
  }

  // Build query string
  const queryParams = new URLSearchParams();
  queryParams.set("query", params.query);
  if (params.location) {
    queryParams.set("query", `${params.query} in ${params.location}`);
  }
  queryParams.set("page", String(params.page || 1));
  queryParams.set("num_pages", "1");

  // Date filter
  if (params.datePosted && params.datePosted !== "all") {
    queryParams.set("date_posted", params.datePosted);
  }

  // Remote/office type filter
  if (params.remoteOnly || params.officeType === "remote") {
    queryParams.set("remote_jobs_only", "true");
  }

  // Location distance (radius)
  if (params.locationDistance && params.locationDistance !== "anywhere") {
    queryParams.set("radius", params.locationDistance);
  }

  // Employment type filter
  if (params.employmentType) {
    queryParams.set("employment_types", params.employmentType);
  }

  // Experience level filter - map to JSearch API values
  if (params.experienceLevel && params.experienceLevel !== "all") {
    const expMap: Record<string, string> = {
      internship: "no_experience",
      entry_level: "no_experience",
      associate: "under_3_years_experience",
      mid_senior: "more_than_3_years_experience",
      director: "more_than_3_years_experience",
      executive: "more_than_3_years_experience",
    };
    const mappedExp = expMap[params.experienceLevel];
    if (mappedExp) {
      queryParams.set("job_requirements", mappedExp);
    }
  }

  // Job function filter (added to query for better results)
  if (params.jobFunction && params.jobFunction !== "all") {
    const funcLabel = params.jobFunction.replace(/_/g, " ");
    const currentQuery = queryParams.get("query") || params.query;
    queryParams.set("query", `${currentQuery} ${funcLabel}`);
  }

  // Industry filter (added to query for better results)
  if (params.industry && params.industry !== "all") {
    const industryLabel = params.industry.replace(/_/g, " ");
    const currentQuery = queryParams.get("query") || params.query;
    queryParams.set("query", `${currentQuery} ${industryLabel}`);
  }

  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    throw new Error("RAPIDAPI_KEY environment variable is not set");
  }

  console.log("[JSearch] Fetching from API:", params.query);

  const response = await fetch(
    `https://jsearch.p.rapidapi.com/search?${queryParams.toString()}`,
    {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
      next: { revalidate: 600 }, // Next.js cache for 10 minutes
    }
  );

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }
    throw new Error(`API request failed: ${response.status}`);
  }

  const data = await response.json();

  // Validate response
  const parsed = JSearchResponseSchema.safeParse(data);
  if (!parsed.success) {
    console.error("[JSearch] Invalid response:", parsed.error);
    throw new Error("Invalid API response format");
  }

  // Apply client-side filters that API doesn't support
  let filteredJobs = parsed.data.data;

  // Filter by minimum salary
  if (params.minSalary && params.minSalary > 0) {
    filteredJobs = filteredJobs.filter((job) => {
      const salary = job.job_min_salary || job.job_max_salary || 0;
      return salary >= params.minSalary!;
    });
  }

  // Filter out jobs without salary info
  if (params.requireSalary) {
    filteredJobs = filteredJobs.filter((job) => {
      return job.job_min_salary !== null || job.job_max_salary !== null;
    });
  }

  // Sort jobs by most recent first
  const jobs = filteredJobs.sort((a, b) => {
    const dateA = a.job_posted_at_datetime_utc ? new Date(a.job_posted_at_datetime_utc).getTime() : 0;
    const dateB = b.job_posted_at_datetime_utc ? new Date(b.job_posted_at_datetime_utc).getTime() : 0;
    return dateB - dateA; // Most recent first
  });

  // Cache the results
  searchCache.set(cacheKey, {
    data: jobs,
    timestamp: Date.now(),
  });

  return jobs;
}

// Get cached stats (for debugging)
export function getCacheStats() {
  return {
    searchCacheSize: searchCache.size,
  };
}

// Clear cache (for testing/debugging)
export function clearCache() {
  searchCache.clear();
}

// Format salary for display
export function formatSalary(job: Job): string | null {
  if (!job.job_min_salary && !job.job_max_salary) {
    return null;
  }

  const currency = job.job_salary_currency || "USD";
  const period = job.job_salary_period || "YEAR";

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${Math.round(num / 1000)}K`;
    }
    return num.toLocaleString();
  };

  const periodLabel = period === "YEAR" ? "/yr" : period === "MONTH" ? "/mo" : "/hr";

  if (job.job_min_salary && job.job_max_salary) {
    return `$${formatNumber(job.job_min_salary)} - $${formatNumber(job.job_max_salary)}${periodLabel}`;
  }

  if (job.job_min_salary) {
    return `$${formatNumber(job.job_min_salary)}+${periodLabel}`;
  }

  if (job.job_max_salary) {
    return `Up to $${formatNumber(job.job_max_salary)}${periodLabel}`;
  }

  return null;
}

// Format location for display
export function formatLocation(job: Job): string {
  const parts: string[] = [];

  if (job.job_city) parts.push(job.job_city);
  if (job.job_state) parts.push(job.job_state);
  if (!parts.length && job.job_country) parts.push(job.job_country);

  const isRemote = job.job_is_remote ?? false;

  if (isRemote) {
    if (parts.length) {
      return `Remote (${parts.join(", ")})`;
    }
    return "Remote";
  }

  return parts.join(", ") || "Location not specified";
}

// Format date posted
export function formatDatePosted(dateString: string | null | undefined): string {
  if (!dateString) return "Recently posted";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Recently posted";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}
