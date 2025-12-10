"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { TrackedJobCard } from "@/components/jobs/TrackedJobCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Id } from "../../../convex/_generated/dataModel";
import { useUserProfile } from "@/hooks/useUserProfile";
import { GradientBackground } from "@/components/ui/GradientBackground";

export default function TrackJobsPage() {
    const [searchQuery, setSearchQuery] = useState("");

    // Get user context
    const { userId: email } = useUserProfile();
    const user = useQuery(api.users.getUserByEmail, email ? { email } : "skip");
    const userId = user?._id;

    // Fetch data (conditional on userId)
    const savedJobs = useQuery(api.jobs.getQueue, userId ? { status: "saved", userId } : "skip");
    const allApplications = useQuery(api.applications.getApplications, userId ? { userId } : "skip");

    // Mutations
    const updateJobStatus = useMutation(api.jobs.updateJobStatus);
    const removeJob = useMutation(api.jobs.removeFromQueue);
    const recordApplication = useMutation(api.applications.recordApplication);
    const updateApplicationStatus = useMutation(api.applications.updateStatus);

    // Derive filtered lists
    const appliedJobs = allApplications?.filter(app =>
        ["applied", "viewed"].includes(app.status)
    ) || [];

    const interviewingJobs = allApplications?.filter(app =>
        ["screening", "interviewing", "offer"].includes(app.status)
    ) || [];

    const closedJobs = allApplications?.filter(app =>
        ["rejected", "withdrawn", "no_response"].includes(app.status)
    ) || [];

    // Filter by search query
    const filterBySearch = (items: any[]) => {
        if (!searchQuery) return items || [];
        const lowerQ = searchQuery.toLowerCase();
        return (items || []).filter(item =>
            (item.jobTitle || item.title || "").toLowerCase().includes(lowerQ) ||
            (item.company || "").toLowerCase().includes(lowerQ)
        );
    };

    const handleSavedToApplied = async (job: any) => {
        if (!userId) return;

        // When moving from saved to applied, we need to:
        // 1. Update jobQueue status to 'applied'
        // 2. Create application record

        await updateJobStatus({
            jobQueueId: job._id,
            status: "applied"
        });

        await recordApplication({
            userId,
            jobQueueId: job._id,
            jobId: job.jobId,
            jobTitle: job.jobTitle,
            company: job.company,
            location: job.location,
            applyLink: job.applyLink,
            source: job.source,
            applicationMethod: "manual", // Assumed manual since they clicked generic "Mark as Applied"
        });
    };

    const handleApplicationStatusChange = async (appId: Id<"applications">, status: string) => {
        await updateApplicationStatus({
            applicationId: appId,
            status: status as any
        });
    };

    const handleDeleteSaved = async (id: Id<"jobQueue">) => {
        await removeJob({ jobQueueId: id });
    };

    return (
        <div className="min-h-screen font-sans relative">
            <GradientBackground />
            <DashboardNavbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        Job Tracker
                    </h1>
                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                className="pl-9"
                                placeholder="Search tracked jobs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 whitespace-nowrap" asChild>
                            <a href="/find-jobs">
                                <Plus className="h-4 w-4" />
                                Add Job
                            </a>
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="saved" className="space-y-6">
                    <TabsList className="bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 h-auto w-full md:w-auto flex overflow-x-auto">
                        <TabsTrigger value="saved" className="px-6 py-2.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 dark:data-[state=active]:bg-indigo-950/30 dark:data-[state=active]:text-indigo-400">
                            Saved ({savedJobs?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="applied" className="px-6 py-2.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                            Applied ({appliedJobs.length})
                        </TabsTrigger>
                        <TabsTrigger value="interviewing" className="px-6 py-2.5 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600">
                            Interviewing ({interviewingJobs.length})
                        </TabsTrigger>
                        <TabsTrigger value="closed" className="px-6 py-2.5 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-600">
                            Closed ({closedJobs.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="saved" className="space-y-4">
                        {savedJobs === undefined ? (
                            <p className="text-center text-slate-500 py-10">Loading...</p>
                        ) : filterBySearch(savedJobs).length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                <p className="text-slate-600 dark:text-slate-400 mb-2">
                                    No saved jobs found.
                                </p>
                                <Button variant="link" className="text-indigo-600" asChild>
                                    <a href="/find-jobs">Find jobs to save</a>
                                </Button>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {filterBySearch(savedJobs).map((job) => (
                                    <TrackedJobCard
                                        key={job._id}
                                        id={job._id}
                                        title={job.jobTitle}
                                        company={job.company}
                                        location={job.location}
                                        salary={job.salary}
                                        remote={job.remote}
                                        date={job.discoveredAt}
                                        status={job.status}
                                        type="saved"
                                        onStatusChange={(status) => {
                                            if (status === "applied") handleSavedToApplied(job);
                                        }}
                                        onDelete={() => handleDeleteSaved(job._id)}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="applied" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filterBySearch(appliedJobs).map((app) => (
                                <TrackedJobCard
                                    key={app._id}
                                    id={app._id}
                                    title={app.jobTitle}
                                    company={app.company}
                                    location={app.location}
                                    date={app.appliedAt}
                                    status={app.status}
                                    type="application"
                                    onStatusChange={(status) => handleApplicationStatusChange(app._id, status)}
                                />
                            ))}
                        </div>
                        {filterBySearch(appliedJobs).length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                <p className="text-slate-600 dark:text-slate-400 mb-2">
                                    No active applications.
                                </p>
                                <Button variant="link" className="text-indigo-600" asChild>
                                    <a href="/find-jobs">Apply to jobs</a>
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="interviewing" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filterBySearch(interviewingJobs).map((app) => (
                                <TrackedJobCard
                                    key={app._id}
                                    id={app._id}
                                    title={app.jobTitle}
                                    company={app.company}
                                    location={app.location}
                                    date={app.appliedAt}
                                    status={app.status}
                                    type="application"
                                    onStatusChange={(status) => handleApplicationStatusChange(app._id, status)}
                                />
                            ))}
                        </div>
                        {filterBySearch(interviewingJobs).length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                <p className="text-slate-600 dark:text-slate-400">
                                    No interviews scheduled yet.
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="closed" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filterBySearch(closedJobs).map((app) => (
                                <TrackedJobCard
                                    key={app._id}
                                    id={app._id}
                                    title={app.jobTitle}
                                    company={app.company}
                                    location={app.location}
                                    date={app.appliedAt}
                                    status={app.status}
                                    type="application"
                                />
                            ))}
                        </div>
                        {filterBySearch(closedJobs).length === 0 && (
                            <p className="text-center text-slate-500 py-10">No closed jobs to show.</p>
                        )}
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}

