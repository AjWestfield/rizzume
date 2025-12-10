"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Search, MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { JobSearchLayout } from "@/components/jobs/JobSearchLayout";
import { Job, JobFilters, DEFAULT_JOB_FILTERS } from "@/types/job";
import { useUserProfile } from "@/hooks/useUserProfile";
import { GradientBackground } from "@/components/ui/GradientBackground";

export default function FindJobsPage() {
  // User context
  const { userId: email } = useUserProfile();
  const user = useQuery(api.users.getUserByEmail, email ? { email } : "skip");
  const userId = user?._id;

  // Tracked jobs
  const trackedJobIds = useQuery(api.jobs.getTrackedJobIds, userId ? { userId } : "skip") || [];
  const saveJob = useMutation(api.jobs.saveJob);

  // Filters state (unified)
  const [filters, setFilters] = useState<JobFilters>(DEFAULT_JOB_FILTERS);

  // Results state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track if this is from a filter change (to auto-search)
  const isFilterChangeRef = useRef(false);

  const handleSaveJob = useCallback(async (job: Job) => {
    if (!userId) return;

    try {
      await saveJob({
        userId,
        jobId: job.job_id,
        jobTitle: job.job_title,
        company: job.employer_name,
        location: job.job_city && job.job_state ? `${job.job_city}, ${job.job_state}` : job.job_city || job.job_country || "Remote",
        salary: job.job_min_salary ? `$${job.job_min_salary}` : undefined,
        remote: job.job_is_remote,
        description: job.job_description,
        applyLink: job.job_apply_link,
        source: "jsearch",
        matchScore: 0,
      });
    } catch (err) {
      console.error("Failed to save job", err);
    }
  }, [userId, saveJob]);

  const popularSearches = [
    "Customer Service",
    "Customer Success",
    "Project Manager",
    "Sales",
    "Operations",
    "Marketing",
    "Product Manager",
    "Software Engineer",
    "Data Analyst",
    "Human Resources",
    "Executive Assistant",
    "Finance",
    "Design",
  ];

  const performSearch = useCallback(
    async (searchFilters: JobFilters) => {
      if (!searchFilters.query.trim()) return;

      setIsLoading(true);
      setError(null);
      setHasSearched(true);

      try {
        const params = new URLSearchParams();
        params.set("q", searchFilters.query);

        // Location
        if (searchFilters.location) params.set("location", searchFilters.location);
        if (searchFilters.locationDistance !== "25") params.set("radius", searchFilters.locationDistance);

        // Date Posted
        if (searchFilters.datePosted !== "all") params.set("date", searchFilters.datePosted);

        // Office Requirements
        if (searchFilters.officeRequirements === "remote") {
          params.set("remote", "true");
        } else if (searchFilters.officeRequirements !== "all") {
          params.set("office", searchFilters.officeRequirements);
        }

        // Employment Type
        if (searchFilters.employmentType !== "all") {
          params.set("type", searchFilters.employmentType.toUpperCase());
        }

        // Experience Level
        if (searchFilters.experienceLevel !== "all") {
          params.set("experience", searchFilters.experienceLevel);
        }

        // Salary
        if (searchFilters.minSalary) {
          params.set("minSalary", searchFilters.minSalary.toString());
        }
        if (searchFilters.hideSalaryless) {
          params.set("requireSalary", "true");
        }

        // Job Function
        if (searchFilters.jobFunction !== "all") {
          params.set("jobFunction", searchFilters.jobFunction);
        }

        // Industry
        if (searchFilters.industry !== "all") {
          params.set("industry", searchFilters.industry);
        }

        const response = await fetch(`/api/jobs/search?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch jobs");
        }

        setJobs(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setJobs([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleSearch = useCallback(() => {
    performSearch(filters);
  }, [filters, performSearch]);

  const handlePopularSearch = useCallback(
    (tag: string) => {
      const newFilters = { ...filters, query: tag };
      setFilters(newFilters);
      performSearch(newFilters);
    },
    [filters, performSearch]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const handleFiltersChange = useCallback((newFilters: JobFilters) => {
    setFilters(newFilters);
    isFilterChangeRef.current = true;
  }, []);

  // Auto-search when filters change (if already searched)
  useEffect(() => {
    if (isFilterChangeRef.current && hasSearched && filters.query) {
      isFilterChangeRef.current = false;
      performSearch(filters);
    }
  }, [filters, hasSearched, performSearch]);

  const handleNewSearch = useCallback(() => {
    setFilters(DEFAULT_JOB_FILTERS);
    setJobs([]);
    setHasSearched(false);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen font-sans relative">
      <GradientBackground />
      <DashboardNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Compact Search Header */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 mb-4">
          {!hasSearched && (
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 text-center">
              Find your dream job
            </h1>
          )}

          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-2">
            {hasSearched && (
              <Button
                onClick={handleNewSearch}
                variant="outline"
                className="h-10 w-full md:w-auto px-3 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                New Search
              </Button>
            )}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Job title or company"
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                onKeyDown={handleKeyDown}
                className="pl-10 h-10 text-sm border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
            <div className="relative flex-1 md:max-w-[200px]">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Location"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                onKeyDown={handleKeyDown}
                className="pl-10 h-10 text-sm border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading || !filters.query.trim()}
              className="h-10 w-full md:w-24 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg disabled:opacity-50"
            >
              {isLoading ? "..." : "Search"}
            </Button>
          </div>

          {/* Popular Searches - only show when no results */}
          {!hasSearched && (
            <div className="mt-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                Popular Searches
              </p>
              <div className="flex flex-wrap gap-1.5">
                {popularSearches.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handlePopularSearch(tag)}
                    disabled={isLoading}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-300 rounded text-xs text-slate-600 dark:text-slate-400 transition-colors disabled:opacity-50"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Job Results */}
        {(hasSearched || isLoading) && (
          <JobSearchLayout
            jobs={jobs}
            isLoading={isLoading}
            hasSearched={hasSearched}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            trackedJobIds={trackedJobIds}
            onSaveJob={handleSaveJob}
          />
        )}
      </main>
    </div>
  );
}
