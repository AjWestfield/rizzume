"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { AutoApplyProfile, AutoApplyProgress } from "@/types/user-profile";

// Job data for auto-apply
interface JobApplicationData {
  id: string;
  title: string;
  company: string;
  applyLink: string;
  coverLetter?: string;
}

interface AutoApplyResult {
  jobId: string;
  success: boolean;
  method: string;
  error?: string;
  formFieldsFilled?: number;
  appliedAt?: number;
}

interface UseAutoApplyResult {
  // State
  isApplying: boolean;
  progress: AutoApplyProgress | null;
  results: AutoApplyResult[];
  error: string | null;
  sessionId: string | null;

  // Actions
  startAutoApply: (jobs: JobApplicationData[], profile: AutoApplyProfile) => Promise<void>;
  stopAutoApply: () => Promise<void>;
  resetAutoApply: () => void;
}

export function useAutoApply(): UseAutoApplyResult {
  const [isApplying, setIsApplying] = useState(false);
  const [progress, setProgress] = useState<AutoApplyProgress | null>(null);
  const [results, setResults] = useState<AutoApplyResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const pollProgress = useCallback(async (sid: string) => {
    try {
      const response = await fetch(`/api/agent/auto-apply?sessionId=${sid}`);
      if (response.ok) {
        const data = await response.json();
        if (data.progress) {
          setProgress(data.progress);
        }
        if (data.results) {
          setResults(data.results);
        }

        // Check if completed
        if (
          data.progress?.status === "completed" ||
          data.progress?.status === "failed" ||
          data.progress?.status === "cancelled"
        ) {
          setIsApplying(false);
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
      }
    } catch (err) {
      console.error("Error polling progress:", err);
    }
  }, []);

  const startAutoApply = useCallback(
    async (jobs: JobApplicationData[], profile: AutoApplyProfile) => {
      setIsApplying(true);
      setError(null);
      setResults([]);
      setProgress(null);

      try {
        // Start the auto-apply process
        const response = await fetch("/api/agent/auto-apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobs,
            profile,
            config: {
              headless: true,
              delayBetweenJobs: 5000,
            },
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to start auto-apply");
        }

        setSessionId(data.sessionId);

        // Set initial progress
        setProgress({
          sessionId: data.sessionId,
          status: "running",
          currentPhase: "initializing",
          totalJobs: jobs.length,
          currentJobIndex: 0,
          successCount: 0,
          failedCount: 0,
          skippedCount: 0,
        });

        // Start polling for progress
        pollingIntervalRef.current = setInterval(() => {
          pollProgress(data.sessionId);
        }, 1000);

        // Also poll immediately
        await pollProgress(data.sessionId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to start auto-apply");
        setIsApplying(false);
      }
    },
    [pollProgress]
  );

  const stopAutoApply = useCallback(async () => {
    try {
      // Stop polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }

      // Close event source
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      // Send stop request
      await fetch("/api/agent/auto-apply?action=stop");

      // Update local state
      if (progress) {
        setProgress({
          ...progress,
          status: "cancelled",
          currentPhase: "cancelled",
        });
      }

      setIsApplying(false);
    } catch (err) {
      console.error("Error stopping auto-apply:", err);
    }
  }, [progress]);

  const resetAutoApply = useCallback(() => {
    // Clean up
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // Reset state
    setIsApplying(false);
    setProgress(null);
    setResults([]);
    setError(null);
    setSessionId(null);
  }, []);

  return {
    isApplying,
    progress,
    results,
    error,
    sessionId,
    startAutoApply,
    stopAutoApply,
    resetAutoApply,
  };
}
