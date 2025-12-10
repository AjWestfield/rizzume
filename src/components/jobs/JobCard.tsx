"use client";

import { Job } from "@/types/job";
import { formatSalary, formatLocation, formatDatePosted } from "@/lib/jobs/jsearch-client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface JobCardProps {
  job: Job;
  isSelected: boolean;
  onClick: () => void;
  isSaved?: boolean;
}

export function JobCard({ job, isSelected, onClick, isSaved }: JobCardProps) {
  const salary = formatSalary(job);
  const location = formatLocation(job);
  const datePosted = formatDatePosted(job.job_posted_at_datetime_utc);
  const isRemote = job.job_is_remote ?? false;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "w-full text-left p-3 rounded-lg border transition-all cursor-pointer",
        isSelected
          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
          : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50"
      )}
    >
      {/* Company Logo/Initial + Title */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-semibold text-slate-600 dark:text-slate-400 flex-shrink-0 overflow-hidden">
          {job.employer_logo ? (
            <img
              src={job.employer_logo}
              alt={job.employer_name}
              className="w-full h-full object-contain"
              onError={(e) => {
                // Hide broken image and show fallback letter
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = job.employer_name.charAt(0).toUpperCase();
                }
              }}
            />
          ) : (
            job.employer_name.charAt(0).toUpperCase()
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate leading-tight">
            {job.job_title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {job.employer_name}
          </p>

          {/* Meta info */}
          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
            <span>{datePosted}</span>
            <span>·</span>
            <span className="truncate">{location}</span>
            {salary && (
              <>
                <span>·</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{salary}</span>
              </>
            )}
          </div>

          {/* Badges */}
          <div className="flex gap-1.5 mt-2">
            {isRemote && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-0">
                Remote
              </Badge>
            )}
            {job.job_employment_type && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-slate-100 dark:bg-slate-800 text-slate-500 border-0">
                {typeof job.job_employment_type === "string"
                  ? job.job_employment_type.replace("_", " ")
                  : Array.isArray(job.job_employment_type)
                    ? (job.job_employment_type as string[])[0]?.replace("_", " ")
                    : String(job.job_employment_type)}
              </Badge>
            )}
            {isSaved && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-indigo-200 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800">
                <Check className="h-2.5 w-2.5 mr-0.5" />
                Saved
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
