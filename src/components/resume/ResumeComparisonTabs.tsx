"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles, GitCompare, AlertCircle, CheckCircle2, ArrowRight, Briefcase, MapPin, DollarSign, ExternalLink, Loader2, Building2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { ResumeChange } from "@/lib/ai/resume-optimizer";
import type { Job } from "@/types/job";
import type { Skill, Experience } from "@/lib/ai/resume-analyzer";
import { formatSalary, formatLocation } from "@/lib/jobs/jsearch-client";

interface ParsedData {
  skills: Skill[];
  experience: Experience[];
  summary?: string;
}

interface JobWithMatch extends Job {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
}

interface ResumeComparisonTabsProps {
  originalText: string;
  optimizedText: string;
  changes: ResumeChange[];
  originalScore: number;
  newScore: number;
  weaknesses: string[];
  parsedData?: ParsedData;
  preloadedJobs?: JobWithMatch[];
  preloadedJobsLoading?: boolean;
}

type TabType = "original" | "optimized" | "changes" | "jobs";

export function ResumeComparisonTabs({
  originalText,
  optimizedText,
  changes,
  originalScore,
  newScore,
  weaknesses,
  parsedData,
  preloadedJobs = [],
  preloadedJobsLoading = false,
}: ResumeComparisonTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("changes");

  // Use preloaded jobs from parent - no internal state or fetching needed
  const jobs = preloadedJobs;
  const jobsLoading = preloadedJobsLoading;

  const tabs = [
    { id: "original" as const, label: "Before", icon: FileText, color: "text-red-600" },
    { id: "optimized" as const, label: "Rizzed", icon: Sparkles, color: "text-green-600" },
    { id: "changes" as const, label: "Changes", icon: GitCompare, color: "text-indigo-600" },
    { id: "jobs" as const, label: "Jobs", icon: Briefcase, color: "text-amber-600" },
  ];

  return (
    <div className="flex flex-col">
      {/* Score Comparison Banner */}
      <div className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-xs text-slate-500 mb-1">Before</div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${originalScore}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-red-500 rounded-full"
                />
              </div>
              <span className="text-lg font-bold text-red-600">{originalScore}</span>
            </div>
          </div>

          <ArrowRight className="h-5 w-5 text-slate-400" />

          <div className="text-center">
            <div className="text-xs text-slate-500 mb-1">After</div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${newScore}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="h-full bg-green-500 rounded-full"
                />
              </div>
              <span className="text-lg font-bold text-green-600">{newScore}</span>
            </div>
          </div>
        </div>

        <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-lg text-sm font-semibold">
          +{newScore - originalScore} points improvement
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                isActive
                  ? "bg-white dark:bg-slate-700 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive && tab.color)} />
              {tab.label}
              {tab.id === "changes" && (
                <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs px-1.5 py-0.5 rounded-full">
                  {changes.length}
                </span>
              )}
              {tab.id === "jobs" && jobs.length > 0 && (
                <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs px-1.5 py-0.5 rounded-full">
                  {jobs.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        <AnimatePresence mode="wait">
          {activeTab === "original" && (
            <motion.div
              key="original"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <OriginalResumeView text={originalText} weaknesses={weaknesses} />
            </motion.div>
          )}

          {activeTab === "optimized" && (
            <motion.div
              key="optimized"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <OptimizedResumeView text={optimizedText} changes={changes} />
            </motion.div>
          )}

          {activeTab === "changes" && (
            <motion.div
              key="changes"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <ChangesListView changes={changes} />
            </motion.div>
          )}

          {activeTab === "jobs" && (
            <motion.div
              key="jobs"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <JobsTabView jobs={jobs} isLoading={jobsLoading} error={null} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Strip markdown formatting from text (safety net for AI-generated content)
function stripMarkdown(text: string): string {
  return text
    // Remove bold/italic asterisks: **text** or *text* → text
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
    // Remove bold/italic underscores: __text__ or _text_ → text
    .replace(/_{1,2}([^_]+)_{1,2}/g, '$1')
    // Remove headers: ### Header → Header
    .replace(/^#{1,6}\s*/gm, '');
}

// Parse resume text into structured sections
function parseResumeIntoSections(text: string): { name: string; contact: string; sections: { title: string; content: string[] }[] } {
  // Strip any markdown formatting before parsing
  const cleanText = stripMarkdown(text);
  const lines = cleanText.split(/\n+/).map(l => l.trim()).filter(Boolean);

  // Common section headers
  const sectionHeaders = [
    "professional summary", "summary", "objective", "profile",
    "work experience", "experience", "employment history", "work history",
    "education", "academic background",
    "skills", "technical skills", "core competencies", "key skills",
    "certifications", "certificates",
    "additional information", "references", "additional"
  ];

  let name = "";
  let contact = "";
  const sections: { title: string; content: string[] }[] = [];
  let currentSection: { title: string; content: string[] } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineLower = line.toLowerCase();

    // First line is usually the name
    if (i === 0 && !sectionHeaders.some(h => lineLower.includes(h))) {
      name = line;
      continue;
    }

    // Contact info (phone, email, location)
    if (!contact && (
      line.includes("@") ||
      line.match(/\(\d{3}\)|\d{3}[-.]?\d{3}[-.]?\d{4}/) ||
      line.toLowerCase().includes("phone:") ||
      line.toLowerCase().includes("email:") ||
      line.toLowerCase().includes("location:")
    )) {
      contact = line;
      continue;
    }

    // Check if this is a section header
    const isHeader = sectionHeaders.some(h => lineLower === h || lineLower.startsWith(h + " ") || lineLower.startsWith(h + ":"));

    if (isHeader) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = { title: line.replace(/:$/, ""), content: [] };
    } else if (currentSection) {
      currentSection.content.push(line);
    } else {
      // Content before any section header - might be contact or summary
      if (!contact && i < 5) {
        contact = contact ? `${contact} | ${line}` : line;
      } else {
        // Create an implicit section
        if (!currentSection) {
          currentSection = { title: "", content: [] };
        }
        currentSection.content.push(line);
      }
    }
  }

  if (currentSection && currentSection.content.length > 0) {
    sections.push(currentSection);
  }

  return { name, contact, sections };
}

// Original Resume View with highlighted issues
function OriginalResumeView({ text, weaknesses }: { text: string; weaknesses: string[] }) {
  const parsed = parseResumeIntoSections(text);

  return (
    <div className="space-y-4">
      {/* Issues Banner */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-medium mb-2">
          <AlertCircle className="h-4 w-4" />
          Vibe Check Failed
        </div>
        <ul className="space-y-1">
          {weaknesses.slice(0, 3).map((weakness, i) => (
            <li key={i} className="text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
              <span className="text-red-400 mt-1">•</span>
              {weakness}
            </li>
          ))}
        </ul>
      </div>

      {/* Formatted Resume Document */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-600 shadow-sm overflow-hidden">
        {/* Resume Paper */}
        <div className="p-6 sm:p-8 max-w-3xl mx-auto">
          {/* Header - Name & Contact */}
          {parsed.name && (
            <div className="text-center mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {parsed.name}
              </h1>
              {parsed.contact && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {parsed.contact}
                </p>
              )}
            </div>
          )}

          {/* Resume Sections */}
          <div className="space-y-5">
            {parsed.sections.map((section, idx) => (
              <div key={idx}>
                {section.title && (
                  <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 pb-1 border-b border-slate-200 dark:border-slate-700">
                    {section.title}
                  </h2>
                )}
                <div className="space-y-2">
                  {section.content.map((line, lineIdx) => {
                    // Check if line looks like a job title/company with date
                    const isJobHeader = line.match(/^[A-Z].*(\d{4}|Present|Current)/i) ||
                                        line.includes(" – ") ||
                                        line.includes(" - ") && line.match(/\d{4}/);
                    // Check if line is a bullet point
                    const isBullet = line.startsWith("-") || line.startsWith("•") || line.startsWith("*");

                    if (isJobHeader) {
                      return (
                        <p key={lineIdx} className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                          {line}
                        </p>
                      );
                    } else if (isBullet) {
                      return (
                        <p key={lineIdx} className="text-sm text-slate-600 dark:text-slate-400 pl-4">
                          {line}
                        </p>
                      );
                    } else {
                      return (
                        <p key={lineIdx} className="text-sm text-slate-600 dark:text-slate-400">
                          {line}
                        </p>
                      );
                    }
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* If no sections were parsed, show raw text as fallback */}
          {parsed.sections.length === 0 && !parsed.name && (
            <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
              {text}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

// Optimized Resume View with highlighted improvements
function OptimizedResumeView({ text, changes }: { text: string; changes: ResumeChange[] }) {
  const improvementCount = changes.length;
  const parsed = parseResumeIntoSections(text);
  const [showAllChanges, setShowAllChanges] = useState(false);

  const visibleChanges = showAllChanges ? changes : changes.slice(0, 4);
  const hiddenCount = changes.length - 4;

  return (
    <div className="space-y-4">
      {/* Improvements Banner */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-medium mb-2">
          <CheckCircle2 className="h-4 w-4" />
          {improvementCount} Rizz Unlocked
        </div>
        <div className="flex flex-wrap gap-2">
          {visibleChanges.map((change, i) => (
            <span
              key={i}
              className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs rounded-full capitalize"
            >
              {change.section}
            </span>
          ))}
          {!showAllChanges && hiddenCount > 0 && (
            <button
              onClick={() => setShowAllChanges(true)}
              className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:underline cursor-pointer transition-colors"
            >
              +{hiddenCount} more
            </button>
          )}
          {showAllChanges && hiddenCount > 0 && (
            <button
              onClick={() => setShowAllChanges(false)}
              className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:underline cursor-pointer transition-colors"
            >
              Show less
            </button>
          )}
        </div>
      </div>

      {/* Formatted Optimized Resume Document */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-green-300 dark:border-green-700 shadow-sm overflow-hidden ring-2 ring-green-100 dark:ring-green-900/50">
        {/* Resume Paper */}
        <div className="p-6 sm:p-8 max-w-3xl mx-auto">
          {/* Header - Name & Contact */}
          {parsed.name && (
            <div className="text-center mb-6 pb-4 border-b border-green-200 dark:border-green-800">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {parsed.name}
              </h1>
              {parsed.contact && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {parsed.contact}
                </p>
              )}
            </div>
          )}

          {/* Resume Sections */}
          <div className="space-y-5">
            {parsed.sections.map((section, idx) => (
              <div key={idx}>
                {section.title && (
                  <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 pb-1 border-b border-green-200 dark:border-green-800">
                    {section.title}
                  </h2>
                )}
                <div className="space-y-2">
                  {section.content.map((line, lineIdx) => {
                    // Check if line looks like a job title/company with date
                    const isJobHeader = line.match(/^[A-Z].*(\d{4}|Present|Current)/i) ||
                                        line.includes(" – ") ||
                                        line.includes(" - ") && line.match(/\d{4}/);
                    // Check if line is a bullet point
                    const isBullet = line.startsWith("-") || line.startsWith("•") || line.startsWith("*");

                    if (isJobHeader) {
                      return (
                        <p key={lineIdx} className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                          {line}
                        </p>
                      );
                    } else if (isBullet) {
                      return (
                        <p key={lineIdx} className="text-sm text-slate-600 dark:text-slate-400 pl-4">
                          {line}
                        </p>
                      );
                    } else {
                      return (
                        <p key={lineIdx} className="text-sm text-slate-600 dark:text-slate-400">
                          {line}
                        </p>
                      );
                    }
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* If no sections were parsed, show raw text as fallback */}
          {parsed.sections.length === 0 && !parsed.name && (
            <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
              {text}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

// Changes List View with before/after cards
function ChangesListView({ changes }: { changes: ResumeChange[] }) {
  if (changes.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        No changes to display
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {changes.map((change, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded capitalize">
                {change.section}
              </span>
              <span className="text-xs text-slate-500">Change #{index + 1}</span>
            </div>
          </div>

          {/* Before/After */}
          <div className="grid grid-cols-2 divide-x divide-slate-200 dark:divide-slate-700">
            {/* Before */}
            <div className="p-3">
              <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-2 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                BEFORE
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 bg-red-50 dark:bg-red-900/10 rounded p-2 line-through decoration-red-300">
                {change.before}
              </div>
            </div>

            {/* After */}
            <div className="p-3">
              <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-2 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                AFTER
              </div>
              <div className="text-sm text-slate-700 dark:text-slate-300 bg-green-50 dark:bg-green-900/10 rounded p-2">
                {change.after}
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-600 dark:text-slate-300">Why: </span>
              {change.reason}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Jobs Tab View
function JobsTabView({ jobs, isLoading, error }: { jobs: JobWithMatch[]; isLoading: boolean; error: string | null }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Finding jobs that match your rizz...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 mb-4">No matching jobs found right now</p>
        <Link href="/find-jobs">
          <Button variant="outline" size="sm">
            Browse All Jobs
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
            <Briefcase className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Recommended Jobs
            </h3>
            <p className="text-xs text-slate-500">Based on your rizzed resume</p>
          </div>
        </div>
        <Link href="/find-jobs">
          <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700">
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Jobs List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {jobs.map((job, index) => (
          <JobCard key={job.job_id} job={job} index={index} />
        ))}
      </div>
    </div>
  );
}

// Individual Job Card
function JobCard({ job, index }: { job: JobWithMatch; index: number }) {
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
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col hover:shadow-lg hover:border-amber-300 dark:hover:border-amber-600 transition-all"
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
          {job.matchScore}% match
        </span>
      </div>

      {/* Job Title */}
      <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-1 line-clamp-2">
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
            {job.matchedSkills.slice(0, 3).map((skill) => (
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
      >
        <Button
          size="sm"
          className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs"
        >
          Apply Now
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </a>
    </motion.div>
  );
}
