
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Check, Search, Filter, Bookmark, Briefcase } from "lucide-react";

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen w-full bg-background">
            {/* Left Side - Form */}
            <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-12 xl:px-24">
                <div className="mx-auto w-full max-w-md space-y-8">
                    <div className="text-center">
                        <Link href="/" className="inline-block mb-6">
                            <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                Rizzume
                            </span>
                        </Link>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="mt-2 text-muted-foreground">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {children}
                </div>

                <div className="mt-8 text-center text-xs text-muted-foreground">
                    &copy; {new Date().getFullYear()} Rizzume. All rights reserved.
                </div>
            </div>

            {/* Right Side - Promo */}
            <div className="hidden w-1/2 bg-slate-50 dark:bg-slate-900 lg:flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(to_bottom,transparent,white)] dark:bg-grid-slate-800/50" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="text-center mb-12 space-y-4">
                        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                            Land your <br />
                            dream job
                        </h1>
                        <Badge className="px-6 py-2 text-2xl font-bold bg-primary hover:bg-primary/90 rounded-full shadow-lg">
                            3X FASTER
                        </Badge>
                    </div>

                    {/* Mobile CSS Mockup */}
                    <div className="relative w-[300px] h-[600px] bg-slate-900 rounded-[3rem] border-8 border-slate-900 shadow-2xl overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-slate-900 rounded-b-xl z-20" />

                        <div className="h-full w-full bg-slate-50 dark:bg-slate-950 overflow-hidden flex flex-col pt-8">
                            {/* App Header */}
                            <div className="px-4 pb-4 border-b flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">R</div>
                                    <span className="font-bold text-sm">Jobs</span>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800" />
                            </div>

                            {/* Job List */}
                            <div className="p-4 space-y-3">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-muted-foreground">Suggested for you</span>
                                    <Filter className="h-4 w-4 text-muted-foreground" />
                                </div>

                                {/* Job Card 1 */}
                                <motion.div
                                    initial={{ x: 50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="bg-white dark:bg-slate-900 p-3 rounded-xl border shadow-sm relative group cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex gap-2">
                                            <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center text-blue-600"><Briefcase className="h-4 w-4" /></div>
                                            <div>
                                                <p className="text-xs font-bold">Product Designer</p>
                                                <p className="text-[10px] text-muted-foreground">Spotify • Remote</p>
                                            </div>
                                        </div>
                                        <Bookmark className="h-3 w-3 text-muted-foreground" />
                                    </div>
                                    <div className="flex gap-2 text-[10px] text-muted-foreground">
                                        <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Full-time</span>
                                        <span>$120k - $160k</span>
                                    </div>
                                </motion.div>

                                {/* Job Card 2 (Active) */}
                                <motion.div
                                    initial={{ x: 50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.7 }}
                                    className="bg-white dark:bg-slate-900 p-3 rounded-xl border shadow-md relative scale-105 z-10 border-primary/20"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex gap-2">
                                            <div className="h-8 w-8 rounded bg-green-100 flex items-center justify-center text-green-600"><Briefcase className="h-4 w-4" /></div>
                                            <div>
                                                <p className="text-xs font-bold">Senior Software Engineer</p>
                                                <p className="text-[10px] text-muted-foreground">Google • Mountain View</p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Apply Button Cursor Effect */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 1.2, type: "spring" }}
                                        className="absolute -right-4 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-3 py-1.5 rounded-lg shadow-xl text-xs font-bold flex items-center z-20"
                                    >
                                        Apply <span className="ml-1 text-[10px]">👆</span>
                                    </motion.div>
                                </motion.div>

                                {/* Job Card 3 */}
                                <motion.div
                                    initial={{ x: 50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.9 }}
                                    className="bg-white dark:bg-slate-900 p-3 rounded-xl border shadow-sm relative opacity-60"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex gap-2">
                                            <div className="h-8 w-8 rounded bg-orange-100 flex items-center justify-center text-orange-600"><Briefcase className="h-4 w-4" /></div>
                                            <div>
                                                <p className="text-xs font-bold">Marketing Manager</p>
                                                <p className="text-[10px] text-muted-foreground">Airbnb • Remote</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Trusted By at Bottom Right */}
                    <div className="absolute bottom-12 left-0 right-0 text-center">
                        <p className="text-xs font-bold text-slate-400 mb-4 tracking-wider uppercase">Trusted by 630,000+ Job Seekers</p>
                        <div className="flex justify-center gap-6 opacity-50 grayscale">
                            {/* Simple SVG Placeholders for logos */}
                            <div className="h-6 w-16 bg-slate-400/20 rounded" />
                            <div className="h-6 w-16 bg-slate-400/20 rounded" />
                            <div className="h-6 w-16 bg-slate-400/20 rounded" />
                            <div className="h-6 w-16 bg-slate-400/20 rounded" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
