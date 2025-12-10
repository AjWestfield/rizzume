"use client";

import { useState, useEffect } from "react";
import {
  User,
  Link,
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useUserProfile } from "@/hooks/useUserProfile";
import type { StartDateType } from "@/types/user-profile";

interface ProfileSetupWizardProps {
  onComplete?: () => void;
  initialStep?: number;
}

const STEPS = [
  { id: "personal", title: "Personal Info", icon: User },
  { id: "links", title: "Professional Links", icon: Link },
  { id: "authorization", title: "Work Authorization", icon: Briefcase },
  { id: "availability", title: "Availability", icon: Calendar },
  { id: "review", title: "Review", icon: CheckCircle2 },
];

export function ProfileSetupWizard({
  onComplete,
  initialStep = 0,
}: ProfileSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Use the localStorage-based profile hook
  const {
    profile,
    isLoading,
    updatePersonalInfo,
    updateProfessionalLinks,
    updateWorkAuthorization,
    updateAvailability,
  } = useUserProfile();

  // Form state
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    country: "United States",
    zipCode: "",
  });

  const [links, setLinks] = useState({
    linkedinUrl: "",
    portfolioUrl: "",
    githubUrl: "",
  });

  const [workAuth, setWorkAuth] = useState({
    authorizedToWork: true,
    requiresSponsorship: false,
    visaStatus: "",
  });

  const [availability, setAvailability] = useState({
    startDateType: "two_weeks" as StartDateType,
    customStartDate: "",
    noticePeriodWeeks: 2,
  });

  // Load existing profile data
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

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Personal Info
        if (!personalInfo.firstName.trim()) newErrors.firstName = "First name is required";
        if (!personalInfo.lastName.trim()) newErrors.lastName = "Last name is required";
        if (!personalInfo.email.trim()) newErrors.email = "Email is required";
        if (!personalInfo.phone.trim()) newErrors.phone = "Phone number is required";
        if (!personalInfo.city.trim()) newErrors.city = "City is required";
        if (!personalInfo.state.trim()) newErrors.state = "State is required";
        break;
      case 1: // Links (optional, but validate format if provided)
        if (links.linkedinUrl && !links.linkedinUrl.includes("linkedin.com")) {
          newErrors.linkedinUrl = "Please enter a valid LinkedIn URL";
        }
        break;
      case 2: // Work Authorization
        // No required validation, defaults are fine
        break;
      case 3: // Availability
        if (availability.startDateType === "custom" && !availability.customStartDate) {
          newErrors.customStartDate = "Please select a start date";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveCurrentStep = async (): Promise<boolean> => {
    if (!validateStep(currentStep)) return false;

    setIsSaving(true);
    try {
      switch (currentStep) {
        case 0:
          await updatePersonalInfo(personalInfo);
          break;
        case 1:
          await updateProfessionalLinks(links);
          break;
        case 2:
          await updateWorkAuthorization({
            authorizedToWork: workAuth.authorizedToWork,
            requiresSponsorship: workAuth.requiresSponsorship,
            visaStatus: workAuth.visaStatus || undefined,
          });
          break;
        case 3:
          await updateAvailability({
            startDateType: availability.startDateType,
            customStartDate: availability.customStartDate
              ? new Date(availability.customStartDate).getTime()
              : undefined,
            noticePeriodWeeks: availability.noticePeriodWeeks,
          });
          break;
      }
      return true;
    } catch (error) {
      console.error("Error saving step:", error);
      setErrors({ submit: "Failed to save. Please try again." });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    const saved = await saveCurrentStep();
    if (saved && currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    await saveCurrentStep();
    onComplete?.();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={personalInfo.firstName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={personalInfo.lastName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={personalInfo.email}
                onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={personalInfo.phone}
                onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={personalInfo.city}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, city: e.target.value })}
                  className={errors.city ? "border-red-500" : ""}
                />
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={personalInfo.state}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, state: e.target.value })}
                  className={errors.state ? "border-red-500" : ""}
                />
                {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country">Country</Label>
                <Select
                  value={personalInfo.country}
                  onValueChange={(value) => setPersonalInfo({ ...personalInfo, country: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={personalInfo.zipCode}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, zipCode: e.target.value })}
                />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Add your professional links to help employers find and verify your work.
            </p>

            <div>
              <Label htmlFor="linkedin">LinkedIn Profile</Label>
              <Input
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/yourprofile"
                value={links.linkedinUrl}
                onChange={(e) => setLinks({ ...links, linkedinUrl: e.target.value })}
                className={errors.linkedinUrl ? "border-red-500" : ""}
              />
              {errors.linkedinUrl && <p className="text-xs text-red-500 mt-1">{errors.linkedinUrl}</p>}
            </div>

            <div>
              <Label htmlFor="portfolio">Portfolio Website</Label>
              <Input
                id="portfolio"
                type="url"
                placeholder="https://yourportfolio.com"
                value={links.portfolioUrl}
                onChange={(e) => setLinks({ ...links, portfolioUrl: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="github">GitHub Profile</Label>
              <Input
                id="github"
                type="url"
                placeholder="https://github.com/yourusername"
                value={links.githubUrl}
                onChange={(e) => setLinks({ ...links, githubUrl: e.target.value })}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              This information helps match you with jobs you&apos;re eligible for.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="authorizedToWork"
                  checked={workAuth.authorizedToWork}
                  onChange={(e) => setWorkAuth({ ...workAuth, authorizedToWork: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <Label htmlFor="authorizedToWork" className="font-normal">
                  I am authorized to work in the United States
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="requiresSponsorship"
                  checked={workAuth.requiresSponsorship}
                  onChange={(e) => setWorkAuth({ ...workAuth, requiresSponsorship: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <Label htmlFor="requiresSponsorship" className="font-normal">
                  I will require visa sponsorship now or in the future
                </Label>
              </div>
            </div>

            {workAuth.requiresSponsorship && (
              <div>
                <Label htmlFor="visaStatus">Current Visa Status (optional)</Label>
                <Select
                  value={workAuth.visaStatus}
                  onValueChange={(value) => setWorkAuth({ ...workAuth, visaStatus: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your visa status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="f1_opt">F-1 OPT</SelectItem>
                    <SelectItem value="f1_cpt">F-1 CPT</SelectItem>
                    <SelectItem value="h1b">H-1B</SelectItem>
                    <SelectItem value="l1">L-1</SelectItem>
                    <SelectItem value="o1">O-1</SelectItem>
                    <SelectItem value="tn">TN</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Let employers know when you can start.
            </p>

            <div>
              <Label htmlFor="startDate">When can you start?</Label>
              <Select
                value={availability.startDateType}
                onValueChange={(value) => setAvailability({ ...availability, startDateType: value as StartDateType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediately">Immediately</SelectItem>
                  <SelectItem value="two_weeks">In 2 weeks</SelectItem>
                  <SelectItem value="one_month">In 1 month</SelectItem>
                  <SelectItem value="custom">Specific date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {availability.startDateType === "custom" && (
              <div>
                <Label htmlFor="customDate">Start Date</Label>
                <Input
                  id="customDate"
                  type="date"
                  value={availability.customStartDate}
                  onChange={(e) => setAvailability({ ...availability, customStartDate: e.target.value })}
                  className={errors.customStartDate ? "border-red-500" : ""}
                />
                {errors.customStartDate && (
                  <p className="text-xs text-red-500 mt-1">{errors.customStartDate}</p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="noticePeriod">Notice Period (if currently employed)</Label>
              <Select
                value={String(availability.noticePeriodWeeks)}
                onValueChange={(value) => setAvailability({ ...availability, noticePeriodWeeks: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No notice required</SelectItem>
                  <SelectItem value="1">1 week</SelectItem>
                  <SelectItem value="2">2 weeks</SelectItem>
                  <SelectItem value="4">4 weeks</SelectItem>
                  <SelectItem value="8">8 weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Review your profile information before saving.
            </p>

            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-2">Personal Info</h4>
                <div className="text-sm space-y-1">
                  <p><span className="text-slate-500">Name:</span> {personalInfo.firstName} {personalInfo.lastName}</p>
                  <p><span className="text-slate-500">Email:</span> {personalInfo.email}</p>
                  <p><span className="text-slate-500">Phone:</span> {personalInfo.phone}</p>
                  <p><span className="text-slate-500">Location:</span> {personalInfo.city}, {personalInfo.state}</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-2">Professional Links</h4>
                <div className="text-sm space-y-1">
                  {links.linkedinUrl && <p><span className="text-slate-500">LinkedIn:</span> {links.linkedinUrl}</p>}
                  {links.portfolioUrl && <p><span className="text-slate-500">Portfolio:</span> {links.portfolioUrl}</p>}
                  {links.githubUrl && <p><span className="text-slate-500">GitHub:</span> {links.githubUrl}</p>}
                  {!links.linkedinUrl && !links.portfolioUrl && !links.githubUrl && (
                    <p className="text-slate-400 italic">No links provided</p>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-2">Work Authorization</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-slate-500">Authorized to work:</span>{" "}
                    {workAuth.authorizedToWork ? "Yes" : "No"}
                  </p>
                  <p>
                    <span className="text-slate-500">Requires sponsorship:</span>{" "}
                    {workAuth.requiresSponsorship ? "Yes" : "No"}
                  </p>
                  {workAuth.visaStatus && (
                    <p><span className="text-slate-500">Visa status:</span> {workAuth.visaStatus}</p>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-2">Availability</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-slate-500">Start date:</span>{" "}
                    {availability.startDateType === "immediately"
                      ? "Immediately"
                      : availability.startDateType === "two_weeks"
                        ? "In 2 weeks"
                        : availability.startDateType === "one_month"
                          ? "In 1 month"
                          : availability.customStartDate}
                  </p>
                  <p>
                    <span className="text-slate-500">Notice period:</span>{" "}
                    {availability.noticePeriodWeeks === 0
                      ? "No notice required"
                      : `${availability.noticePeriodWeeks} week(s)`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => index < currentStep && setCurrentStep(index)}
                disabled={index > currentStep}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                  isActive && "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
                  isCompleted && "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
                  !isActive && !isCompleted && "text-slate-400"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    isActive && "bg-indigo-500 text-white",
                    isCompleted && "bg-emerald-500 text-white",
                    !isActive && !isCompleted && "bg-slate-200 dark:bg-slate-700"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span className="hidden sm:inline text-sm font-medium">{step.title}</span>
              </button>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "w-8 h-0.5 mx-2",
                    index < currentStep
                      ? "bg-emerald-500"
                      : "bg-slate-200 dark:bg-slate-700"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          {STEPS[currentStep].title}
        </h2>

        {renderStepContent()}

        {errors.submit && (
          <p className="text-sm text-red-500 mt-4">{errors.submit}</p>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={isSaving}
              className="gap-2 bg-indigo-500 hover:bg-indigo-600"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={isSaving}
              className="gap-2 bg-emerald-500 hover:bg-emerald-600"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Complete Setup
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
