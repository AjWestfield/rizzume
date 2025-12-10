"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import type { AutoApplyProfile } from "@/types/user-profile";

interface ApprovedJob {
  _id: Id<"jobQueue">;
  jobId: string;
  jobTitle: string;
  company: string;
  location?: string;
  applyLink: string;
  description?: string;
  matchScore: number;
  status: string;
}

interface AutoApplyTriggerOptions {
  userEmail: string | null;
  profile: AutoApplyProfile | null;
  isEnabled: boolean;
  onApplyStart?: () => void;
  onApplyComplete?: (success: boolean, error?: string) => void;
  onJobStatusChange?: (jobId: string, status: string) => void;
}

interface AutoApplyTriggerResult {
  // State
  pendingCount: number;
  isProcessing: boolean;
  currentJob: ApprovedJob | null;
  error: string | null;
  sessionId: string | null;

  // Stats
  stats: {
    approved: number;
    applying: number;
    applied: number;
    failed: number;
  };

  // Actions
  retryFailedJob: (jobQueueId: Id<"jobQueue">) => Promise<void>;
  processNextJob: () => Promise<void>;
}

export function useAutoApplyTrigger({
  userEmail,
  profile,
  isEnabled,
  onApplyStart,
  onApplyComplete,
  onJobStatusChange,
}: AutoApplyTriggerOptions): AutoApplyTriggerResult {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentJob, setCurrentJob] = useState<ApprovedJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const processingRef = useRef(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Convex queries - Get approved jobs ready for auto-apply
  const approvedJobs = useQuery(
    api.autoApplyTrigger.getApprovedJobsForAutoApply,
    userEmail ? { userEmail } : "skip"
  ) as ApprovedJob[] | undefined;

  // Get stats for all job statuses
  const stats = useQuery(
    api.autoApplyTrigger.getAutoApplyStats,
    userEmail ? { userEmail } : "skip"
  );

  // Convex mutations
  const markJobAsApplying = useMutation(api.autoApplyTrigger.markJobAsApplying);
  const markJobAsApplied = useMutation(api.autoApplyTrigger.markJobAsApplied);
  const markJobAsFailed = useMutation(api.autoApplyTrigger.markJobAsFailed);
  const retryFailedJobMutation = useMutation(api.autoApplyTrigger.retryFailedJob);

  // Poll for job completion
  const pollForCompletion = useCallback(async (sid: string, job: ApprovedJob) => {
    return new Promise<void>((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 120; // 2 minutes max (1 second intervals)

      const poll = async () => {
        attempts++;

        try {
          const response = await fetch(`/api/agent/auto-apply?sessionId=${sid}`);
          if (!response.ok) {
            throw new Error("Failed to get status");
          }

          const data = await response.json();
          const progress = data.progress;

          if (progress?.status === "completed") {
            // Mark job as applied in Convex
            await markJobAsApplied({ jobQueueId: job._id });
            onJobStatusChange?.(job.jobId, "applied");
            onApplyComplete?.(true);
            resolve();
            return;
          }

          if (progress?.status === "failed" || progress?.status === "cancelled") {
            const errorMsg = progress.lastError || "Application failed";
            await markJobAsFailed({ jobQueueId: job._id, error: errorMsg });
            onJobStatusChange?.(job.jobId, "failed");
            reject(new Error(errorMsg));
            return;
          }

          if (attempts >= maxAttempts) {
            await markJobAsFailed({ jobQueueId: job._id, error: "Timeout waiting for completion" });
            onJobStatusChange?.(job.jobId, "failed");
            reject(new Error("Timeout waiting for completion"));
            return;
          }

          // Continue polling
          pollingRef.current = setTimeout(poll, 1000);
        } catch (err) {
          reject(err);
        }
      };

      poll();
    });
  }, [markJobAsApplied, markJobAsFailed, onJobStatusChange, onApplyComplete]);

  // Process a single job
  const processJob = useCallback(async (job: ApprovedJob) => {
    if (!profile) {
      setError("Profile not available for auto-apply");
      return;
    }

    setCurrentJob(job);
    setError(null);
    onJobStatusChange?.(job.jobId, "applying");

    try {
      // Atomically mark job as applying (prevents double-apply)
      const claimResult = await markJobAsApplying({ jobQueueId: job._id });

      if (!claimResult.success) {
        console.log("[AutoApplyTrigger] Job already being processed:", job._id);
        return;
      }

      // Generate a session ID for this job
      const jobSessionId = `auto-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      setSessionId(jobSessionId);

      // Call the auto-apply API
      const response = await fetch("/api/agent/auto-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobs: [{
            id: job.jobId,
            applyLink: job.applyLink,
            jobTitle: job.jobTitle,
            company: job.company,
            location: job.location,
            description: job.description,
          }],
          profile,
          sessionId: jobSessionId,
          config: {
            headless: true,
            delayBetweenJobs: 3000,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Application failed");
      }

      // Poll for completion
      await pollForCompletion(jobSessionId, job);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("[AutoApplyTrigger] Error processing job:", errorMessage);

      await markJobAsFailed({ jobQueueId: job._id, error: errorMessage });
      onJobStatusChange?.(job.jobId, "failed");
      setError(errorMessage);
      onApplyComplete?.(false, errorMessage);
    }
  }, [profile, markJobAsApplying, markJobAsFailed, onJobStatusChange, onApplyComplete, pollForCompletion]);

  // Process next approved job
  const processNextJob = useCallback(async () => {
    if (!approvedJobs?.length || !isEnabled || processingRef.current) {
      return;
    }

    processingRef.current = true;
    setIsProcessing(true);
    onApplyStart?.();

    try {
      const nextJob = approvedJobs[0];
      await processJob(nextJob);
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
      setCurrentJob(null);
      setSessionId(null);
    }
  }, [approvedJobs, isEnabled, processJob, onApplyStart]);

  // Retry a failed job
  const retryFailedJob = useCallback(async (jobQueueId: Id<"jobQueue">) => {
    try {
      await retryFailedJobMutation({ jobQueueId });
    } catch (err) {
      console.error("[AutoApplyTrigger] Error retrying job:", err);
    }
  }, [retryFailedJobMutation]);

  // Auto-process when new approved jobs appear
  useEffect(() => {
    if (!isEnabled || !profile || !approvedJobs?.length || processingRef.current) {
      return;
    }

    // Small delay to batch any rapid status changes
    const timer = setTimeout(() => {
      processNextJob();
    }, 500);

    return () => clearTimeout(timer);
  }, [isEnabled, profile, approvedJobs, processNextJob]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
      }
    };
  }, []);

  return {
    pendingCount: approvedJobs?.length || 0,
    isProcessing,
    currentJob,
    error,
    sessionId,
    stats: stats || { approved: 0, applying: 0, applied: 0, failed: 0 },
    retryFailedJob,
    processNextJob,
  };
}
