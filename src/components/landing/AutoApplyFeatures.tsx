"use client";

import { motion } from "framer-motion";
import { FileText, MessageSquare } from "lucide-react";

export function AutoApplyFeatures() {
    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4 grid md:grid-cols-2 gap-16 items-center mb-24">
                {/* Left Side */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="space-y-8"
                >
                    <div>
                        <h3 className="text-2xl font-bold mb-4">Enhanced Application Quality</h3>
                        <p className="text-gray-600 leading-relaxed mb-6">
                            We don't just apply for you, we optimize your applications. Our artificial
                            intelligence technology can enhance your resume and cover letters to match
                            the job description perfectly, boosting your chances of getting noticed by
                            employers and passing through Applicant Tracking Systems (ATS).
                        </p>
                        <ul className="space-y-2">
                            {["Resume Optimization", "Customized Cover Letter", "ATS-Friendly Job Application"].map((item) => (
                                <li key={item} className="flex items-center gap-2 text-sm font-medium text-gray-800">
                                    <span className="w-1.5 h-1.5 bg-black rounded-full" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>

                {/* Right Side - Visual */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 h-[350px]"
                >
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl w-[280px]">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div className="text-xs font-semibold">Resume.pdf</div>
                                </div>
                                <div className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded">Optimized</div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-2 bg-gray-200 rounded w-full" />
                                <div className="h-2 bg-gray-200 rounded w-3/4" />
                                <div className="h-2 bg-gray-200 rounded w-5/6" />
                                <div className="h-2 bg-gray-200 rounded w-full" />
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                <div className="text-xs text-gray-500">ATS Score</div>
                                <div className="text-sm font-bold text-gray-900">98/100</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="container mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
                {/* Left Side (Visual) */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#FF9A9E] to-[#FECFEF] h-[350px] order-2 md:order-1"
                >
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-2xl shadow-xl max-w-[300px]">
                            <div className="flex gap-4 mb-4">
                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                    {/* User avatar placeholder */}
                                    <div className="w-full h-full bg-indigo-100" />
                                </div>
                                <div className="flex-1">
                                    <div className="bg-indigo-50 p-3 rounded-2xl rounded-tl-none text-xs text-gray-700 leading-relaxed">
                                        Could you tell me more about your experience with React?
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <div className="bg-gray-50 p-3 rounded-2xl rounded-tr-none text-xs text-gray-700 leading-relaxed text-right">
                                        I have 5 years of experience building scalable apps...
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                    {/* User avatar placeholder */}
                                    <div className="w-full h-full bg-pink-100" />
                                </div>
                            </div>
                            <div className="mt-4 flex justify-center">
                                <div className="bg-red-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full flex items-center gap-2 animate-pulse">
                                    <div className="w-2 h-2 bg-white rounded-full" />
                                    Recording
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="space-y-8 order-1 md:order-2"
                >
                    <div>
                        <h3 className="text-2xl font-bold mb-4">Interview Preparation</h3>
                        <p className="text-gray-600 leading-relaxed mb-6">
                            Once we've secured an interview for you, our AI interview tool helps to ensure
                            you excel no matter what you're faced with on the day. From mock interviews
                            to question-specific guidance, we provide everything you need to make a
                            great impression.
                        </p>
                        <ul className="space-y-2">
                            {["Mock Interviews", "Question Preparation", "Confidence Building"].map((item) => (
                                <li key={item} className="flex items-center gap-2 text-sm font-medium text-gray-800">
                                    <span className="w-1.5 h-1.5 bg-black rounded-full" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
