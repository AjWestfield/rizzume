"use client";

import { motion } from "framer-motion";

export function AutoApplyDemo() {
    return (
        <section className="py-10 bg-gray-50/50">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 max-w-5xl mx-auto"
                >
                    {/* Fake Header */}
                    <div className="px-8 py-8 border-b border-gray-100 flex justify-between items-center">
                        <div className="flex gap-8">
                            <div>
                                <div className="text-sm text-gray-500 mb-1">Status</div>
                                <div className="text-xl font-bold text-gray-900">Applying</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 mb-1">Jobs</div>
                                <div className="text-xl font-bold text-gray-900">42/500</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 mb-1">Updated</div>
                                <div className="text-xl font-bold text-gray-900">5 seconds ago</div>
                            </div>
                        </div>
                    </div>

                    {/* Fake Table */}
                    <div className="px-8 py-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold">Jobs</h3>
                            <div className="flex gap-4 text-sm text-gray-500">
                                <span>Status</span>
                                <span>Date</span>
                                <span>Sort</span>
                            </div>
                        </div>

                        <div className="space-y-0">
                            {/* Header Row */}
                            <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
                                <div className="col-span-3">Company Name</div>
                                <div className="col-span-2">Status</div>
                                <div className="col-span-2">Updated At</div>
                                <div className="col-span-3">Job Posting</div>
                                <div className="col-span-2">Action</div>
                            </div>

                            {/* Row 1 */}
                            {[
                                { company: "SpaceX", status: "Waiting", time: "Just now", role: "UX Designer", match: 95 },
                                { company: "SpaceX", status: "Waiting", time: "Just now", role: "UX Designer", match: 95 },
                                { company: "Netflix", status: "Applied", time: "2 hours ago", role: "Senior Product Manager", match: 95, success: true },
                                { company: "Airbnb", status: "Waiting", time: "2 days ago", role: "UX Design Lead", match: 94 },
                                { company: "Meta", status: "Applied", time: "3 days ago", role: "Technical Program Manager", match: 91, manual: true },
                                { company: "Google", status: "Waiting", time: "5 days ago", role: "Staff Software Engineer", match: 96 },
                            ].map((row, i) => (
                                <div key={i} className="grid grid-cols-12 gap-4 items-center py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors px-2 rounded-lg">
                                    <div className="col-span-3 font-semibold text-gray-900">{row.company}</div>
                                    <div className="col-span-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${row.status === 'Applied' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                                            {row.status}
                                        </span>
                                    </div>
                                    <div className="col-span-2 text-sm text-gray-500">{row.time}</div>
                                    <div className="col-span-3 text-sm font-medium text-gray-900">{row.role}</div>
                                    <div className="col-span-2 flex items-center gap-2">
                                        <span className="text-green-600 text-xs font-bold">{row.match}% Perfect fit</span>
                                        {row.manual && (
                                            <div className="flex gap-2">
                                                <button className="bg-red-50 text-red-600 text-[10px] px-2 py-0.5 rounded">Reject</button>
                                                <button className="bg-green-50 text-green-600 text-[10px] px-2 py-0.5 rounded">Approve</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
