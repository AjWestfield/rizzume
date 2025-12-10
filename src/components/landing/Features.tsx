"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Wand2 } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export function Features() {
    return (
        <section id="features" className="py-24 bg-gray-50/50">
            <div className="container">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6">
                        You are <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">80% more likely</span> to get<br />
                        hired faster if you use Rizzume
                    </h2>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Feature 1: AI Resume Creator */}
                    <div className="bg-white rounded-[32px] p-8 md:p-12 overflow-hidden shadow-sm border border-gray-100 relative">
                        <div className="flex flex-col h-full bg-white z-10 relative">
                            <span className="text-xs font-bold tracking-wider text-purple-600 uppercase mb-4">PREPARE</span>
                            <h3 className="text-3xl font-bold text-gray-900 mb-4">AI Resume Creator</h3>
                            <p className="text-gray-600 mb-8 max-w-md">
                                Generate resumes and cover letters for each job application, based on your skills and experience.
                            </p>
                            <div className="flex items-center gap-4 mb-12">
                                <Button variant="outline" className="rounded-full px-6 py-2 h-10 border-gray-200 hover:bg-gray-50 font-semibold gap-2">
                                    Start now for free <ArrowRight className="w-4 h-4" />
                                </Button>
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                                            <Image src={`https://avatar.vercel.sh/${i + 5}`} alt="User" width={32} height={32} />
                                        </div>
                                    ))}
                                </div>
                                <span className="text-xs text-muted-foreground">Loved by 1,005,991 users</span>
                            </div>

                            {/* Resume Visual */}
                            <div className="relative mt-auto">
                                <div className="bg-white rounded-t-xl border border-gray-200 shadow-xl p-6 md:p-8 relative top-10 mx-auto max-w-md transform transition-transform hover:-translate-y-2">
                                    <div className="text-center mb-6">
                                        <h4 className="text-xl font-bold text-gray-900">Steve Jobs</h4>
                                        <p className="text-xs text-gray-500">Los Altos, CA • steve@apple.com</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-xs font-bold text-gray-900 uppercase border-b border-gray-200 pb-1 mb-2">Summary</div>
                                            <div className="h-2 w-full bg-gray-100 rounded mb-1.5" />
                                            <div className="h-2 w-full bg-gray-100 rounded mb-1.5" />
                                            <div className="h-2 w-2/3 bg-gray-100 rounded" />
                                        </div>
                                    </div>

                                    {/* Magic Wand Animation */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-[1px] rounded-full shadow-2xl"
                                    >
                                        <div className="bg-white rounded-full px-4 py-3 flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-900">Make it less wordy</span>
                                            <Wand2 className="w-4 h-4 text-purple-600" />
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 2: Auto Apply */}
                    <div className="bg-white rounded-[32px] p-8 md:p-12 overflow-hidden shadow-sm border border-gray-100 relative">
                        <div className="flex flex-col h-full bg-white z-10 relative">
                            <span className="text-xs font-bold tracking-wider text-blue-600 uppercase mb-4">APPLY</span>
                            <h3 className="text-3xl font-bold text-gray-900 mb-4">Auto Apply To Jobs</h3>
                            <p className="text-gray-600 mb-8 max-w-md">
                                Let Rizzume apply to thousands of jobs for you automatically. Save time and get hired faster.
                            </p>
                            <div className="flex items-center gap-4 mb-12">
                                <Button variant="outline" className="rounded-full px-6 py-2 h-10 border-gray-200 hover:bg-gray-50 font-semibold gap-2">
                                    Start now for free <ArrowRight className="w-4 h-4" />
                                </Button>
                                <span className="text-sm text-gray-500">372,241+ roles applied to</span>
                            </div>

                            {/* Job list visual */}
                            <div className="space-y-4 mt-auto">
                                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 font-bold">G</div>
                                        <div>
                                            <div className="font-bold text-gray-900 text-sm">Staff Engineer</div>
                                            <div className="text-xs text-gray-500">Google • AI/ML</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400">Just now</span>
                                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full">Applying...</span>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center justify-between opacity-80">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 font-bold">S</div>
                                        <div>
                                            <div className="font-bold text-gray-900 text-sm">Data Analyst</div>
                                            <div className="text-xs text-gray-500">Stripe • Finance</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400">3h</span>
                                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full">Applied</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
