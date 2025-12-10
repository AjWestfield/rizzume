"use client";

import { motion } from "framer-motion";
import { ArrowRight, Bot, PenTool, Globe } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 bg-white">
            <div className="container">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
                        Everything you need to get hired FAST!
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Feature 1: AI Resume Builder */}
                    <div className="group relative">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Resume Builder</h3>
                            <p className="text-gray-600 leading-relaxed">
                                AI generates resumes for each job application, based on your skills and experience.
                            </p>
                        </div>
                        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#fdfbf7] to-[#f4f1ea] border border-gray-100 shadow-sm transition-all duration-300 group-hover:shadow-md aspect-[4/3]">
                            <div className="absolute inset-0 p-6 flex flex-col">
                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 h-full relative overflow-hidden">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-100" />
                                        <div className="space-y-1.5">
                                            <div className="h-2.5 w-24 bg-gray-200 rounded" />
                                            <div className="h-2 w-16 bg-gray-100 rounded" />
                                        </div>
                                    </div>
                                    <div className="space-y-2 mb-4">
                                        <div className="h-2 w-full bg-gray-50 rounded" />
                                        <div className="h-2 w-full bg-gray-50 rounded" />
                                        <div className="h-2 w-2/3 bg-gray-50 rounded" />
                                    </div>
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                                        <Button size="sm" className="bg-gray-900 text-white hover:bg-gray-800 rounded-full text-xs h-8 px-4 gap-1.5 shadow-lg">
                                            <Bot className="w-3.5 h-3.5" /> Rewrite Section
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-white/50 via-transparent to-transparent pointer-events-none" />
                        </div>
                    </div>

                    {/* Feature 2: AI Cover Letter */}
                    <div className="group relative">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Cover Letter</h3>
                            <p className="text-gray-600 leading-relaxed">
                                AI generates cover letters for each job application, increasing your chances of getting hired.
                            </p>
                        </div>
                        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#fff0f7] to-[#ffe4f0] border border-gray-100 shadow-sm transition-all duration-300 group-hover:shadow-md aspect-[4/3]">
                            <div className="absolute inset-0 p-6 flex flex-col items-center justify-center">
                                <div className="w-full max-w-[240px] bg-white rounded-xl shadow-sm border border-pink-100 p-1">
                                    <div className="bg-pink-50 rounded-lg p-1 flex justify-between mb-2">
                                        <div className="bg-white rounded px-2 py-0.5 text-[10px] font-medium shadow-sm text-pink-700">Formal</div>
                                        <div className="text-[10px] font-medium text-pink-400 px-2 py-0.5">Concise</div>
                                    </div>
                                    <div className="space-y-1.5 px-2 pb-2">
                                        <div className="h-1.5 w-full bg-gray-100 rounded" />
                                        <div className="h-1.5 w-full bg-gray-100 rounded" />
                                        <div className="h-1.5 w-4/5 bg-gray-100 rounded" />
                                    </div>
                                    <div className="mt-2 text-center pb-2">
                                        <Button size="sm" className="bg-gray-900 text-white hover:bg-gray-800 rounded-lg text-[10px] h-7 w-full shadow-lg">
                                            Download Cover Letter PDF
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 3: Auto Apply */}
                    <div className="group relative">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Auto Apply</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Let Rizzume apply to thousands of jobs for you automatically. Save time and get hired faster.
                            </p>
                        </div>
                        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#fff5eb] to-[#ffe8d6] border border-gray-100 shadow-sm transition-all duration-300 group-hover:shadow-md aspect-[4/3]">
                            <div className="absolute inset-0 p-6 pt-12">
                                <div className="space-y-3 relative z-10">
                                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 transform translate-x-4 rotate-1">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="h-2 w-20 bg-gray-200 rounded" />
                                            <span className="bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <div className="w-1 h-1 rounded-full bg-green-400" /> Auto Applied
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-100 rounded mb-1" />
                                        <div className="h-1.5 w-2/3 bg-gray-100 rounded" />
                                    </div>
                                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 transform -translate-x-2 -rotate-1 relative z-20">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="h-2 w-24 bg-gray-900 rounded" />
                                            <span className="bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <div className="w-1 h-1 rounded-full bg-green-400" /> Auto Applied
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 rounded mb-1.5" />
                                        <div className="h-2 w-1/2 bg-gray-100 rounded" />
                                    </div>
                                </div>
                                <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[#ff3c00]/10 to-transparent blur-xl" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mt-8">
                    {/* Feature 4: AI Interview Practice */}
                    <div className="group relative">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Interview Practice</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Practice with AI-generated interviews to gain valuable insights and confidence.
                            </p>
                        </div>
                        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#ff0f7b] to-[#f89b29] border border-gray-100 shadow-sm transition-all duration-300 group-hover:shadow-md aspect-[4/3]">
                            <div className="absolute inset-0 p-6 flex flex-col items-center justify-center">
                                <div className="w-[90%] bg-white/20 backdrop-blur-md rounded-xl p-4 shadow-lg border border-white/30">
                                    <div className="bg-white rounded-lg p-2 mb-3 shadow-sm transform -rotate-1 origin-left">
                                        <p className="text-[10px] text-gray-800 font-medium">"Can you work with JavaScript?"</p>
                                    </div>
                                    <div className="bg-[#fff0f5] rounded-lg p-3 shadow-sm transform rotate-1 origin-right">
                                        <p className="text-[8px] text-gray-500 mb-1 font-bold uppercase tracking-wider">Your Personalized Answer...</p>
                                        <p className="text-[9px] text-gray-700 leading-relaxed">
                                            "Absolutely, working with JavaScript has been a core component of my skillset as a Software Engineer..."
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 5: Interview Buddy */}
                    <div className="group relative">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Interview Buddy</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Get real-time interview help and answers to interview questions.
                            </p>
                        </div>
                        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#f89b29] to-[#ff0f7b] border border-gray-100 shadow-sm transition-all duration-300 group-hover:shadow-md aspect-[4/3]">
                            <div className="absolute inset-0 p-6 flex flex-col items-center justify-center">
                                <div className="w-[90%] aspect-video bg-white rounded-xl shadow-lg overflow-hidden relative">
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100" />
                                        <div className="w-8 h-8 rounded-lg bg-gray-100" />
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-20 h-20 rounded-full bg-gray-100" />
                                    </div>
                                    <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur rounded-lg p-2 max-w-[120px] shadow-sm">
                                        <p className="text-[6px] text-blue-600 font-bold mb-0.5 uppercase">Suggested Answer...</p>
                                        <p className="text-[7px] text-gray-800 leading-tight">"I can certainly tell you about a challenging project..."</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 6: Resume Translator */}
                    <div className="group relative">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Resume Translator</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Automatically translate your resume to increase your chances of getting hired.
                            </p>
                        </div>
                        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#ff00cc] to-[#333399] border border-gray-100 shadow-sm transition-all duration-300 group-hover:shadow-md aspect-[4/3]">
                            <div className="absolute inset-0 p-6 flex flex-col items-center justify-center">
                                <div className="w-full bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 relative">
                                    <div className="flex justify-between mb-4">
                                        <div className="bg-white rounded-full px-2 py-1 flex items-center gap-1">
                                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                            <span className="text-[10px] font-medium">Spanish</span>
                                        </div>
                                        <div className="bg-gray-900 rounded-full px-3 py-1 text-white text-[10px] font-bold">
                                            Translate
                                        </div>
                                    </div>

                                    <div className="bg-white/90 rounded-lg p-3 shadow-sm mb-2 transform translate-x-1">
                                        <div className="flex gap-2 mb-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500" />
                                            <span className="text-[10px] font-medium">Spanish</span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="h-1.5 w-full bg-gray-200 rounded" />
                                            <div className="h-1.5 w-3/4 bg-gray-200 rounded" />
                                        </div>
                                    </div>
                                    <div className="bg-white/50 rounded-lg p-3 blur-[1px] transform scale-95 origin-top">
                                        <div className="flex gap-2 mb-2">
                                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                                            <span className="text-[10px] font-medium">English</span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="h-1.5 w-full bg-gray-200 rounded" />
                                            <div className="h-1.5 w-3/4 bg-gray-200 rounded" />
                                        </div>
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
