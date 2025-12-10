"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Briefcase, Building2, MapPin, Clock, MoreHorizontal, ArrowRight } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TrackedJobCardProps {
    id: string;
    title: string;
    company: string;
    location?: string;
    salary?: string;
    remote?: boolean;
    date: number; // timestamp
    status: string;
    type: "saved" | "application";
    onStatusChange?: (newStatus: string) => void;
    onDelete?: () => void;
    onClick?: () => void;
}

export function TrackedJobCard({
    id,
    title,
    company,
    location,
    salary,
    remote,
    date,
    status,
    type,
    onStatusChange,
    onDelete,
    onClick,
}: TrackedJobCardProps) {
    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "saved":
                return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
            case "applied":
                return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
            case "interviewing":
            case "screening":
                return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
            case "offer":
                return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
            case "rejected":
                return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
            case "withdrawn":
            case "closed":
                return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
            default:
                return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
        }
    };

    return (
        <div
            className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:shadow-md transition-all duration-200"
        >
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-4 cursor-pointer" onClick={onClick}>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate text-lg">
                            {title}
                        </h3>
                        {remote && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 h-5">
                                Remote
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 mb-3">
                        <Building2 className="h-3.5 w-3.5" />
                        <span className="font-medium text-sm">{company}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                        {location && (
                            <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{location}</span>
                            </div>
                        )}
                        {salary && (
                            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                <Briefcase className="h-3 w-3" />
                                <span>{salary}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                                {type === "saved" ? "Saved" : "Applied"} {formatDate(date)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                    <Badge className={cn("capitalize px-2.5 py-0.5", getStatusColor(status))}>
                        {status.replace("_", " ")}
                    </Badge>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {type === "saved" && onStatusChange && (
                                <DropdownMenuItem onClick={() => onStatusChange("applied")}>
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                    Mark as Applied
                                </DropdownMenuItem>
                            )}
                            {status === "applied" && onStatusChange && (
                                <DropdownMenuItem onClick={() => onStatusChange("interviewing")}>
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                    Move to Interviewing
                                </DropdownMenuItem>
                            )}
                            {onDelete && (
                                <DropdownMenuItem onClick={onDelete} className="text-red-600 dark:text-red-400">
                                    Remove
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
