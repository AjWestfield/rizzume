"use client";

import { FileText, Sparkles, Target, Download, Clock, ShieldCheck } from "lucide-react";

export function FeatureGrid() {
    const features = [
        {
            icon: FileText,
            title: "Smart Templates",
            description: "Choose from professionally designed templates that are both ATS-friendly and visually appealing.",
            color: "text-blue-600",
            bg: "bg-blue-100 dark:bg-blue-900/30",
        },
        {
            icon: Sparkles,
            title: "AI Writing Assistant",
            description: "Generate compelling content tailored to your experience and the job you're applying for.",
            color: "text-purple-600",
            bg: "bg-purple-100 dark:bg-purple-900/30",
        },
        {
            icon: Target,
            title: "Keyword Optimization",
            description: "Automatically optimize your resume with relevant keywords to pass ATS filters.",
            color: "text-indigo-600",
            bg: "bg-indigo-100 dark:bg-indigo-900/30",
        },
        {
            icon: Download,
            title: "Multiple Formats",
            description: "Export your resume in PDF, Word, or plain text format based on your needs.",
            color: "text-fuchsia-600",
            bg: "bg-fuchsia-100 dark:bg-fuchsia-900/30",
        },
        {
            icon: Clock,
            title: "Version History",
            description: "Keep track of all your resume versions and easily revert to previous versions.",
            color: "text-amber-600",
            bg: "bg-amber-100 dark:bg-amber-900/30",
        },
        {
            icon: ShieldCheck,
            title: "Privacy First",
            description: "Your data is encrypted and secure. We never share your information without permission.",
            color: "text-emerald-600",
            bg: "bg-emerald-100 dark:bg-emerald-900/30",
        },
    ];

    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-950">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                        Features That Make Your Resume Stand Out
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Everything you need to create a winning resume
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                        <div
                            key={i}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 dark:border-slate-800"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${feature.bg}`}>
                                <feature.icon className={`w-6 h-6 ${feature.color}`} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
