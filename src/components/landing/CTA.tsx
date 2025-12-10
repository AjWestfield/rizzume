"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function CTA() {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-100 rounded-full blur-[128px] opacity-50 pointer-events-none" />

            <div className="container relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6"
                    >
                        Stop applying. <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Start interviewing.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
                    >
                        Join 1,005,991+ job seekers who are getting hired 3x faster with Rizzume's AI-powered application tools.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col items-center gap-4"
                    >
                        <Link href="/signup">
                            <Button className="h-14 px-8 text-lg font-semibold rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-[0_4px_14px_0_rgba(124,58,237,0.39)] transition-all hover:shadow-[0_6px_20px_rgba(124,58,237,0.23)] hover:-translate-y-[1px]">
                                Start now for free <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <p className="text-sm text-gray-500 font-medium">
                            No credit card required
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
