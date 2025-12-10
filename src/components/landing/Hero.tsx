
"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Star, FileText, Send, User } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
    return (
        <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
            {/* Background Gradients */}
            <div className="absolute inset-0 -z-10 bg-[#FDF4F8]">
                <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-200/40 via-pink-100/20 to-transparent blur-3xl" />
                <div className="absolute top-1/4 -left-64 w-96 h-96 bg-purple-300/30 rounded-full blur-[128px]" />
                <div className="absolute top-1/3 -right-64 w-96 h-96 bg-pink-300/30 rounded-full blur-[128px]" />
            </div>

            <div className="container relative z-10">
                <div className="flex flex-col items-center text-center max-w-5xl mx-auto mb-20">
                    {/* Trustpilot Mock */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 mb-8 bg-white/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-gray-100/50"
                    >
                        <span className="font-medium text-gray-900">Excellent</span>
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="bg-[#00B67A] p-1 rounded-sm">
                                    <Star className="w-3 h-3 text-white fill-white" />
                                </div>
                            ))}
                        </div>
                        <span className="font-medium text-gray-900 ml-1">Trustpilot</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-gray-900 mb-6 leading-[1.1]"
                    >
                        Stop Applying for Weeks<br />
                        <span className="text-[#EC4899]">Start Interviewing in Days</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed"
                    >
                        aiApply finds high-match roles, tailors your resume & cover letter,
                        auto-applies, and coaches you live - so you move from submit to scheduled fast.
                    </motion.p>

                    <div className="flex flex-col items-center gap-4">
                        <Link href="/sign-up">
                            <Button className="bg-[#6366f1] hover:bg-[#5558e6] text-white rounded-full px-8 py-6 text-lg font-medium shadow-xl shadow-indigo-200 transition-transform hover:scale-105">
                                Start now for free <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>

                        <div className="flex items-center gap-3 mt-4">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden relative">
                                        <Image
                                            src={`/testimonials/${['sarah', 'michael', 'emily'][i - 1]}.png`}
                                            alt="User"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Star key={i} className="w-3 h-3 text-orange-400 fill-orange-400" />
                                    ))}
                                </div>
                                <span className="text-xs text-gray-600 font-medium">Loved by 1,005,991 users</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 mb-24 opacity-60 grayscale">
                        <p className="text-sm font-medium text-gray-500 mb-6 uppercase tracking-wider">Get hired by top companies worldwide</p>
                        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-50">
                            {/* Replace with actual logos or text placeholders for now */}
                            <span className="text-xl font-bold font-sans">coinbase</span>
                            <span className="text-xl font-bold font-sans">Spotify</span>
                            <span className="text-xl font-bold font-sans">Microsoft</span>
                            <span className="text-xl font-bold font-sans">Meta</span>
                            <span className="text-xl font-bold font-sans">SPACEX</span>
                        </div>
                    </div>
                </div>

                {/* Overlapping Feature Cards */}
                <div className="grid md:grid-cols-3 gap-6 relative z-20 -mb-32">
                    {/* Card 1: Optimized Cover Letter */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                                <FileText className="w-6 h-6" />
                            </div>
                            <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-2 py-1 rounded-full">99.8% match</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Optimized Cover Letter</h3>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 h-48 relative overflow-hidden">
                            <div className="space-y-2 opacity-60">
                                <div className="h-2 w-1/3 bg-gray-300 rounded" />
                                <div className="h-2 w-full bg-gray-200 rounded" />
                                <div className="h-2 w-full bg-gray-200 rounded" />
                                <div className="h-2 w-5/6 bg-gray-200 rounded" />
                                <div className="h-2 w-full bg-gray-200 rounded mt-4" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                        </div>
                    </motion.div>

                    {/* Card 2: Optimized Resume */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                <FileText className="w-6 h-6" />
                            </div>
                            <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-full">99.8% match</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Optimized Resume</h3>
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 h-48 relative shadow-sm">
                            <div className="text-center mb-4">
                                <h4 className="font-bold text-gray-900">Steve Jobs</h4>
                                <p className="text-[10px] text-gray-500">Los Altos, CA • steve@apple.com</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[8px] font-bold text-gray-400 uppercase">Experience</p>
                                <div className="h-1.5 w-full bg-gray-200 rounded" />
                                <div className="h-1.5 w-full bg-gray-200 rounded" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 3: Auto Apply */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                                <Send className="w-6 h-6" />
                            </div>
                            <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-2 py-1 rounded-full">587 Jobs</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Auto Apply To Jobs</h3>
                        <div className="space-y-3">
                            <div className="bg-white border boundary-gray-100 p-3 rounded-xl shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">S</div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900">Data Analyst</p>
                                        <p className="text-[10px] text-gray-500">Stripe</p>
                                    </div>
                                </div>
                                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Applied</span>
                            </div>
                            <div className="bg-white border boundary-gray-100 p-3 rounded-xl shadow-sm flex items-center justify-between opacity-60">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">M</div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900">Product Manager</p>
                                        <p className="text-[10px] text-gray-500">Microsoft</p>
                                    </div>
                                </div>
                                <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Pending</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
