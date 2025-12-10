"use client";

import { useState, useEffect } from "react";
import { Monitor, Loader2, Clock, CheckCircle2, XCircle, Zap, ExternalLink } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { cn } from "@/lib/utils";
import type { Id } from "../../../convex/_generated/dataModel";

interface BrowserStreamViewProps {
  userId: Id<"users"> | null;
  isActive: boolean;
  className?: string;
}

/**
 * Queue-Based Browser View
 *
 * Instead of streaming browser frames, this shows the current queue status
 * and progress using Convex real-time updates.
 */
export function BrowserStreamView({
  userId,
  isActive,
  className,
}: BrowserStreamViewProps) {
  // Real-time queue stats from Convex
  const queueStats = useQuery(
    api.applicationQueue.getQueueStats,
    userId ? { userId } : "skip"
  );

  // Currently processing job
  const currentlyProcessing = useQuery(
    api.applicationQueue.getCurrentlyProcessing,
    userId ? { userId } : "skip"
  );

  // Recent queue entries
  const recentQueue = useQuery(
    api.applicationQueue.getUserQueue,
    userId ? { userId } : "skip"
  );

  // Calculate next cron run time (every 2 minutes)
  const [nextRun, setNextRun] = useState<string>("");
  useEffect(() => {
    const updateNextRun = () => {
      const now = new Date();
      const minutes = now.getMinutes();
      const nextMinute = minutes % 2 === 0 ? minutes + 2 : minutes + 1;
      const next = new Date(now);
      next.setMinutes(nextMinute);
      next.setSeconds(0);
      next.setMilliseconds(0);

      const diff = Math.max(0, Math.floor((next.getTime() - Date.now()) / 1000));
      setNextRun(`${Math.floor(diff / 60)}:${(diff % 60).toString().padStart(2, '0')}`);
    };

    updateNextRun();
    const interval = setInterval(updateNextRun, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={cn(
        "relative w-full h-full bg-slate-950 overflow-hidden flex flex-col",
        className
      )}
    >
      {/* Viewport */}
      <div className="flex-1 relative flex flex-col bg-[#0a0f16] p-6">
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none" />

        {!isActive ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8 opacity-40">
              <Monitor className="h-16 w-16 text-slate-700 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-500">Agent Offline</h3>
              <p className="text-slate-600 mt-2 max-w-sm mx-auto">
                Agent is in standby mode. Enable auto-apply to start processing.
              </p>
            </div>
          </div>
        ) : !userId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8 opacity-80">
              <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white">Loading...</h3>
            </div>
          </div>
        ) : (
          <>
            {/* Queue Status Header */}
            <div className="relative z-10 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Application Queue</h3>
                    <p className="text-slate-400 text-sm">
                      Cron-based processing every 2 minutes
                    </p>
                  </div>
                </div>

                {/* Next run countdown */}
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-300 text-sm font-mono">
                    Next run: {nextRun}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            {queueStats && (
              <div className="relative z-10 grid grid-cols-5 gap-4 mb-6">
                <StatCard
                  label="Pending"
                  value={queueStats.pending}
                  color="amber"
                />
                <StatCard
                  label="In Progress"
                  value={queueStats.inProgress}
                  color="blue"
                  pulse={queueStats.inProgress > 0}
                />
                <StatCard
                  label="Completed"
                  value={queueStats.completed}
                  color="emerald"
                />
                <StatCard
                  label="Failed"
                  value={queueStats.failed}
                  color="red"
                />
                <StatCard
                  label="Skipped"
                  value={queueStats.skipped}
                  color="slate"
                />
              </div>
            )}

            {/* Currently Processing */}
            {currentlyProcessing && currentlyProcessing.job && (
              <div className="relative z-10 mb-6 p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-8 w-8 rounded-full bg-indigo-500/30 flex items-center justify-center">
                      <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" />
                    </div>
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{currentlyProcessing.job.title}</p>
                    <p className="text-slate-400 text-sm">{currentlyProcessing.job.company}</p>
                  </div>
                  <a
                    href={currentlyProcessing.job.applyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                  </a>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="relative z-10 flex-1 overflow-hidden">
              <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                Recent Activity
              </h4>
              <div className="space-y-2 overflow-y-auto max-h-[200px]">
                {recentQueue?.slice(0, 10).map((entry) => (
                  <div
                    key={entry._id}
                    className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30"
                  >
                    <StatusIcon status={entry.status} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {entry.job?.title || "Unknown Job"}
                      </p>
                      <p className="text-slate-500 text-xs truncate">
                        {entry.job?.company || "Unknown Company"}
                      </p>
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      entry.status === "completed" && "bg-emerald-500/20 text-emerald-400",
                      entry.status === "failed" && "bg-red-500/20 text-red-400",
                      entry.status === "pending" && "bg-amber-500/20 text-amber-400",
                      entry.status === "in_progress" && "bg-blue-500/20 text-blue-400",
                      entry.status === "skipped" && "bg-slate-500/20 text-slate-400"
                    )}>
                      {entry.status.replace("_", " ")}
                    </span>
                  </div>
                ))}

                {(!recentQueue || recentQueue.length === 0) && (
                  <div className="text-center py-8 text-slate-500">
                    <p>No applications in queue yet.</p>
                    <p className="text-sm mt-1">Approve jobs to start auto-applying.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  pulse = false,
}: {
  label: string;
  value: number;
  color: "amber" | "blue" | "emerald" | "red" | "slate";
  pulse?: boolean;
}) {
  const colorClasses = {
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    red: "bg-red-500/10 border-red-500/20 text-red-400",
    slate: "bg-slate-500/10 border-slate-500/20 text-slate-400",
  };

  return (
    <div className={cn(
      "p-3 rounded-xl border text-center",
      colorClasses[color],
      pulse && "animate-pulse"
    )}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs opacity-80">{label}</div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
    case "failed":
      return <XCircle className="h-5 w-5 text-red-400" />;
    case "in_progress":
      return <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />;
    case "pending":
      return <Clock className="h-5 w-5 text-amber-400" />;
    default:
      return <div className="h-5 w-5 rounded-full bg-slate-600" />;
  }
}

// Export legacy interface for backwards compatibility
export { BrowserStreamView as default };
