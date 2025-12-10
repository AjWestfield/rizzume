"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { AgentControlCenter } from "@/components/auto-apply/AgentControlCenter";
import { useJobDiscovery } from "@/hooks/useJobDiscovery";
import { useAutoApply } from "@/hooks/useAutoApply";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAutoApplyTrigger } from "@/hooks/useAutoApplyTrigger";
import type { AutoApplyProfile } from "@/types/user-profile";
import { GradientBackground } from "@/components/ui/GradientBackground";

type JobStatus = "discovered" | "pending" | "approved" | "rejected" | "applying" | "applied" | "failed";

interface JobWithStatus {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  salary: string | null;
  matchScore: number;
  status: JobStatus;
  source: string;
  applyLink: string;
  matchedSkills: string[];
  missingSkills: string[];
  description: string;
  coverLetter: string | null;
  employerLogo: string | null;
  errorMessage?: string | null;
}

export default function AutoApplyPage() {
  // Use the real job discovery hook
  const {
    isDiscovering,
    progress,
    discoveredJobs,
    stats: discoveryStats,
    error: discoveryError,
    startDiscovery,
    stopDiscovery,
    clearResults,
  } = useJobDiscovery();

  // Use the auto-apply hook
  const {
    isApplying,
    progress: autoApplyProgress,
    results: autoApplyResults,
    error: autoApplyError,
    startAutoApply,
    stopAutoApply,
    resetAutoApply,
  } = useAutoApply();

  // Use the user profile hook
  const { profile, isReadyForAutoApply, completeness, isLoading: profileLoading, profileChecked, userId } = useUserProfile();

  // Local state for job statuses
  const [jobStatuses, setJobStatuses] = useState<Record<string, JobStatus>>({});
  const [jobErrors, setJobErrors] = useState<Record<string, string>>({});
  const [minMatchScore, setMinMatchScore] = useState(70);
  const [autoApplyEnabled, setAutoApplyEnabled] = useState(false);

  // Track if we've synced jobs to Convex
  const syncedJobsRef = useRef<Set<string>>(new Set());

  // Convex mutations for persisting job state
  const addDiscoveredJobs = useMutation(api.jobs.addDiscoveredJobsByEmail);
  const approveJob = useMutation(api.jobs.approveJobByJobId);
  const rejectJob = useMutation(api.jobs.rejectJobByJobId);

  // Build auto-apply profile from user profile data
  const autoApplyProfileData: AutoApplyProfile | null = useMemo(() => {
    if (!profile) return null;
    const resumeText = typeof window !== "undefined" ? localStorage.getItem("rizzume_resume_text") : null;
    return {
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      email: profile.email || "",
      phone: profile.phone || "",
      city: profile.city || "",
      state: profile.state || "",
      country: profile.country || "United States",
      zipCode: profile.zipCode || "",
      linkedinUrl: profile.linkedinUrl,
      portfolioUrl: profile.portfolioUrl,
      githubUrl: profile.githubUrl,
      authorizedToWork: profile.workAuthorization?.authorizedToWork ?? true,
      requiresSponsorship: profile.workAuthorization?.requiresSponsorship ?? false,
      visaStatus: profile.workAuthorization?.visaStatus,
      startDateType: profile.availability?.startDateType || "two_weeks",
      customStartDate: profile.availability?.customStartDate
        ? new Date(profile.availability.customStartDate)
        : undefined,
      noticePeriodWeeks: profile.availability?.noticePeriodWeeks,
      resumeText: resumeText || "",
      references: [],
      skills: profile.parsedSkills || [],
    };
  }, [profile]);

  // Auto-apply trigger hook - automatically applies when jobs are approved
  const {
    pendingCount: autoApplyPendingCount,
    isProcessing: isAutoApplying,
    currentJob: autoApplyCurrentJob,
    error: autoApplyTriggerError,
    sessionId: autoApplySessionId,
    stats: autoApplyStats,
    retryFailedJob,
  } = useAutoApplyTrigger({
    userEmail: profile?.email || null,
    profile: autoApplyProfileData,
    isEnabled: autoApplyEnabled && isReadyForAutoApply && !!profile,
    onApplyStart: () => {
      console.log("[AutoApply] Starting auto-apply for approved job");
    },
    onApplyComplete: (success, error) => {
      console.log("[AutoApply] Job complete:", { success, error });
    },
    onJobStatusChange: (jobId, status) => {
      setJobStatuses((prev) => ({ ...prev, [jobId]: status as JobStatus }));
    },
  });

  // Combine discovered jobs with local status state
  const jobs: JobWithStatus[] = useMemo(() => {
    return discoveredJobs
      .map((job) => ({
        id: job.id,
        jobTitle: job.jobTitle,
        company: job.company,
        location: job.location,
        salary: job.salary,
        matchScore: job.matchScore,
        status: jobStatuses[job.id] || "discovered",
        source: job.source,
        applyLink: job.applyLink,
        matchedSkills: job.matchedSkills,
        missingSkills: job.missingSkills,
        description: job.description,
        coverLetter: job.coverLetter,
        employerLogo: job.employerLogo,
        errorMessage: jobErrors[job.id] || null,
      }))
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [discoveredJobs, jobStatuses, jobErrors]);

  // Initialize job statuses when new jobs are discovered
  useEffect(() => {
    if (discoveredJobs.length > 0) {
      const newStatuses: Record<string, JobStatus> = {};
      discoveredJobs.forEach((job) => {
        if (!jobStatuses[job.id]) {
          newStatuses[job.id] = "discovered";
        }
      });
      if (Object.keys(newStatuses).length > 0) {
        setJobStatuses((prev) => ({ ...prev, ...newStatuses }));
      }
    }
  }, [discoveredJobs]);

  // Sync discovered jobs to Convex database (so auto-apply trigger can find them)
  useEffect(() => {
    const syncJobsToConvex = async () => {
      if (!profile?.email || discoveredJobs.length === 0) return;

      // Filter to only unsync'd jobs
      const jobsToSync = discoveredJobs.filter(
        (job) => !syncedJobsRef.current.has(job.id)
      );

      if (jobsToSync.length === 0) return;

      try {
        console.log("[AutoApply] Syncing", jobsToSync.length, "jobs to Convex");
        const result = await addDiscoveredJobs({
          userEmail: profile.email,
          jobs: jobsToSync.map((job) => ({
            jobId: job.id,
            jobTitle: job.jobTitle,
            company: job.company,
            location: job.location || undefined,
            salary: job.salary || undefined,
            description: job.description || undefined,
            applyLink: job.applyLink,
            source: job.source,
            matchScore: job.matchScore,
            matchAnalysis: job.matchAnalysis || undefined,
            matchedSkills: job.matchedSkills || undefined,
            missingSkills: job.missingSkills || undefined,
            coverLetter: job.coverLetter || undefined,
          })),
        });

        if (result.success) {
          // Mark all as synced
          jobsToSync.forEach((job) => syncedJobsRef.current.add(job.id));
          console.log("[AutoApply] Synced jobs to Convex:", result.addedCount, "added");
        }
      } catch (err) {
        console.error("[AutoApply] Failed to sync jobs to Convex:", err);
      }
    };

    syncJobsToConvex();
  }, [discoveredJobs, profile?.email, addDiscoveredJobs]);

  // Update job statuses based on auto-apply progress
  useEffect(() => {
    if (autoApplyProgress) {
      const updatedStatuses: Record<string, JobStatus> = {};

      // Mark current job as applying
      if (autoApplyProgress.currentJob && autoApplyProgress.status === "running") {
        const currentJobId = jobs.find(
          j => j.jobTitle === autoApplyProgress.currentJob?.title &&
            j.company === autoApplyProgress.currentJob?.company
        )?.id;
        if (currentJobId) {
          updatedStatuses[currentJobId] = "applying";
        }
      }

      if (Object.keys(updatedStatuses).length > 0) {
        setJobStatuses(prev => ({ ...prev, ...updatedStatuses }));
      }
    }
  }, [autoApplyProgress, jobs]);

  // Handlers
  const handleStartDiscovery = async () => {
    const resumeText = localStorage.getItem("rizzume_resume_text");
    if (!resumeText) {
      // Handle no resume error - ideally via a toast or integrated error state in AgentControlCenter
      alert("Please upload your resume first!");
      return;
    }

    clearResults();
    setJobStatuses({});
    syncedJobsRef.current.clear(); // Reset synced jobs tracking

    await startDiscovery(resumeText, {
      minMatchScore,
      maxJobsToAnalyze: 15,
      generateCoverLetters: false,
    });
  };

  const handleApprove = async (jobId: string) => {
    // Update local state immediately for UI responsiveness
    setJobStatuses((prev) => ({ ...prev, [jobId]: "approved" }));

    // Persist to Convex database so auto-apply trigger can detect it
    if (profile?.email) {
      try {
        const result = await approveJob({ userEmail: profile.email, jobId });
        if (!result.success) {
          console.error("[AutoApply] Failed to approve job in Convex:", result.error);
        } else {
          console.log("[AutoApply] Job approved in Convex:", jobId);
        }
      } catch (err) {
        console.error("[AutoApply] Error approving job:", err);
      }
    }
  };

  const handleReject = async (jobId: string) => {
    // Update local state immediately
    setJobStatuses((prev) => ({ ...prev, [jobId]: "rejected" }));

    // Persist to Convex
    if (profile?.email) {
      try {
        const result = await rejectJob({ userEmail: profile.email, jobId });
        if (!result.success) {
          console.error("[AutoApply] Failed to reject job in Convex:", result.error);
        }
      } catch (err) {
        console.error("[AutoApply] Error rejecting job:", err);
      }
    }
  };

  const handleRetry = async (jobId: string) => {
    setJobErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[jobId];
      return newErrors;
    });
    setJobStatuses((prev) => ({ ...prev, [jobId]: "approved" }));

    // Re-approve in Convex for retry
    if (profile?.email) {
      try {
        await approveJob({ userEmail: profile.email, jobId });
      } catch (err) {
        console.error("[AutoApply] Error retrying job:", err);
      }
    }
  };

  return (
    <div className="min-h-screen font-sans relative">
      <GradientBackground />
      <DashboardNavbar />

      <main className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
        <AgentControlCenter
          isDiscovering={isDiscovering}
          discoveryProgress={progress}
          discoveryStats={discoveryStats}
          onStartDiscovery={handleStartDiscovery}
          onStopDiscovery={stopDiscovery}

          isApplying={isApplying || isAutoApplying}
          autoApplyProgress={autoApplyProgress}
          autoApplyEnabled={autoApplyEnabled}
          onToggleAutoApply={setAutoApplyEnabled}
          onStopAutoApply={stopAutoApply}

          jobs={jobs}
          onApproveJob={handleApprove}
          onRejectJob={handleReject}
          onRetryJob={handleRetry}
          userId={userId}
        />
      </main>
    </div>
  );
}
