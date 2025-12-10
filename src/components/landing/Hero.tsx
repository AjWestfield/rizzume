
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
                <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-200/40 via-pink-100/30 to-transparent blur-3xl" />
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
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-400">Start Interviewing in Days</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
                    >
                        Rizzume finds high-match roles, tailors your resume & cover letter,
                        <br className="hidden md:block" />
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

                    <div className="mt-20 mb-32">
                        <p className="text-sm font-medium text-gray-400 mb-8 uppercase tracking-widest">Get hired by top companies worldwide</p>
                        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-16">
                            {/* Coinbase */}
                            <div className="flex items-center gap-2 text-gray-400">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 19.5a7.5 7.5 0 110-15 7.5 7.5 0 010 15z"/>
                                </svg>
                                <span className="text-xl font-semibold tracking-tight">coinbase</span>
                            </div>
                            {/* Spotify */}
                            <div className="flex items-center gap-2 text-gray-400">
                                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                                </svg>
                                <span className="text-xl font-semibold tracking-tight">Spotify</span>
                            </div>
                            {/* Microsoft */}
                            <div className="flex items-center gap-2 text-gray-400">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M0 0h11.377v11.377H0zm12.623 0H24v11.377H12.623zM0 12.623h11.377V24H0zm12.623 0H24V24H12.623z"/>
                                </svg>
                                <span className="text-xl font-semibold tracking-tight">Microsoft</span>
                            </div>
                            {/* Meta */}
                            <div className="flex items-center gap-2 text-gray-400">
                                <svg className="h-5 w-8" viewBox="0 0 36 18" fill="currentColor">
                                    <path d="M6.5 0C3.5 0 1.4 2.2.5 4.5c-.6 1.5-.5 3 .2 4.4C2 11.4 4.7 14 8 17c.5.4 1 .7 1.6 1 .5-.3 1.1-.6 1.6-1 3.3-3 6-5.6 7.3-8.1.7-1.4.8-2.9.2-4.4C17.8 2.2 15.7 0 12.7 0c-1.5 0-2.9.6-4 1.6L8.6 1.7 8.5 1.6C7.4.6 6 0 6.5 0zm19.8 0c-1.5 0-2.9.6-4 1.6l-.1.1-.1-.1c-1.1-1-2.5-1.6-4-1.6-3 0-5.1 2.2-6 4.5-.6 1.5-.5 3 .2 4.4 1.3 2.5 4 5.1 7.3 8.1.5.4 1 .7 1.6 1 .5-.3 1.1-.6 1.6-1 3.3-3 6-5.6 7.3-8.1.7-1.4.8-2.9.2-4.4-.9-2.3-3-4.5-6-4.5z"/>
                                </svg>
                                <span className="text-xl font-semibold tracking-tight">Meta</span>
                            </div>
                            {/* SpaceX */}
                            <span className="text-xl font-bold tracking-widest text-gray-400">SPACE<span className="italic">X</span></span>
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
