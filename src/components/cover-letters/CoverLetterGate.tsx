"use client";

import { useState, useEffect, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ResumeUploadInline } from "./ResumeUploadInline";
import { ProfileCompletionInline } from "./ProfileCompletionInline";

type GateState = "checking" | "needs-resume" | "needs-profile" | "ready";

interface CoverLetterGateProps {
  children: ReactNode;
  onCancel?: () => void;
}

export function CoverLetterGate({ children, onCancel }: CoverLetterGateProps) {
  const { completeness, isLoading: profileLoading } = useUserProfile();
  const [gateState, setGateState] = useState<GateState>("checking");
  const [resumeText, setResumeText] = useState<string | null>(null);

  // Check initial state on mount
  useEffect(() => {
    if (profileLoading) {
      setGateState("checking");
      return;
    }

    // Check resume first
    const storedResume = localStorage.getItem("rizzume_resume_text");
    setResumeText(storedResume);

    if (!storedResume) {
      setGateState("needs-resume");
    } else if (!completeness || completeness.percentage < 100) {
      setGateState("needs-profile");
    } else {
      setGateState("ready");
    }
  }, [profileLoading, completeness]);

  // Handle resume upload completion
  const handleResumeComplete = (text: string) => {
    setResumeText(text);
    // Check if profile is complete after resume upload
    if (!completeness || completeness.percentage < 100) {
      setGateState("needs-profile");
    } else {
      setGateState("ready");
    }
  };

  // Handle profile completion
  const handleProfileComplete = () => {
    setGateState("ready");
  };

  // Loading state
  if (gateState === "checking") {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-4" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Checking your profile...
        </p>
      </div>
    );
  }

  // Resume upload needed
  if (gateState === "needs-resume") {
    return (
      <ResumeUploadInline
        onComplete={handleResumeComplete}
        onCancel={onCancel}
      />
    );
  }

  // Profile completion needed
  if (gateState === "needs-profile") {
    return (
      <ProfileCompletionInline
        onComplete={handleProfileComplete}
        onCancel={onCancel}
      />
    );
  }

  // Ready - render children (generation form)
  return <>{children}</>;
}

// Export a hook for components that need to check gate status without rendering the gate UI
export function useCoverLetterGateStatus() {
  const { completeness, isLoading: profileLoading } = useUserProfile();
  const [status, setStatus] = useState<{
    isReady: boolean;
    isLoading: boolean;
    needsResume: boolean;
    needsProfile: boolean;
  }>({
    isReady: false,
    isLoading: true,
    needsResume: false,
    needsProfile: false,
  });

  useEffect(() => {
    if (profileLoading) {
      setStatus({
        isReady: false,
        isLoading: true,
        needsResume: false,
        needsProfile: false,
      });
      return;
    }

    const storedResume = localStorage.getItem("rizzume_resume_text");
    const hasResume = !!storedResume;
    const hasProfile = completeness && completeness.percentage >= 100;

    setStatus({
      isReady: hasResume && !!hasProfile,
      isLoading: false,
      needsResume: !hasResume,
      needsProfile: hasResume && !hasProfile,
    });
  }, [profileLoading, completeness]);

  return status;
}
