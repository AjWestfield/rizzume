"use client";

import { Job } from "@/types/job";
import { JobCard } from "./JobCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, SearchX } from "lucide-react";

interface JobListPanelProps {
  jobs: Job[];
  selectedJobId: string | null;
  onSelectJob: (job: Job) => void;
  isLoading: boolean;
  hasSearched: boolean;
  trackedJobIds?: string[];
}

export function JobListPanel({
  jobs,
  selectedJobId,
  onSelectJob,
  isLoading,
  hasSearched,
  trackedJobIds = [],
}: JobListPanelProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-4 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <Briefcase className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Start your job search
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
          Enter a job title or click on a popular search to find opportunities
        </p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <SearchX className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          No jobs found
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
          Try adjusting your search terms or filters to find more opportunities
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="flex flex-col gap-1 p-2">
        {jobs.map((job) => (
          <JobCard
            key={job.job_id}
            job={job}
            isSelected={selectedJobId === job.job_id}
            onClick={() => onSelectJob(job)}
            isSaved={trackedJobIds.includes(job.job_id)}
          />
        ))}
      </div>
    </div>
  );
}
