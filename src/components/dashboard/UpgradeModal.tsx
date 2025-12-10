"use client";

import { Check, Sparkles, Building2, Layout, Zap, Users } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function UpgradeModal({ children }: { children: React.ReactNode }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-5xl p-0 overflow-hidden bg-white dark:bg-slate-900 border-none sm:rounded-2xl max-h-[90vh] overflow-y-auto">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-8 pt-12 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

                    <DialogTitle className="text-3xl font-bold mb-2 relative z-10 text-white">Land your dream job with Rizzume Pro</DialogTitle>
                    <p className="text-indigo-100 mb-8 relative z-10">Join over 630,000 professionals who transformed their job search with Rizzume</p>

                    <div className="flex flex-wrap justify-center gap-3 relative z-10 mb-8">
                        {[
                            { icon: Sparkles, text: "Unlimited AI resumes" },
                            { icon: Layout, text: "Unlimited AI cover letters" },
                            { icon: Users, text: "AI networking tools" },
                            { icon: Zap, text: "Smart job matching" },
                            { icon: Check, text: "All job boards supported" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium border border-white/20">
                                <item.icon className="h-3 w-3" />
                                {item.text}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pricing Cards Section */}
                <div className="p-8 bg-slate-50/50 dark:bg-slate-950/50">
                    <div className="grid md:grid-cols-3 gap-6 -mt-16 relative z-20">
                        {/* Monthly */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col">
                            <div className="mb-4">
                                <h3 className="font-bold text-lg">Monthly</h3>
                                <p className="text-xs text-slate-500 mt-1">Flexible month to month</p>
                            </div>
                            <div className="mb-6">
                                <span className="text-4xl font-bold">$39</span>
                                <span className="text-slate-500 text-sm"> / month</span>
                            </div>
                            <Button variant="outline" className="w-full mt-auto font-semibold border-slate-300 dark:border-slate-700 hover:bg-slate-50 hover:text-indigo-600">
                                Upgrade
                            </Button>
                        </div>

                        {/* Quarterly */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xl border-2 border-indigo-500 flex flex-col relative transform hover:-translate-y-1 transition-transform duration-200">
                            <div className="absolute -top-3 right-4 bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                                Most Popular - 25% OFF
                            </div>
                            <div className="mb-4">
                                <h3 className="font-bold text-lg text-indigo-600">Quarterly</h3>
                                <p className="text-xs text-slate-500 mt-1">Billed as $87 every 3 months</p>
                            </div>
                            <div className="mb-6">
                                <span className="text-4xl font-bold">$29</span>
                                <span className="text-slate-500 text-sm"> / month</span>
                            </div>
                            <Button className="w-full mt-auto font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                                Upgrade
                            </Button>
                        </div>

                        {/* Annual */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col">
                            <div className="absolute top-4 right-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                                Best Value - 70% OFF
                            </div>
                            <div className="mb-4">
                                <h3 className="font-bold text-lg">Annual</h3>
                                <p className="text-xs text-slate-500 mt-1">Billed as $144, will not auto-renew</p>
                            </div>
                            <div className="mb-6">
                                <span className="text-4xl font-bold">$12</span>
                                <span className="text-slate-500 text-sm"> / month</span>
                            </div>
                            <Button variant="outline" className="w-full mt-auto font-semibold border-slate-300 dark:border-slate-700 hover:bg-slate-50 hover:text-indigo-600">
                                Upgrade
                            </Button>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-12 text-center">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">Trusted by 630,000+ Job Seekers</p>
                        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
                            {/* Simple text logos for now since we don't have SVGs */}
                            <span className="font-bold text-xl text-slate-700 dark:text-slate-300 flex items-center gap-1"><span className="text-rose-500">◆</span> airbnb</span>
                            <span className="font-bold text-xl text-slate-700 dark:text-slate-300">Google</span>
                            <span className="font-bold text-xl text-slate-700 dark:text-slate-300 text-red-600">NETFLIX</span>
                            <span className="font-bold text-xl text-slate-700 dark:text-slate-300 italic font-serif">NIKE</span>
                            <span className="font-bold text-xl text-slate-700 dark:text-slate-300 flex items-center gap-1"><span className="text-green-500">●</span> shopify</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
