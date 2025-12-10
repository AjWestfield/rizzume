"use client";

import { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { BuilderHero } from "@/components/resume-builder/BuilderHero";
import { ResumeBuilder } from "@/components/resume-builder/ResumeBuilder";
import { FeatureGrid } from "@/components/resume-builder/FeatureGrid";
import { initialResumeData, ResumeData } from "@/lib/resume-builder/types";
import { GradientBackground } from "@/components/ui/GradientBackground";

export default function ResumeBuilderPage() {
    const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);

    return (
        <div className="min-h-screen font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/30 relative">
            <GradientBackground />
            <Navbar />

            <main>
                <BuilderHero />

                <div className="relative z-10 -mt-20 mb-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <ResumeBuilder
                            data={resumeData}
                            onChange={setResumeData}
                        />
                    </div>
                </div>

                <FeatureGrid />
            </main>

            <Footer />
        </div>
    );
}
