"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  MapPin,
  DollarSign,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Job } from "@/types/job";
import type { Skill, Experience } from "@/lib/ai/resume-analyzer";
import { formatSalary, formatLocation } from "@/lib/jobs/jsearch-client";

interface JobWithMatch extends Job {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
}

interface ParsedData {
  skills: Skill[];
  experience: Experience[];
  summary?: string;
}

interface RecommendedJobsProps {
  parsedData: ParsedData;
}

export function RecommendedJobs({ parsedData }: RecommendedJobsProps) {
  const [jobs, setJobs] = useState<JobWithMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/jobs/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ parsedData }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch recommendations");
        }

        setJobs(data.jobs || []);
        setSearchQuery(data.searchQuery || "");
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
        setError(err instanceof Error ? err.message : "Failed to load recommendations");
      } finally {
        setIsLoading(false);
      }
    }

    if (parsedData?.experience?.length > 0 || parsedData?.skills?.length > 0) {
      fetchRecommendations();
    } else {
      setIsLoading(false);
      setError("No experience or skills found to generate recommendations");
    }
  }, [parsedData]);

  if (isLoading) {
    return (
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <Briefcase className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Finding Jobs For You...
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Matching your skills to opportunities</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="text-center py-4">
          <p className="text-slate-500 mb-4">No matching jobs found right now</p>
          <Link href="/find-jobs">
            <Button variant="outline" size="sm">
              Browse All Jobs
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-slate-50 dark:from-indigo-950/30 dark:to-slate-900 rounded-xl p-5 border border-indigo-200 dark:border-indigo-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Recommended Jobs
            </h3>
            <p className="text-xs text-slate-500">Based on your optimized resume</p>
          </div>
        </div>
        <Link href="/find-jobs">
          <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-5 gap-3">
        {jobs.map((job, index) => (
          <JobMatchCard key={job.job_id} job={job} index={index} />
        ))}
      </div>
    </div>
  );
}

// Individual Job Card with Match Score
function JobMatchCard({ job, index }: { job: JobWithMatch; index: number }) {
  const matchColor =
    job.matchScore >= 80
      ? "text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-400"
      : job.matchScore >= 60
        ? "text-amber-600 bg-amber-100 dark:bg-amber-900/50 dark:text-amber-400"
        : "text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-400";

  const salary = formatSalary(job);
  const location = formatLocation(job);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600 transition-all cursor-pointer group"
    >
      {/* Company Logo & Match Score */}
      <div className="flex items-start justify-between mb-3">
        <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
          {job.employer_logo ? (
            <img
              src={job.employer_logo}
              alt={job.employer_name}
              className="h-full w-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null}
          <Building2 className={`h-5 w-5 text-slate-400 ${job.employer_logo ? "hidden" : ""}`} />
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${matchColor}`}>
          {job.matchScore}%
        </span>
      </div>

      {/* Job Title */}
      <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-1 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {job.job_title}
      </h4>

      {/* Company */}
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 truncate">
        {job.employer_name}
      </p>

      {/* Location & Salary */}
      <div className="space-y-1 mb-3">
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{location}</span>
        </div>
        {salary && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <DollarSign className="h-3 w-3" />
            <span>{salary}</span>
          </div>
        )}
      </div>

      {/* Skills Match */}
      <div className="flex-1 mb-3">
        {job.matchedSkills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1">
            {job.matchedSkills.slice(0, 2).map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] rounded"
              >
                <CheckCircle2 className="h-2.5 w-2.5" />
                {skill}
              </span>
            ))}
          </div>
        )}
        {job.missingSkills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.missingSkills.slice(0, 2).map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] rounded border border-dashed border-amber-300 dark:border-amber-700"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Apply Button */}
      <a
        href={job.job_apply_link}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          size="sm"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
        >
          Apply Now
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </a>
    </motion.div>
  );
}
