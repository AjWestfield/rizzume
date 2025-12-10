"use client";

import { useState, useEffect, useMemo } from "react";
import {
  User,
  Link,
  Briefcase,
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  PersonalInfoForm,
  ProfessionalLinksForm,
  WorkAuthorizationForm,
  AvailabilityForm,
  PersonalInfoValues,
  ProfessionalLinksValues,
  WorkAuthValues,
  AvailabilityValues,
  defaultPersonalInfo,
  defaultProfessionalLinks,
  defaultWorkAuth,
  defaultAvailability,
  validatePersonalInfo,
  validateProfessionalLinks,
  validateAvailability,
} from "@/components/profile/ProfileStepForms";

interface ProfileCompletionInlineProps {
  onComplete: () => void;
  onCancel?: () => void;
}

interface StepConfig {
  id: string;
  title: string;
  icon: typeof User;
  description: string;
}

const STEPS: StepConfig[] = [
  {
    id: "personalInfo",
    title: "Personal Information",
    icon: User,
    description: "Name, email, phone, and location",
  },
  {
    id: "professionalLinks",
    title: "Professional Links",
    icon: Link,
    description: "LinkedIn, portfolio, and GitHub",
  },
  {
    id: "workAuthorization",
    title: "Work Authorization",
    icon: Briefcase,
    description: "Work eligibility status",
  },
  {
    id: "availability",
    title: "Availability",
    icon: Calendar,
    description: "Start date and notice period",
  },
];

export function ProfileCompletionInline({
  onComplete,
  onCancel,
}: ProfileCompletionInlineProps) {
  const {
    profile,
    completeness,
    isLoading,
    updatePersonalInfo,
    updateProfessionalLinks,
    updateWorkAuthorization,
    updateAvailability,
  } = useUserProfile();

  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form states
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoValues>(defaultPersonalInfo);
  const [links, setLinks] = useState<ProfessionalLinksValues>(defaultProfessionalLinks);
  const [workAuth, setWorkAuth] = useState<WorkAuthValues>(defaultWorkAuth);
  const [availability, setAvailability] = useState<AvailabilityValues>(defaultAvailability);

  // Load profile data into form states
  useEffect(() => {
    if (profile) {
      setPersonalInfo({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        city: profile.city || "",
        state: profile.state || "",
        country: profile.country || "United States",
        zipCode: profile.zipCode || "",
      });

      setLinks({
        linkedinUrl: profile.linkedinUrl || "",
        portfolioUrl: profile.portfolioUrl || "",
        githubUrl: profile.githubUrl || "",
      });

      setWorkAuth({
        authorizedToWork: profile.workAuthorization?.authorizedToWork ?? true,
        requiresSponsorship: profile.workAuthorization?.requiresSponsorship ?? false,
        visaStatus: profile.workAuthorization?.visaStatus || "",
      });

      setAvailability({
        startDateType: profile.availability?.startDateType || "two_weeks",
        customStartDate: profile.availability?.customStartDate
          ? new Date(profile.availability.customStartDate).toISOString().split("T")[0]
          : "",
        noticePeriodWeeks: profile.availability?.noticePeriodWeeks || 2,
      });
    }
  }, [profile]);

  // Determine which steps are complete
  const stepStatus = useMemo(() => {
    const completedFields = completeness?.completedFields || [];
    return {
      personalInfo: completedFields.includes("personalInfo"),
      professionalLinks: completedFields.includes("professionalLinks"),
      workAuthorization: completedFields.includes("workAuthorization"),
      availability: completedFields.includes("availability"),
    };
  }, [completeness]);

  // Auto-expand first incomplete step
  useEffect(() => {
    if (!expandedStep && !isLoading) {
      const firstIncomplete = STEPS.find((step) => !stepStatus[step.id as keyof typeof stepStatus]);
      if (firstIncomplete) {
        setExpandedStep(firstIncomplete.id);
      }
    }
  }, [stepStatus, expandedStep, isLoading]);

  // Check if all steps are complete
  useEffect(() => {
    if (completeness?.percentage === 100) {
      onComplete();
    }
  }, [completeness, onComplete]);

  const handleSkipStep = async (stepId: string) => {
    setIsSaving(true);
    setErrors({});

    try {
      // Mark professional links as skipped
      if (stepId === "professionalLinks") {
        await updateProfessionalLinks({
          linkedinUrl: links.linkedinUrl || "",
          portfolioUrl: links.portfolioUrl || "",
          githubUrl: links.githubUrl || "",
          professionalLinksSkipped: true,
        });
      }

      // Check if all OTHER steps are already complete
      // If so, we just completed the profile by skipping
      const otherStepsComplete =
        stepStatus.personalInfo &&
        stepStatus.workAuthorization &&
        stepStatus.availability;

      if (otherStepsComplete) {
        // Profile is now complete, close the panel and notify
        setExpandedStep(null);
        // Small delay to allow state to update, then call onComplete
        setTimeout(() => {
          onComplete();
        }, 100);
      } else {
        // Find next incomplete step
        const currentIndex = STEPS.findIndex((s) => s.id === stepId);
        const nextIncomplete = STEPS.slice(currentIndex + 1).find(
          (step) => !stepStatus[step.id as keyof typeof stepStatus]
        );

        if (nextIncomplete) {
          setExpandedStep(nextIncomplete.id);
        } else {
          setExpandedStep(null);
        }
      }
    } catch (error) {
      console.error("Error skipping step:", error);
      setErrors({ submit: "Failed to skip. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveStep = async (stepId: string) => {
    setIsSaving(true);
    setErrors({});

    try {
      let validationErrors: Record<string, string> = {};

      switch (stepId) {
        case "personalInfo":
          validationErrors = validatePersonalInfo(personalInfo);
          if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setIsSaving(false);
            return;
          }
          await updatePersonalInfo(personalInfo);
          break;

        case "professionalLinks":
          validationErrors = validateProfessionalLinks(links);
          if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setIsSaving(false);
            return;
          }
          await updateProfessionalLinks(links);
          break;

        case "workAuthorization":
          await updateWorkAuthorization({
            authorizedToWork: workAuth.authorizedToWork,
            requiresSponsorship: workAuth.requiresSponsorship,
            visaStatus: workAuth.visaStatus || undefined,
          });
          break;

        case "availability":
          validationErrors = validateAvailability(availability);
          if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setIsSaving(false);
            return;
          }
          await updateAvailability({
            startDateType: availability.startDateType,
            customStartDate: availability.customStartDate
              ? new Date(availability.customStartDate).getTime()
              : undefined,
            noticePeriodWeeks: availability.noticePeriodWeeks,
          });
          break;
      }

      // Find next incomplete step
      const currentIndex = STEPS.findIndex((s) => s.id === stepId);
      const nextIncomplete = STEPS.slice(currentIndex + 1).find(
        (step) => !stepStatus[step.id as keyof typeof stepStatus]
      );

      if (nextIncomplete) {
        setExpandedStep(nextIncomplete.id);
      } else {
        setExpandedStep(null);
      }
    } catch (error) {
      console.error("Error saving step:", error);
      setErrors({ submit: "Failed to save. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const renderStepContent = (stepId: string) => {
    switch (stepId) {
      case "personalInfo":
        return (
          <PersonalInfoForm
            values={personalInfo}
            onChange={setPersonalInfo}
            errors={errors}
          />
        );
      case "professionalLinks":
        return (
          <ProfessionalLinksForm
            values={links}
            onChange={setLinks}
            errors={errors}
          />
        );
      case "workAuthorization":
        return (
          <WorkAuthorizationForm
            values={workAuth}
            onChange={setWorkAuth}
            errors={errors}
          />
        );
      case "availability":
        return (
          <AvailabilityForm
            values={availability}
            onChange={setAvailability}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Progress */}
      <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-medium text-amber-900 dark:text-amber-100">
            Complete Your Profile
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Fill in the sections below to generate cover letters.
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-amber-900 dark:text-amber-100">
            {completeness?.percentage || 0}%
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={completeness?.percentage || 0} className="h-2" />

      {/* Steps Accordion */}
      <div className="space-y-2">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isComplete = stepStatus[step.id as keyof typeof stepStatus];
          const isExpanded = expandedStep === step.id;

          return (
            <div
              key={step.id}
              className={cn(
                "border rounded-xl overflow-hidden transition-colors",
                isComplete
                  ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10"
                  : "border-slate-200 dark:border-slate-700"
              )}
            >
              {/* Step Header */}
              <button
                onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-4 text-left transition-colors",
                  "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                )}
              >
                <div
                  className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    isComplete
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  )}
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "font-medium",
                      isComplete
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-slate-900 dark:text-slate-100"
                    )}
                  >
                    {step.title}
                  </p>
                  <p
                    className={cn(
                      "text-sm truncate",
                      isComplete
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-slate-500 dark:text-slate-400"
                    )}
                  >
                    {isComplete ? "Completed" : step.description}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Step Content */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                  {renderStepContent(step.id)}

                  {errors.submit && (
                    <p className="text-sm text-red-500 mt-4">{errors.submit}</p>
                  )}

                  <div className="flex justify-end gap-2 mt-4">
                    {step.id === "professionalLinks" && !isComplete && (
                      <Button
                        variant="ghost"
                        onClick={() => handleSkipStep(step.id)}
                        disabled={isSaving}
                      >
                        Skip
                      </Button>
                    )}
                    <Button
                      onClick={() => handleSaveStep(step.id)}
                      disabled={isSaving}
                      className="bg-indigo-500 hover:bg-indigo-600"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {isComplete ? "Update" : "Save & Continue"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cancel Button */}
      {onCancel && (
        <div className="flex justify-end pt-2">
          <Button variant="ghost" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
