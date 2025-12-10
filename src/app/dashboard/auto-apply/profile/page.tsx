"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { ProfileSetupWizard } from "@/components/profile/ProfileSetupWizard";
import { useUserProfile } from "@/hooks/useUserProfile";
import Link from "next/link";

export default function ProfileSetupPage() {
  const router = useRouter();
  const { isLoading, resetProfile, profile } = useUserProfile();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    resetProfile();
    setShowResetConfirm(false);
    // Force page refresh to clear wizard state
    window.location.reload();
  };

  const handleComplete = () => {
    router.push("/auto-apply");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
        <DashboardNavbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <Sparkles className="h-12 w-12 text-indigo-500 animate-spin" />
              <p className="text-slate-500">Loading profile...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      <DashboardNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/auto-apply">
            <Button variant="ghost" className="mb-4 gap-2 text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" />
              Back to Auto-Apply
            </Button>
          </Link>

          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-indigo-500" />
              Setup Your Profile
            </h1>
            {profile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowResetConfirm(true)}
                className="text-slate-500 hover:text-red-600"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Profile
              </Button>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Complete your profile so AI can automatically fill out job applications for you.
          </p>
        </div>

        {/* Reset Confirmation Dialog */}
        {showResetConfirm && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">
              Reset Profile?
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
              This will clear all your saved profile data. You&apos;ll need to enter your information again.
            </p>
            <div className="flex gap-3">
              <Button
                size="sm"
                variant="destructive"
                onClick={handleReset}
              >
                Yes, Reset
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Wizard */}
        <ProfileSetupWizard onComplete={handleComplete} />
      </main>
    </div>
  );
}
