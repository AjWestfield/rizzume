"use client";

import { motion } from "framer-motion";
import { FileText, Clock } from "lucide-react";

const examples = [
    {
        role: "Software Engineer",
        description: "Perfect for developers, programmers, and tech professionals",
        lastUpdated: "2 days ago",
        color: "bg-purple-50 text-purple-600",
        delay: 0,
    },
    {
        role: "Marketing Manager",
        description: "Ideal for marketing professionals and brand strategists",
        lastUpdated: "3 days ago",
        color: "bg-blue-50 text-blue-600",
        delay: 0.1,
    },
    {
        role: "Data Analyst",
        description: "Tailored for data scientists and business analysts",
        lastUpdated: "1 week ago",
        color: "bg-green-50 text-green-600",
        delay: 0.2,
    },
    {
        role: "UX Designer",
        description: "Crafted for designers and user experience professionals",
        lastUpdated: "5 days ago",
        color: "bg-pink-50 text-pink-600",
        delay: 0.3,
    },
    {
        role: "Sales Manager",
        description: "Designed for sales professionals and business development",
        lastUpdated: "4 days ago",
        color: "bg-orange-50 text-orange-600",
        delay: 0.4,
    },
    {
        role: "Project Manager",
        description: "Perfect for project managers and team leaders",
        lastUpdated: "1 day ago",
        color: "bg-indigo-50 text-indigo-600",
        delay: 0.5,
    },
];

export function ResumeExamples() {
    return (
        <section id="examples" className="py-24 bg-gray-50/50">
            <div className="container">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6">
                        Resume Examples That Get Results
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Get inspired by professional resume examples tailored to your industry
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {examples.map((example, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: example.delay }}
                            className="bg-white rounded-3xl p-8 hover:shadow-lg transition-all duration-300 border border-gray-100 group"
                        >
                            {/* Document Preview */}
                            <div className={`aspect-[4/3] rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden ${example.color} bg-opacity-50`}>
                                <div className="w-3/4 h-full bg-white shadow-lg rounded-t-lg mt-8 p-4 relative top-4 transition-transform group-hover:-translate-y-2 duration-500">
                                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                                        <div className="w-16 h-2 bg-gray-200 rounded" />
                                        <div className="w-8 h-8 rounded-full bg-gray-100" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="w-full h-1.5 bg-gray-100 rounded" />
                                        <div className="w-full h-1.5 bg-gray-100 rounded" />
                                        <div className="w-2/3 h-1.5 bg-gray-100 rounded" />
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        <div className="w-10 h-1.5 bg-gray-200 rounded mb-2" />
                                        <div className="w-full h-1.5 bg-gray-100 rounded" />
                                        <div className="w-full h-1.5 bg-gray-100 rounded" />
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{example.role}</h3>
                            <p className="text-gray-600 mb-6 line-clamp-2">
                                {example.description}
                            </p>

                            <div className="flex items-center text-sm text-gray-400 gap-2">
                                <Clock className="w-4 h-4" />
                                <span>Updated {example.lastUpdated}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
