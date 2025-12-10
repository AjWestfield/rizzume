"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Sparkles,
    Play,
    Square,
    Settings,
    Activity,
    Briefcase,
    Clock,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BrowserStreamView } from "@/components/auto-apply/BrowserStreamView";
import { AgentActivityLog, LogEntry } from "@/components/auto-apply/AgentActivityLog";
import { JobQueueCard } from "@/components/auto-apply/JobQueueCard";
import { cn } from "@/lib/utils";
import type { DiscoveryProgress } from "@/lib/ai/agents/job-discovery-agent";
import type { AutoApplyProgress } from "@/types/user-profile";

// Re-defining internal types to match page.tsx (should ideally be shared)
type JobStatus = "discovered" | "pending" | "approved" | "rejected" | "applying" | "applied" | "failed";

interface AgentControlCenterProps {
    isDiscovering: boolean;
    discoveryProgress: DiscoveryProgress | null;
    discoveryStats: any;
    onStartDiscovery: () => void;
    onStopDiscovery: () => void;

    isApplying: boolean;
    autoApplyProgress: AutoApplyProgress | null;
    autoApplyEnabled: boolean;
    onToggleAutoApply: (enabled: boolean) => void;
    onStopAutoApply: () => void;

    jobs: any[]; // Using any for now to avoid huge type duplication, but effectively JobWithStatus[]
    onApproveJob: (id: string) => void;
    onRejectJob: (id: string) => void;
    onRetryJob: (id: string) => void;
    sessionId?: string | null; // New prop
}

export function AgentControlCenter({
    isDiscovering,
    discoveryProgress,
    discoveryStats,
    onStartDiscovery,
    onStopDiscovery,
    isApplying,
    autoApplyProgress,
    autoApplyEnabled,
    onToggleAutoApply,
    onStopAutoApply,
    jobs,
    onApproveJob,
    onRejectJob,
    onRetryJob,
    sessionId
}: AgentControlCenterProps) {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [activeTab, setActiveTab] = useState("queue");

    // Generate logs from props changes
    useEffect(() => {
        if (discoveryProgress?.currentPhase && discoveryProgress.status !== 'idle') {
            addLog(discoveryProgress.currentPhase,
                discoveryProgress.status === 'error' ? 'error' :
                    discoveryProgress.status === 'complete' ? 'success' : 'info'
            );
        }
    }, [discoveryProgress?.currentPhase, discoveryProgress?.status]);

    useEffect(() => {
        if (autoApplyProgress?.currentPhase && autoApplyProgress.status !== 'idle') {
            addLog(autoApplyProgress.currentPhase,
                autoApplyProgress.status === 'failed' ? 'error' :
                    autoApplyProgress.status === 'completed' ? 'success' : 'info'
            );
        }
    }, [autoApplyProgress?.currentPhase, autoApplyProgress?.status]);

    const addLog = (message: string, type: LogEntry['type'] = 'info') => {
        setLogs(prev => {
            // Avoid duplicate consecutive logs
            if (prev.length > 0 && prev[prev.length - 1].message === message) return prev;

            return [...prev, {
                id: Math.random().toString(36).substring(7),
                timestamp: Date.now(),
                message,
                type
            }].slice(-50); // Keep last 50 logs
        });
    };

    // Derived stats
    const queueCount = jobs.filter(j => ["discovered", "pending", "approved"].includes(j.status)).length;
    const appliedCount = jobs.filter(j => j.status === "applied").length;
    const failedCount = jobs.filter(j => j.status === "failed").length;

    const isActive = isDiscovering || isApplying || autoApplyEnabled;

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] min-h-[800px] gap-6 font-sans">

            {/* Top Bar: Status & Monitor */}
            <div className="grid grid-cols-12 gap-6">
                {/* Agent Status Card */}
                <div className="col-span-12 md:col-span-4 lg:col-span-3">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-full flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-300">

                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles className="h-3 w-3 text-indigo-500" />
                                    AI Agent
                                </div>
                                {isActive && (
                                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 animate-pulse border-indigo-100 dark:border-indigo-800">
                                        Active
                                    </Badge>
                                )}
                            </div>

                            <div className="flex items-center gap-4 mb-8">
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isActive
                                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                    }`}>
                                    {isDiscovering ? <Zap className="h-6 w-6" /> :
                                        isApplying ? <Briefcase className="h-6 w-6" /> :
                                            <Activity className="h-6 w-6" />}
                                </div>
                                <div>
                                    <div className="text-sm text-slate-500 font-medium mb-0.5">Current Status</div>
                                    <span className={`text-xl font-bold tracking-tight ${isActive
                                            ? "text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"
                                            : "text-slate-700 dark:text-slate-200"
                                        }`}>
                                        {isDiscovering ? "Discovering Jobs" :
                                            isApplying ? "Applying Now" :
                                                autoApplyEnabled ? "Watching Queue" : "Ready to Start"}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-medium">Jobs Found</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{jobs.length}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-medium">In Queue</span>
                                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{queueCount}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-medium">Applications Sent</span>
                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{appliedCount}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                            <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Auto-Apply</span>
                                <Switch
                                    checked={autoApplyEnabled}
                                    onCheckedChange={onToggleAutoApply}
                                    className="data-[state=checked]:bg-indigo-600"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    className={cn(
                                        "w-full transition-all duration-300 shadow-sm font-semibold",
                                        isDiscovering
                                            ? "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                                            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 dark:shadow-none"
                                    )}
                                    // Cast variant to any to bypass strict type checking if needed by Shadcn definition, or use valid variants
                                    variant={isDiscovering ? "outline" : "default"}
                                    onClick={isDiscovering ? onStopDiscovery : onStartDiscovery}
                                >
                                    {isDiscovering ? (
                                        <>
                                            <Square className="h-4 w-4 mr-2 fill-current" /> Stop
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="h-4 w-4 mr-2" /> Start Discovery
                                        </>
                                    )}
                                </Button>

                                {isApplying && (
                                    <Button
                                        variant="destructive"
                                        className="w-full bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                                        onClick={onStopAutoApply}
                                    >
                                        <Square className="h-4 w-4 mr-2 fill-current" /> Stop
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Viewport (Browser) */}
                <div className="col-span-12 md:col-span-8 lg:col-span-6 h-[500px] md:h-auto min-h-[500px]">
                    <div className="h-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 flex flex-col">
                        {/* Browser Window Decoration */}
                        <div className="h-10 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600" />
                                <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600" />
                                <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600" />
                            </div>
                            <div className="ml-4 flex-1 flex justify-center">
                                <div className="px-4 py-1 rounded-md bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-500 flex items-center gap-2 w-full max-w-xs justify-center">
                                    <Settings className="h-3 w-3" />
                                    Agent Browser Session
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 relative bg-slate-950">
                            <BrowserStreamView
                                isActive={isApplying || autoApplyEnabled}
                                sessionId={sessionId || autoApplyProgress?.sessionId || null}
                            />
                        </div>
                    </div>
                </div>

                {/* Activity Log (Right Panel) */}
                <div className="col-span-12 lg:col-span-3 h-[300px] lg:h-auto min-h-[300px]">
                    <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Activity Log</span>
                            <div className={`h-2 w-2 rounded-full ${isActive ? "bg-green-500 animate-pulse" : "bg-slate-300"}`} />
                        </div>
                        <AgentActivityLog logs={logs} className="flex-1" />
                    </div>
                </div>
            </div>

            {/* Bottom Panel: Job Queue & Management (Simplified for space) */}
            <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="bg-transparent p-0 border-b border-transparent w-full justify-start gap-6 h-auto">
                            {["queue", "applied", "failed"].map(tab => (
                                <TabsTrigger
                                    key={tab}
                                    value={tab}
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-indigo-500 border-b-2 border-transparent rounded-none px-0 py-2 capitalize text-slate-500 data-[state=active]:text-indigo-600 transition-all"
                                >
                                    {tab}
                                    <Badge variant="secondary" className={cn("ml-2 text-xs rounded-full",
                                        tab === 'queue' && "bg-slate-100 text-slate-600",
                                        tab === 'applied' && "bg-emerald-50 text-emerald-600",
                                        tab === 'failed' && "bg-red-50 text-red-600"
                                    )}>
                                        {tab === 'queue' ? queueCount : tab === 'applied' ? appliedCount : failedCount}
                                    </Badge>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 dark:bg-slate-950/30">
                    {/* Content mapping remains similar but with updated empty states if needed */}
                    {activeTab === "queue" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {jobs.filter(j => ["discovered", "pending", "approved", "applying"].includes(j.status)).map(job => (
                                <JobQueueCard
                                    key={job.id}
                                    job={job}
                                    onApprove={() => onApproveJob(job.id)}
                                    onReject={() => onRejectJob(job.id)}
                                    onRetry={() => onRetryJob(job.id)}
                                />
                            ))}
                            {queueCount === 0 && (
                                <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                                        <Briefcase className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <p className="text-lg font-medium text-slate-600 dark:text-slate-300">Your queue is empty</p>
                                    <p className="text-sm">Start discovery to find new opportunities.</p>
                                </div>
                            )}
                        </div>
                    )}
                    {/* ... other tabs ... */}
                    {activeTab === "applied" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {jobs.filter(j => j.status === "applied").map(job => (
                                <JobQueueCard
                                    key={job.id}
                                    job={job}
                                    onApprove={() => { }}
                                    onReject={() => { }}
                                />
                            ))}
                            {appliedCount === 0 && (
                                <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-full mb-4">
                                        <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                                    </div>
                                    <p className="text-lg font-medium text-slate-600 dark:text-slate-300">No applications yet</p>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === "failed" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {jobs.filter(j => j.status === "failed").map(job => (
                                <JobQueueCard
                                    key={job.id}
                                    job={job}
                                    onApprove={() => { }}
                                    onReject={() => { }}
                                    onRetry={() => onRetryJob(job.id)}
                                />
                            ))}
                            {failedCount === 0 && (
                                <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                                        <CheckCircle2 className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <p className="text-lg font-medium text-slate-600 dark:text-slate-300">No failed applications</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
