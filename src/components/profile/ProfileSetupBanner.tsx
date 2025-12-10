"use client";

import Link from "next/link";
import { AlertCircle, User, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileSetupBannerProps {
  completeness: number;
  missingFields: string[];
}

export function ProfileSetupBanner({
  completeness,
  missingFields,
}: ProfileSetupBannerProps) {
  if (completeness >= 80) return null;

  const formatFieldName = (field: string): string => {
    const fieldNames: Record<string, string> = {
      firstName: "First name",
      lastName: "Last name",
      phone: "Phone number",
      city: "City",
      state: "State",
      country: "Country",
      resumeText: "Resume",
      workAuthorization: "Work authorization",
      availability: "Availability",
    };
    return fieldNames[field] || field;
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4 mb-2">
            <h3 className="font-semibold text-amber-800 dark:text-amber-200">
              Complete Your Profile for Auto-Apply
            </h3>
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
              {completeness}% complete
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-amber-200 dark:bg-amber-900 rounded-full h-2 mb-3">
            <div
              className="bg-amber-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${completeness}%` }}
            />
          </div>

          <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
            AI Auto-Apply needs your profile information to fill out job applications.
            {missingFields.length > 0 && (
              <span className="block mt-1">
                Missing: {missingFields.slice(0, 3).map(formatFieldName).join(", ")}
                {missingFields.length > 3 && ` +${missingFields.length - 3} more`}
              </span>
            )}
          </p>

          <Link href="/auto-apply/profile">
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
            >
              <User className="h-4 w-4" />
              Complete Profile
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
