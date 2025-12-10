"use client";

import { motion } from "framer-motion";

export function AutoApplyBenefits() {
    return (
        <section className="py-24 bg-gray-50">
            <div className="container mx-auto px-4 text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Benefits of Auto Apply</h2>
            </div>

            <div className="container mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
                {/* Left Side */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="space-y-8"
                >
                    <div>
                        <h3 className="text-2xl font-bold mb-4">Hassle-Free Job Applications</h3>
                        <p className="text-gray-600 leading-relaxed mb-6">
                            Forget the tedious and time-consuming task of job hunting. With Auto Apply,
                            we handle the job application process from start to finish in just one click. Just
                            provide us with your preferences and credentials, and we'll do the rest,
                            applying to tailored jobs per week that match your career aspirations.
                        </p>
                        <ul className="space-y-2">
                            {["Time-Saving", "Stress Reduction", "Tailored Job Matches"].map((item) => (
                                <li key={item} className="flex items-center gap-2 text-sm font-medium text-gray-800">
                                    <span className="w-1.5 h-1.5 bg-black rounded-full" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>

                {/* Right Side - Image/Visual */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-orange-400 to-purple-600 h-[300px] md:h-[400px]"
                >
                    {/* Placeholder for the keyboard visual */}
                    <div className="absolute inset-0 bg-[url('/keyboard-placeholder.png')] bg-cover opacity-50 mix-blend-overlay" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        {/* Abstract visual if no image available */}
                        <div className="text-white text-opacity-50 font-bold text-9xl tracking-widest">+</div>
                    </div>
                </motion.div>
            </div>


            <div className="container mx-auto px-4 grid md:grid-cols-2 gap-16 items-center mt-24">
                {/* Left Side (Visual reversed on desktop for variety, but following screenshot order) */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-orange-400 to-purple-600 h-[300px] md:h-[400px] order-2 md:order-1"
                >
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                            <div className="absolute w-[300px] h-[300px] border border-white/20 rounded-full animate-pulse" />
                            <div className="bg-white px-6 py-3 rounded-xl shadow-xl">
                                <div className="text-xs text-gray-500 font-bold uppercase mb-1">Skill Match</div>
                                <div className="text-2xl font-bold text-green-500">95%</div>
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
                        <h3 className="text-2xl font-bold mb-4">Expert Market Scanning</h3>
                        <p className="text-gray-600 leading-relaxed mb-6">
                            Our specialized algorithms scan job postings to find opportunities that best
                            suit your skills and career goals. We ensure that no promising position passes
                            you by, increasing your chances of landing your dream job faster.
                        </p>
                        <ul className="space-y-2">
                            {["Advanced Scanning Technology", "Find More Jobs Suited to Your Needs", "Boost Your Chances of Landing Your Ideal Position"].map((item) => (
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
