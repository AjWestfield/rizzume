"use client";

import { Button } from "@/components/ui/button";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { Mail, Linkedin, ArrowRight } from "lucide-react";
import { GradientBackground } from "@/components/ui/GradientBackground";

export default function NetworkPage() {
    const contacts = [
        { name: "Alice Smith", role: "Senior Software Engineer", location: "San Francisco, CA, USA", email: "alice.smith@example.com" },
        { name: "Bob Johnson", role: "Marketing Manager", location: "Toronto, ON, Canada", email: "bob.johnson@example.com" },
        { name: "Charlie Brown", role: "Founder & CEO", location: "London, England, UK", email: "charlie.brown@example.com" },
    ];

    return (
        <div className="min-h-screen font-sans relative">
            <GradientBackground />
            <DashboardNavbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        Networking
                    </h1>
                </div>

                <div className="flex gap-8 border-b mb-8 overflow-x-auto">
                    {["Contacts", "Messages", "Saved Templates"].map((tab, i) => (
                        <button
                            key={tab}
                            className={`pb-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${i === 0 ? "text-indigo-600 border-indigo-600" : "text-slate-500 border-transparent hover:text-slate-700"}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    {/* Header Row */}
                    <div className="grid grid-cols-4 gap-4 p-4 border-b bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <div>Name</div>
                        <div>Title</div>
                        <div>Location</div>
                        <div>Email</div>
                    </div>

                    {/* Mock Rows */}
                    <div className="divide-y relative min-h-[300px]">
                        {/* Upgrade Overlay */}
                        <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-8">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20 px-8 py-6 text-lg h-auto">
                                Find New Contacts
                            </Button>
                        </div>

                        {contacts.map((contact, i) => (
                            <div key={i} className="grid grid-cols-4 gap-4 p-4 items-center text-sm text-slate-900 dark:text-slate-100 filter blur-[3px]">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">{contact.name[0]}</div>
                                    <span className="font-medium">{contact.name}</span>
                                </div>
                                <div className="text-slate-500">{contact.role}</div>
                                <div className="text-slate-500">{contact.location}</div>
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Mail className="h-4 w-4" />
                                    {contact.email}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
