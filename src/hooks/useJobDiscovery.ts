"use client";

import { useState, useCallback, useRef } from "react";
import type { DiscoveryConfig, DiscoveryProgress } from "@/lib/ai/agents/job-discovery-agent";

interface DiscoveredJobData {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  salary: string | null;
  jobType: string | null;
  remote: boolean;
  description: string;
  applyLink: string;
  source: string;
  matchScore: number;
  matchAnalysis: string;
  matchedSkills: string[];
  missingSkills: string[];
  coverLetter: string | null;
  employerLogo: string | null;
}

interface DiscoveryStats {
  totalFound: number;
  qualified: number;
  averageMatchScore: number;
}

// SSE progress from server
interface SSEProgress {
  sessionId: string;
  status: "searching" | "analyzing" | "complete" | "failed";
  currentPhase: string;
  jobsFound: number;
  jobsAnalyzed: number;
  jobsQualified: number;
  averageMatchScore: number;
  error?: string;
}

interface UseJobDiscoveryResult {
  // State
  isDiscovering: boolean;
  progress: DiscoveryProgress | null;
  discoveredJobs: DiscoveredJobData[];
  stats: DiscoveryStats | null;
  error: string | null;

  // Actions
  startDiscovery: (resumeText: string, config?: Partial<DiscoveryConfig>) => Promise<void>;
  stopDiscovery: () => void;
  clearResults: () => void;
}

export function useJobDiscovery(): UseJobDiscoveryResult {
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [progress, setProgress] = useState<DiscoveryProgress | null>(null);
  const [discoveredJobs, setDiscoveredJobs] = useState<DiscoveredJobData[]>([]);
  const [stats, setStats] = useState<DiscoveryStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Polling fallback - polls the GET endpoint when SSE fails
   */
  const startPollingFallback = useCallback(
    (sessionId: string) => {
      console.log("[useJobDiscovery] Starting polling fallback for session:", sessionId);

      // Clear any existing polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      let pollCount = 0;
      const maxPolls = 300; // 10 minutes at 2-second intervals

      const pollForResults = async (): Promise<boolean> => {
        pollCount++;
        if (pollCount > maxPolls) {
          console.log("[useJobDiscovery] Polling timeout");
          setError("Discovery timed out");
          setIsDiscovering(false);
          return false;
        }

        try {
          const response = await fetch(`/api/agent/discover-jobs?sessionId=${sessionId}`);

          if (!response.ok) {
            if (response.status === 404) {
              // Session truly doesn't exist after retries
              console.error("[useJobDiscovery] Session not found via polling");
              setError("Session expired. Please try again.");
              setIsDiscovering(false);
              return false;
            }
            // Keep polling on other errors
            return true;
          }

          const data = await response.json();
          if (data.success && data.progress) {
            // Update progress
            setProgress({
              status:
                data.progress.status === "complete"
                  ? "complete"
                  : data.progress.status === "failed"
                  ? "error"
                  : data.progress.status,
              currentPhase: data.progress.currentPhase,
              jobsFound: data.progress.jobsFound,
              jobsAnalyzed: data.progress.jobsAnalyzed,
              jobsQualified: data.progress.jobsQualified,
              averageMatchScore: data.progress.averageMatchScore,
              error: data.progress.error,
            });

            // Check if complete
            if (data.progress.status === "complete" && data.data) {
              console.log("[useJobDiscovery] Polling: Discovery complete");
              setDiscoveredJobs(data.data.jobs || []);
              setStats(data.data.stats || null);
              setIsDiscovering(false);
              return false; // Stop polling
            }

            // Check if failed
            if (data.progress.status === "failed") {
              console.error("[useJobDiscovery] Polling: Discovery failed");
              setError(data.progress.error || "Discovery failed");
              setIsDiscovering(false);
              return false;
            }
          }
          return true; // Continue polling
        } catch (e) {
          console.error("[useJobDiscovery] Polling error:", e);
          return true; // Keep trying
        }
      };

      // Start polling every 2 seconds
      pollingIntervalRef.current = setInterval(async () => {
        const shouldContinue = await pollForResults();
        if (!shouldContinue && pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }, 2000);

      // Also do an immediate poll
      pollForResults();
    },
    []
  );

  const startDiscovery = useCallback(
    async (resumeText: string, config?: Partial<DiscoveryConfig>) => {
      // Reset state
      setIsDiscovering(true);
      setError(null);
      setDiscoveredJobs([]);
      setStats(null);

      // Clear any existing polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }

      // Create abort controller for the initial POST
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Set initial progress
      setProgress({
        status: "searching",
        currentPhase: "Starting AI discovery...",
        jobsFound: 0,
        jobsAnalyzed: 0,
        jobsQualified: 0,
      });

      try {
        // Step 1: Start discovery and get session ID
        const response = await fetch("/api/agent/discover-jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeText,
            config: {
              minMatchScore: config?.minMatchScore ?? 70,
              maxJobsToAnalyze: config?.maxJobsToAnalyze ?? 30,
              generateCoverLetters: config?.generateCoverLetters ?? true,
              searchQueries: config?.searchQueries ?? [],
              location: config?.location,
              remoteOnly: config?.remoteOnly ?? false,
            },
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Discovery failed");
        }

        const data = await response.json();

        if (!data.success || !data.sessionId) {
          throw new Error(data.error || "Failed to start discovery");
        }

        const sessionId = data.sessionId;
        console.log("[useJobDiscovery] Started discovery session:", sessionId);

        // Step 2: Open SSE connection for real-time progress
        const eventSource = new EventSource(
          `/api/agent/discover-jobs/status?sessionId=${sessionId}`
        );
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          console.log("[useJobDiscovery] SSE connected");
        };

        eventSource.addEventListener("connected", () => {
          console.log("[useJobDiscovery] SSE connection confirmed");
        });

        eventSource.addEventListener("progress", (event) => {
          try {
            const progressData: SSEProgress = JSON.parse(event.data);
            console.log("[useJobDiscovery] Progress update:", progressData);

            // Convert SSE progress to DiscoveryProgress format
            setProgress({
              status: progressData.status === "complete" ? "complete" :
                progressData.status === "failed" ? "error" : progressData.status,
              currentPhase: progressData.currentPhase,
              jobsFound: progressData.jobsFound,
              jobsAnalyzed: progressData.jobsAnalyzed,
              jobsQualified: progressData.jobsQualified,
              averageMatchScore: progressData.averageMatchScore,
              error: progressData.error,
            });
          } catch (e) {
            console.error("[useJobDiscovery] Error parsing progress:", e);
          }
        });

        eventSource.addEventListener("results", (event) => {
          try {
            const resultsData = JSON.parse(event.data);
            console.log("[useJobDiscovery] Results received:", resultsData);

            setDiscoveredJobs(resultsData.jobs || []);
            setStats(resultsData.stats || null);
          } catch (e) {
            console.error("[useJobDiscovery] Error parsing results:", e);
          }
        });

        eventSource.addEventListener("done", () => {
          console.log("[useJobDiscovery] Discovery complete");
          eventSource.close();
          eventSourceRef.current = null;
          setIsDiscovering(false);
        });

        eventSource.addEventListener("timeout", () => {
          console.log("[useJobDiscovery] Discovery timed out");
          eventSource.close();
          eventSourceRef.current = null;
          setIsDiscovering(false);
          setError("Discovery timed out");
          setProgress((prev) => prev ? ({ ...prev, status: "error", error: "Discovery timed out" }) : null);
        });

        eventSource.addEventListener("error", (event: MessageEvent) => {
          try {
            const errorData = JSON.parse(event.data || "{}");
            console.warn("[useJobDiscovery] Server reported error:", errorData.error);

            if (errorData.error === "Session not found") {
              // SSE failed - switch to polling fallback
              console.log("[useJobDiscovery] SSE session not found, switching to polling");
              eventSource.close();
              eventSourceRef.current = null;
              // Don't set error yet - try polling first
              startPollingFallback(sessionId);
            } else {
              setError(errorData.error || "Connection error");
              eventSource.close();
              eventSourceRef.current = null;
              setIsDiscovering(false);
            }
          } catch (e) {
            // Generic network error (EventSource standard error)
            // Don't log as error if it's just a connection close/retry
            if (eventSource.readyState === EventSource.CLOSED) {
              console.log("[useJobDiscovery] Connection closed normally");
            } else {
              console.log("[useJobDiscovery] Connection reconnecting...");
            }
          }
        });

        eventSource.onerror = (e) => {
          // Only log if it's NOT a normal closure
          if (eventSource.readyState !== EventSource.CLOSED) {
            console.log("[useJobDiscovery] SSE connection interrupted (will retry)");
          }
        };
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          setProgress({
            status: "idle",
            currentPhase: "Discovery cancelled",
            jobsFound: 0,
            jobsAnalyzed: 0,
            jobsQualified: 0,
          });
        } else {
          const errorMessage = err instanceof Error ? err.message : "Discovery failed";
          setError(errorMessage);
          setProgress({
            status: "error",
            currentPhase: "Discovery failed",
            jobsFound: 0,
            jobsAnalyzed: 0,
            jobsQualified: 0,
            error: errorMessage,
          });
        }
        setIsDiscovering(false);
      }
    },
    [startPollingFallback]
  );

  const stopDiscovery = useCallback(() => {
    // Close SSE connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Clear polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // Abort any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setIsDiscovering(false);
    setProgress({
      status: "idle",
      currentPhase: "Discovery stopped",
      jobsFound: progress?.jobsFound || 0,
      jobsAnalyzed: progress?.jobsAnalyzed || 0,
      jobsQualified: progress?.jobsQualified || 0,
    });
  }, [progress]);

  const clearResults = useCallback(() => {
    setDiscoveredJobs([]);
    setStats(null);
    setError(null);
    setProgress(null);
  }, []);

  return {
    isDiscovering,
    progress,
    discoveredJobs,
    stats,
    error,
    startDiscovery,
    stopDiscovery,
    clearResults,
  };
}
