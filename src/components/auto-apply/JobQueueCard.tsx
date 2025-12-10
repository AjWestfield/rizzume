"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Building2,
  MapPin,
  DollarSign,
  Sparkles,
  FileText,
  Loader2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface JobQueueCardProps {
  job: {
    id: string;
    jobTitle: string;
    company: string;
    location: string;
    salary: string | null;
    matchScore: number;
    status: "discovered" | "pending" | "approved" | "rejected" | "applying" | "applied" | "failed";
    source: string;
    applyLink: string;
    matchedSkills: string[];
    missingSkills: string[];
    description: string;
    coverLetter?: string | null;
    employerLogo?: string | null;
    errorMessage?: string | null;
  };
  onApprove: () => void;
  onReject: () => void;
  onRetry?: () => void;
}

export function JobQueueCard({ job, onApprove, onReject, onRetry }: JobQueueCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400";
    if (score >= 70) return "text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400";
    return "text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "discovered":
        return <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0">New</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">Pending Review</Badge>;
      case "approved":
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0">Rejected</Badge>;
      case "applying":
        return (
          <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-0">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Applying...
          </Badge>
        );
      case "applied":
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">Applied</Badge>;
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  const sourceLabels: Record<string, string> = {
    linkedin: "LinkedIn",
    indeed: "Indeed",
    jsearch: "JSearch",
    glassdoor: "Glassdoor",
    remotive: "Remotive",
  };

  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 rounded-xl border transition-all",
        job.status === "approved"
          ? "border-emerald-200 dark:border-emerald-800"
          : job.status === "applying"
            ? "border-indigo-200 dark:border-indigo-800"
            : job.status === "failed"
              ? "border-red-200 dark:border-red-800"
              : job.status === "applied"
                ? "border-blue-200 dark:border-blue-800"
                : "border-slate-200 dark:border-slate-800",
        "hover:shadow-md"
      )}
    >
      {/* Main Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Job Info */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {/* Company Logo */}
            <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {job.employerLogo ? (
                <img
                  src={job.employerLogo}
                  alt={`${job.company} logo`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Hide broken image and show fallback icon
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}
              <Building2 className={cn("h-6 w-6 text-slate-400", job.employerLogo ? "hidden" : "")} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {job.jobTitle}
                </h3>
                {getStatusBadge(job.status)}
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                {job.company}
              </p>

              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {job.location}
                </span>
                {job.salary && (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <DollarSign className="h-3.5 w-3.5" />
                    {job.salary}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Match Score & Actions */}
          <div className="flex flex-col items-end gap-3 flex-shrink-0">
            {/* Match Score */}
            <div
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5",
                getScoreColor(job.matchScore)
              )}
            >
              <Sparkles className="h-4 w-4" />
              {job.matchScore}% Match
            </div>

            {/* Action Buttons */}
            {(job.status === "discovered" || job.status === "pending") && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={onReject}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Skip
                </Button>
                <Button
                  size="sm"
                  onClick={onApprove}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              </div>
            )}

            {job.status === "approved" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(job.applyLink, "_blank")}
                className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Apply Now
              </Button>
            )}

            {job.status === "applying" && (
              <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Applying...
              </div>
            )}

            {job.status === "failed" && (
              <div className="flex gap-2">
                {onRetry && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onRetry}
                    className="border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/30"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Retry
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(job.applyLink, "_blank")}
                  className="border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Apply Manually
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Error message for failed applications */}
        {job.status === "failed" && job.errorMessage && (
          <div className="mt-3 p-2 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 dark:text-red-300">{job.errorMessage}</p>
            </div>
          </div>
        )}

        {/* Expand Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 mt-3 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Show match analysis
            </>
          )}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t border-slate-100 dark:border-slate-800">
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            {/* Matched Skills */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Matched Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {job.matchedSkills.map((skill) => (
                  <Badge
                    key={skill}
                    className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-xs"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Skills to Develop
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {job.missingSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="bg-slate-100 dark:bg-slate-800 text-slate-500 border-0 text-xs"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Description Preview */}
          <div className="mt-4">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Job Description
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
              {job.description}
            </p>
          </div>

          {/* Source & Link */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400">
              Source: {sourceLabels[job.source] || job.source}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.open(job.applyLink, "_blank")}
              className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Original
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
