"use client";

import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Briefcase,
  StopCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AutoApplyProgress } from "@/types/user-profile";
import { cn } from "@/lib/utils";

interface ApplicationProgressPanelProps {
  progress: AutoApplyProgress;
  onStop: () => void;
}

export function ApplicationProgressPanel({
  progress,
  onStop,
}: ApplicationProgressPanelProps) {
  const isRunning = progress.status === "running";
  const isCompleted = progress.status === "completed";
  const isFailed = progress.status === "failed";
  const isCancelled = progress.status === "cancelled";

  const getStatusColor = () => {
    if (isCompleted) return "bg-emerald-500";
    if (isFailed) return "bg-red-500";
    if (isCancelled) return "bg-amber-500";
    return "bg-indigo-500";
  };

  const getStatusIcon = () => {
    if (isCompleted) return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    if (isFailed) return <XCircle className="h-5 w-5 text-red-500" />;
    if (isCancelled) return <AlertCircle className="h-5 w-5 text-amber-500" />;
    return <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />;
  };

  const overallProgress =
    progress.totalJobs > 0
      ? Math.round(
          ((progress.successCount + progress.failedCount + progress.skippedCount) /
            progress.totalJobs) *
            100
        )
      : 0;

  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 rounded-xl border mb-6 overflow-hidden",
        isRunning
          ? "border-indigo-200 dark:border-indigo-800"
          : isCompleted
            ? "border-emerald-200 dark:border-emerald-800"
            : isFailed
              ? "border-red-200 dark:border-red-800"
              : "border-slate-200 dark:border-slate-800"
      )}
    >
      {/* Progress bar */}
      <div className="h-1.5 bg-slate-100 dark:bg-slate-800">
        <div
          className={cn("h-full transition-all duration-500", getStatusColor())}
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {isCompleted
                  ? "Auto-Apply Complete"
                  : isFailed
                    ? "Auto-Apply Failed"
                    : isCancelled
                      ? "Auto-Apply Cancelled"
                      : "Applying to Jobs..."}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {progress.currentPhase}
              </p>
            </div>
          </div>

          {isRunning && (
            <Button
              variant="outline"
              size="sm"
              onClick={onStop}
              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <StopCircle className="h-4 w-4 mr-2" />
              Stop
            </Button>
          )}
        </div>

        {/* Current job */}
        {isRunning && progress.currentJob && (
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {progress.currentJob.title}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 ml-6">
              {progress.currentJob.company}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {progress.totalJobs}
            </p>
            <p className="text-xs text-slate-500">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {progress.successCount}
            </p>
            <p className="text-xs text-slate-500">Applied</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {progress.failedCount}
            </p>
            <p className="text-xs text-slate-500">Failed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-400">
              {progress.skippedCount}
            </p>
            <p className="text-xs text-slate-500">Skipped</p>
          </div>
        </div>

        {/* Error message */}
        {progress.lastError && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">
                {progress.lastError}
              </p>
            </div>
          </div>
        )}

        {/* Progress detail */}
        {isRunning && (
          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>
              Job {progress.currentJobIndex + 1} of {progress.totalJobs}
            </span>
            <span>{overallProgress}% complete</span>
          </div>
        )}
      </div>
    </div>
  );
}
