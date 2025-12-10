"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import {
    AutoApplyHero,
    AutoApplyDemo,
    AutoApplyBenefits,
    AutoApplyFeatures,
    AutoApplyFeatureGrid,
    AutoApplyCTA
} from "@/components/landing";

export default function AutoApplyMarketingPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <main>
                <AutoApplyHero />
                <AutoApplyDemo />
                <AutoApplyBenefits />
                <AutoApplyFeatures />
                <AutoApplyFeatureGrid />
                <AutoApplyCTA />
            </main>
            <Footer />
        </div>
    );
}
