"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function AutoApplyHero() {
    return (
        <section className="relative pt-32 pb-20 overflow-hidden">
            {/* Background Gradient - Matching Hero.tsx style */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-200/40 via-pink-100/40 to-transparent blur-3xl" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-indigo-200/30 via-purple-200/30 to-rose-200/30 blur-[100px] rounded-full mix-blend-multiply animate-blob" />
            </div>

            <div className="container relative z-10 px-4 mx-auto text-center">
                {/* Trust Pilot / Rating */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center items-center gap-6 mb-8"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">Excellent</span>
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="bg-[#00b67a] p-1">
                                    <Star className="w-3 h-3 text-white fill-white" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-[#00b67a] fill-[#00b67a]" />
                        <span className="text-sm font-bold text-gray-900">Trustpilot</span>
                    </div>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-[1.1]"
                >
                    Job Applications
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                        on Auto Pilot
                    </span>
                </motion.h1>

                {/* Subtext */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
                >
                    Let Rizzume find and apply directly to hundreds of matching jobs for you,
                    so you can focus on interviews not applications.
                </motion.p>

                {/* CTA Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col items-center gap-4"
                >
                    <Link href="/dashboard/auto-apply">
                        <Button size="lg" className="bg-[#6366f1] hover:bg-[#5558e6] text-white rounded-full px-8 py-6 text-lg font-semibold shadow-xl shadow-indigo-200 transition-all hover:scale-105 group">
                            Auto Apply Now
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>

                    {/* Social Proof */}
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-4">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white" />
                            ))}
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="flex text-amber-400">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Star key={i} className="w-3 h-3 fill-current" />
                                ))}
                            </div>
                            <span>Loved by 1,005,991 users</span>
                        </div>
                    </div>
                </motion.div>

                {/* Company Logos */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-20 mb-10 opacity-60 grayscale"
                >
                    <p className="text-sm font-medium text-gray-400 mb-8 uppercase tracking-widest">Get hired by top companies worldwide</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70">
                        <span className="text-2xl font-bold font-sans tracking-tight">coinbase</span>
                        <span className="text-2xl font-bold font-sans tracking-tight">Spotify</span>
                        <span className="text-2xl font-bold font-sans tracking-tight">Microsoft</span>
                        <span className="text-2xl font-bold font-sans tracking-tight">Meta</span>
                        <span className="text-2xl font-bold font-sans tracking-tight">SPACEX</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
