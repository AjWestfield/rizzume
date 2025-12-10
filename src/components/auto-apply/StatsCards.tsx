"use client";

import {
  Search,
  Clock,
  CheckCircle2,
  Send,
  TrendingUp,
} from "lucide-react";
import type { DiscoveryProgress } from "@/lib/ai/agents/job-discovery-agent";

interface StatsCardsProps {
  stats: {
    totalDiscovered: number;
    pendingReview: number;
    approved: number;
    applied: number;
    averageMatch: number;
  };
  // Optional progress for real-time updates during discovery
  progress?: DiscoveryProgress | null;
  isDiscovering?: boolean;
}

export function StatsCards({ stats, progress, isDiscovering }: StatsCardsProps) {
  // Use progress data during discovery for real-time updates
  const displayStats = {
    totalDiscovered: isDiscovering && progress ? progress.jobsFound : stats.totalDiscovered,
    pendingReview: isDiscovering && progress ? progress.jobsQualified : stats.pendingReview,
    approved: stats.approved,
    applied: stats.applied,
    // Use averageMatchScore from progress during discovery
    averageMatch: isDiscovering && progress && progress.averageMatchScore
      ? progress.averageMatchScore
      : stats.averageMatch,
  };

  const cards = [
    {
      label: "Discovered",
      value: displayStats.totalDiscovered,
      icon: Search,
      color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
    },
    {
      label: "Pending Review",
      value: displayStats.pendingReview,
      icon: Clock,
      color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
    },
    {
      label: "Approved",
      value: displayStats.approved,
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    {
      label: "Applied",
      value: displayStats.applied,
      icon: Send,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      label: "Avg. Match",
      value: `${displayStats.averageMatch}%`,
      icon: TrendingUp,
      color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {card.value}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {card.label}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
