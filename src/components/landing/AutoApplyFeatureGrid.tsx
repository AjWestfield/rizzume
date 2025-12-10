"use client";

import { motion } from "framer-motion";
import { FileText, Mail, Rocket, User, Mic, Languages } from "lucide-react";

const features = [
    {
        icon: FileText,
        title: "AI-Powered Resume Creator",
        description: "Streamline your job search with our AI-driven resume builder. It customizes your resume for each application.",
        color: "text-purple-600",
        bg: "bg-purple-100"
    },
    {
        icon: Mail,
        title: "Intelligent Cover Letter Generator",
        description: "Our AI generates personalized cover letters for each job application, helping you stand out.",
        color: "text-indigo-600",
        bg: "bg-indigo-100"
    },
    {
        icon: Rocket,
        title: "Automated Job Applications",
        description: "Let our AI automatically apply to thousands of job opportunities to save you valuable time.",
        color: "text-pink-600",
        bg: "bg-pink-100"
    },
    {
        icon: User,
        title: "AI Interview Simulator",
        description: "Prepare for job interviews with AI-generated simulations that provide feedback and help you build confidence.",
        color: "text-blue-600",
        bg: "bg-blue-100"
    },
    {
        icon: Mic,
        title: "Real-Time Interview Assistance",
        description: "Receive instant feedback and support during interviews with our AI-powered Interview Buddy.",
        color: "text-orange-600",
        bg: "bg-orange-100"
    },
    {
        icon: Languages,
        title: "Resume Translator",
        description: "Automatically translate your resume into multiple languages, expanding your job search globally.",
        color: "text-green-600",
        bg: "bg-green-100"
    }
];

export function AutoApplyFeatureGrid() {
    return (
        <section className="py-24 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                        You are 80% More Likely to Secure a Job with Auto Apply
                    </h2>
                    <p className="text-xl text-gray-500">
                        Leverage Our Cutting-Edge AI Tools Designed Specifically for Job Seekers
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.bg}`}>
                                <feature.icon className={`w-7 h-7 ${feature.color}`} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
