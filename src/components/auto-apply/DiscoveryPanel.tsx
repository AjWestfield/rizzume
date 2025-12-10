"use client";

import {
  Sparkles,
  Search,
  CheckCircle2,
  Loader2,
  StopCircle,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DiscoveryProgress } from "@/lib/ai/agents/job-discovery-agent";

interface DiscoveryPanelProps {
  progress: DiscoveryProgress;
  onStop: () => void;
}

export function DiscoveryPanel({ progress, onStop }: DiscoveryPanelProps) {
  const isError = progress.status === "error";
  const isComplete = progress.status === "complete";

  const getPhaseLabel = () => {
    if (isError) return progress.error || "Discovery failed";
    if (isComplete) return progress.currentPhase;

    switch (progress.status) {
      case "searching":
        return "Searching job listings...";
      case "analyzing":
        return "Analyzing job requirements...";
      case "generating":
        return "Generating cover letters...";
      default:
        return progress.currentPhase || "Starting discovery...";
    }
  };

  // Calculate progress percentage based on status
  const getProgressPercent = () => {
    if (isComplete) return 100;
    if (isError) return 0;

    // Estimate progress based on jobs analyzed
    const maxJobs = 30; // Typical max jobs to analyze
    return Math.min((progress.jobsAnalyzed / maxJobs) * 100, 95);
  };

  return (
    <div className={`rounded-xl p-6 mb-6 text-white shadow-lg ${
      isError
        ? "bg-gradient-to-r from-red-500 to-red-600"
        : isComplete
          ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
          : "bg-gradient-to-r from-indigo-500 to-purple-600"
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            {isError ? (
              <AlertCircle className="h-5 w-5" />
            ) : isComplete ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              {isError
                ? "Discovery Failed"
                : isComplete
                  ? "Discovery Complete!"
                  : "AI Discovery in Progress"
              }
            </h3>
            <p className="text-white/80 text-sm">{getPhaseLabel()}</p>
          </div>
        </div>
        {!isComplete && !isError && (
          <Button
            onClick={onStop}
            variant="ghost"
            className="bg-white/10 border border-white/30 text-white hover:bg-white/20 hover:text-white"
          >
            <StopCircle className="h-4 w-4 mr-2" />
            Stop
          </Button>
        )}
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white/10 rounded-lg p-3">
          <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
            <Search className="h-3.5 w-3.5" />
            Jobs Found
          </div>
          <div className="text-2xl font-bold">{progress.jobsFound}</div>
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Qualified
          </div>
          <div className="text-2xl font-bold">{progress.jobsQualified}</div>
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
            <TrendingUp className="h-3.5 w-3.5" />
            Avg. Match
          </div>
          <div className="text-2xl font-bold">
            {progress.averageMatchScore || 0}%
          </div>
        </div>
      </div>

      {/* Current Phase */}
      {!isComplete && !isError && (
        <div className="flex items-center gap-2 text-sm text-white/80">
          <Loader2 className="h-4 w-4 animate-spin" />
          {progress.currentPhase}
        </div>
      )}

      {/* Progress Bar */}
      <div className="mt-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-white/80 rounded-full transition-all duration-500"
          style={{ width: `${getProgressPercent()}%` }}
        />
      </div>
    </div>
  );
}
