"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function AutoApplyCTA() {
    return (
        <section className="py-24 bg-white text-center">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto space-y-8">
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900">
                        Stop Searching.
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                            Start Interviewing.
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Join 1,000,000+ job seekers who are saving 20+ hours per week and getting hired faster with Rizzume.
                    </p>
                    <div>
                        <Link href="/dashboard/auto-apply">
                            <Button size="lg" className="bg-[#6366f1] hover:bg-[#5558e6] text-white rounded-full px-10 py-7 text-xl font-semibold shadow-xl shadow-indigo-200 transition-all hover:scale-105 group">
                                Start Auto Applying
                                <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                    <p className="text-sm text-gray-500">
                        No credit card required • Cancel anytime
                    </p>
                </div>
            </div>
        </section>
    );
}
