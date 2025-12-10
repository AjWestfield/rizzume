"use client";

import { useState, useCallback, useEffect } from "react";
import { Job, JobFilters } from "@/types/job";
import { JobListPanel } from "./JobListPanel";
import { JobDetailPanel } from "./JobDetailPanel";
import { JobFilterBar } from "./JobFilterBar";

interface JobSearchLayoutProps {
  jobs: Job[];
  isLoading: boolean;
  hasSearched: boolean;
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
  trackedJobIds: string[];
  onSaveJob: (job: Job) => void;
}

export function JobSearchLayout({
  jobs,
  isLoading,
  hasSearched,
  filters,
  onFiltersChange,
  trackedJobIds,
  onSaveJob,
}: JobSearchLayoutProps) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const handleSelectJob = useCallback((job: Job) => {
    setSelectedJob(job);
  }, []);

  // Auto-select first job when results change
  useEffect(() => {
    if (jobs.length > 0 && !isLoading) {
      setSelectedJob(jobs[0]);
    } else if (jobs.length === 0) {
      setSelectedJob(null);
    }
  }, [jobs, isLoading]);

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] min-h-[500px] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
      {/* Filter Bar */}
      <JobFilterBar
        filters={filters}
        onFiltersChange={onFiltersChange}
        jobCount={jobs.length}
      />

      {/* Split Panel - explicit flex-row with proper constraints */}
      <div className="flex flex-row flex-1 min-h-0">
        {/* Job List - Left Panel (fixed width) */}
        <div className="w-full md:w-[340px] lg:w-[380px] flex-shrink-0 border-r border-slate-200 dark:border-slate-800 overflow-hidden">
          <JobListPanel
            jobs={jobs}
            selectedJobId={selectedJob?.job_id || null}
            onSelectJob={handleSelectJob}
            isLoading={isLoading}
            hasSearched={hasSearched}
            trackedJobIds={trackedJobIds}
          />
        </div>

        {/* Job Details - Right Panel (fills remaining space) */}
        <div className="hidden md:block flex-1 min-w-0 overflow-hidden bg-slate-50/50 dark:bg-slate-950/50">
          <JobDetailPanel
            job={selectedJob}
            isLoading={isLoading && hasSearched}
            trackedJobIds={trackedJobIds}
            onSaveJob={onSaveJob}
          />
        </div>
      </div>
    </div>
  );
}
