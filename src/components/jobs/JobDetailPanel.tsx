"use client";

import { Job } from "@/types/job";
import { formatSalary, formatLocation, formatDatePosted } from "@/lib/jobs/jsearch-client";
import { AIFeatureButtons } from "./AIFeatureButtons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  MapPin,
  DollarSign,
  ExternalLink,
  Building2,
  Clock,
  Bookmark,
  Check,
} from "lucide-react";

interface JobDetailPanelProps {
  job: Job | null;
  isLoading: boolean;
  trackedJobIds?: string[];
  onSaveJob?: (job: Job) => void;
}


export function JobDetailPanel({ job, isLoading, trackedJobIds = [], onSaveJob }: JobDetailPanelProps) {
  // ... (skeleton and empty state logic remains same, but omitted for brevity in instruction, assuming I can keep imports and top part by targeting lower)
  // Actually I need to replace from top to ensure imports and props are updated.
  // I will assume the imports are handled by replacing from line 10 or so.

  if (isLoading) {
    // ...
    return (
      <div className="p-6 space-y-4 w-full">
        <div className="flex items-start gap-3">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center w-full">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
          <Briefcase className="h-6 w-6 text-slate-400" />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Select a job to view details
        </p>
      </div>
    );
  }

  const salary = formatSalary(job);
  const location = formatLocation(job);
  const datePosted = formatDatePosted(job.job_posted_at_datetime_utc);
  const isRemote = job.job_is_remote ?? false;
  const isTracked = trackedJobIds.includes(job.job_id);

  return (
    <div className="h-full w-full overflow-auto">
      <div className="p-5 space-y-5">
        {/* Header */}
        <div>
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-lg font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
              {job.employer_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                {job.job_title}
              </h2>
              <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-600 dark:text-slate-400">
                <Building2 className="h-3.5 w-3.5" />
                <span>{job.employer_name}</span>
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {datePosted}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {location}
            </span>
            {salary && (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <DollarSign className="h-3.5 w-3.5" />
                {salary}
              </span>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-3">
            {isRemote && (
              <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0">
                Remote
              </Badge>
            )}
            {job.job_employment_type && (
              <Badge variant="secondary">
                {typeof job.job_employment_type === "string"
                  ? job.job_employment_type.replace("_", " ")
                  : Array.isArray(job.job_employment_type)
                    ? (job.job_employment_type as string[])[0]?.replace("_", " ")
                    : String(job.job_employment_type)}
              </Badge>
            )}
            {isTracked && (
              <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800">
                <Check className="h-3 w-3 mr-1" />
                Saved
              </Badge>
            )}
          </div>
        </div>

        {/* AI Features */}
        <AIFeatureButtons
          jobTitle={job.job_title}
          companyName={job.employer_name}
          jobDescription={job.job_description}
          qualifications={job.job_highlights?.Qualifications}
        />

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            className="flex-1 h-11 bg-indigo-500 hover:bg-indigo-600 text-white font-medium"
            onClick={() => window.open(job.job_apply_link, "_blank")}
          >
            Apply on Employer Site
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>

          {onSaveJob && (
            <Button
              variant="outline"
              className={`h-11 px-4 ${isTracked ? 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-400 dark:border-indigo-800' : ''}`}
              onClick={() => isTracked ? null : onSaveJob(job)}
              disabled={isTracked}
            >
              {isTracked ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {/* Job Description */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Job Description
          </h3>
          <div
            className="prose prose-sm prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatDescription(job.job_description) }}
          />
        </div>

        {/* Qualifications */}
        {job.job_highlights?.Qualifications && job.job_highlights.Qualifications.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Qualifications
            </h3>
            <ul className="space-y-1.5">
              {job.job_highlights.Qualifications.slice(0, 8).map((qual, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span className="text-indigo-500 mt-1">•</span>
                  <span>{qual}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Responsibilities */}
        {job.job_highlights?.Responsibilities && job.job_highlights.Responsibilities.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Responsibilities
            </h3>
            <ul className="space-y-1.5">
              {job.job_highlights.Responsibilities.slice(0, 8).map((resp, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span className="text-indigo-500 mt-1">•</span>
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDescription(description: string): string {
  return description
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br />")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}
