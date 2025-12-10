"use client";

import { useEffect, useRef } from "react";
import { Terminal, CheckCircle2, AlertCircle, Clock, Zap } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface LogEntry {
    id: string;
    timestamp: number;
    message: string;
    type: "info" | "success" | "error" | "warning" | "system";
}

interface AgentActivityLogProps {
    logs: LogEntry[];
    className?: string;
}

export function AgentActivityLog({ logs, className }: AgentActivityLogProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new logs arrive
    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [logs]);

    return (
        <div className={cn("flex flex-col bg-slate-950 rounded-xl overflow-hidden font-mono text-xs", className)}>
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-3">
                    {logs.length === 0 ? (
                        <div className="text-slate-600 italic text-center py-10 opacity-50">
                            Waiting for agent activity...
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="mt-0.5 flex-shrink-0">
                                    {log.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                    {log.type === "error" && <AlertCircle className="h-4 w-4 text-red-500" />}
                                    {log.type === "warning" && <AlertCircle className="h-4 w-4 text-amber-500" />}
                                    {log.type === "system" && <Zap className="h-4 w-4 text-indigo-500" />}
                                    {log.type === "info" && <Clock className="h-4 w-4 text-slate-500" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xs text-slate-500 flex-shrink-0">
                                            [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                                        </span>
                                        <p className={cn(
                                            "break-words leading-relaxed",
                                            log.type === "success" && "text-emerald-400",
                                            log.type === "error" && "text-red-400",
                                            log.type === "warning" && "text-amber-400",
                                            log.type === "system" && "text-indigo-300 font-semibold",
                                            log.type === "info" && "text-slate-300"
                                        )}>
                                            {log.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
