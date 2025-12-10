"use client";

import { Button } from "@/components/ui/button";
import { Star, ArrowRight } from "lucide-react";
import Image from "next/image";

export function BuilderHero() {
    return (
        <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40 bg-gradient-to-b from-indigo-50/50 via-purple-50/30 to-slate-50 dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-slate-950">
            {/* Background decorations */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen dark:bg-purple-900/20 animate-blob" />
                <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-300/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen dark:bg-indigo-900/20 animate-blob animation-delay-2000" />
            </div>

            <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Trustpilot / Rating */}
                <div className="inline-flex items-center gap-2 mb-8 animate-fade-in-up">
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Excellent</span>
                    <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="bg-[#00b67a] p-1">
                                <Star className="w-3 h-3 text-white fill-current" />
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                        <Star className="w-4 h-4 text-[#00b67a] fill-current" />
                        <span>Trustpilot</span>
                    </div>
                </div>

                {/* Heading */}
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-6 animate-fade-in-up animation-delay-100">
                    Build Your Perfect Resume
                    <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600 animate-gradient-x">
                        With AI in Minutes
                    </span>
                </h1>

                {/* Subheading */}
                <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-10 animate-fade-in-up animation-delay-200 leading-relaxed">
                    Create ATS-optimized resumes tailored to your dream job. Stand out from 95% of applicants with our AI-powered resume builder.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up animation-delay-300">
                    <Button
                        size="lg"
                        className="h-14 px-8 text-lg rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 transition-all hover:scale-105"
                    >
                        Start now for free
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>

                    <div className="flex items-center gap-3 px-6 py-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-full border border-slate-200/50 dark:border-slate-800/50">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white dark:border-slate-900 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                                </div>
                            ))}
                        </div>
                        <div className="text-left">
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Star key={i} className="w-3 h-3 text-amber-400 fill-current" />
                                ))}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400">Loved by 1,005,991 users</p>
                        </div>
                    </div>
                </div>

                {/* Logos */}
                <div className="animate-fade-in-up animation-delay-400">
                    <p className="text-sm text-slate-400 mb-6 uppercase tracking-wider font-medium">Our users have been hired by</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Simple text placeholders for logos as I don't have SVGs handy, but styled to look professional */}
                        <span className="text-xl font-bold font-sans text-slate-700 dark:text-slate-300">coinbase</span>
                        <span className="text-xl font-bold font-sans text-slate-700 dark:text-slate-300 flex items-center gap-1">Spotify</span>
                        <span className="text-xl font-bold font-sans text-slate-700 dark:text-slate-300 flex items-center gap-1">Microsoft</span>
                        <span className="text-xl font-bold font-sans text-slate-700 dark:text-slate-300 flex items-center gap-1">Meta</span>
                        <span className="text-xl font-bold font-sans text-slate-700 dark:text-slate-300">SPACEX</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
