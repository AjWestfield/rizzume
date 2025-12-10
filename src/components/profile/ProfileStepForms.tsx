"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StartDateType } from "@/types/user-profile";

// Type definitions for form props
export interface PersonalInfoValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface ProfessionalLinksValues {
  linkedinUrl: string;
  portfolioUrl: string;
  githubUrl: string;
}

export interface WorkAuthValues {
  authorizedToWork: boolean;
  requiresSponsorship: boolean;
  visaStatus: string;
}

export interface AvailabilityValues {
  startDateType: StartDateType;
  customStartDate: string;
  noticePeriodWeeks: number;
}

interface FormProps<T> {
  values: T;
  onChange: (values: T) => void;
  errors?: Record<string, string>;
}

// Personal Info Form
export function PersonalInfoForm({
  values,
  onChange,
  errors = {},
}: FormProps<PersonalInfoValues>) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={values.firstName}
            onChange={(e) => onChange({ ...values, firstName: e.target.value })}
            className={errors.firstName ? "border-red-500" : ""}
          />
          {errors.firstName && (
            <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
          )}
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={values.lastName}
            onChange={(e) => onChange({ ...values, lastName: e.target.value })}
            className={errors.lastName ? "border-red-500" : ""}
          />
          {errors.lastName && (
            <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={values.email}
          onChange={(e) => onChange({ ...values, email: e.target.value })}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && (
          <p className="text-xs text-red-500 mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={values.phone}
          onChange={(e) => onChange({ ...values, phone: e.target.value })}
          className={errors.phone ? "border-red-500" : ""}
        />
        {errors.phone && (
          <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={values.city}
            onChange={(e) => onChange({ ...values, city: e.target.value })}
            className={errors.city ? "border-red-500" : ""}
          />
          {errors.city && (
            <p className="text-xs text-red-500 mt-1">{errors.city}</p>
          )}
        </div>
        <div>
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            value={values.state}
            onChange={(e) => onChange({ ...values, state: e.target.value })}
            className={errors.state ? "border-red-500" : ""}
          />
          {errors.state && (
            <p className="text-xs text-red-500 mt-1">{errors.state}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="country">Country</Label>
          <Select
            value={values.country}
            onValueChange={(value) => onChange({ ...values, country: value })}
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
            value={values.zipCode}
            onChange={(e) => onChange({ ...values, zipCode: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

// Professional Links Form
export function ProfessionalLinksForm({
  values,
  onChange,
  errors = {},
}: FormProps<ProfessionalLinksValues>) {
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
          value={values.linkedinUrl}
          onChange={(e) => onChange({ ...values, linkedinUrl: e.target.value })}
          className={errors.linkedinUrl ? "border-red-500" : ""}
        />
        {errors.linkedinUrl && (
          <p className="text-xs text-red-500 mt-1">{errors.linkedinUrl}</p>
        )}
      </div>

      <div>
        <Label htmlFor="portfolio">Portfolio Website</Label>
        <Input
          id="portfolio"
          type="url"
          placeholder="https://yourportfolio.com"
          value={values.portfolioUrl}
          onChange={(e) => onChange({ ...values, portfolioUrl: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="github">GitHub Profile</Label>
        <Input
          id="github"
          type="url"
          placeholder="https://github.com/yourusername"
          value={values.githubUrl}
          onChange={(e) => onChange({ ...values, githubUrl: e.target.value })}
        />
      </div>
    </div>
  );
}

// Work Authorization Form
export function WorkAuthorizationForm({
  values,
  onChange,
}: FormProps<WorkAuthValues>) {
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
            checked={values.authorizedToWork}
            onChange={(e) =>
              onChange({ ...values, authorizedToWork: e.target.checked })
            }
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
            checked={values.requiresSponsorship}
            onChange={(e) =>
              onChange({ ...values, requiresSponsorship: e.target.checked })
            }
            className="h-4 w-4 rounded border-slate-300"
          />
          <Label htmlFor="requiresSponsorship" className="font-normal">
            I will require visa sponsorship now or in the future
          </Label>
        </div>
      </div>

      {values.requiresSponsorship && (
        <div>
          <Label htmlFor="visaStatus">Current Visa Status (optional)</Label>
          <Select
            value={values.visaStatus}
            onValueChange={(value) => onChange({ ...values, visaStatus: value })}
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
}

// Availability Form
export function AvailabilityForm({
  values,
  onChange,
  errors = {},
}: FormProps<AvailabilityValues>) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Let employers know when you can start.
      </p>

      <div>
        <Label htmlFor="startDate">When can you start?</Label>
        <Select
          value={values.startDateType}
          onValueChange={(value) =>
            onChange({ ...values, startDateType: value as StartDateType })
          }
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

      {values.startDateType === "custom" && (
        <div>
          <Label htmlFor="customDate">Start Date</Label>
          <Input
            id="customDate"
            type="date"
            value={values.customStartDate}
            onChange={(e) =>
              onChange({ ...values, customStartDate: e.target.value })
            }
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
          value={String(values.noticePeriodWeeks)}
          onValueChange={(value) =>
            onChange({ ...values, noticePeriodWeeks: parseInt(value) })
          }
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
}

// Default values for each form
export const defaultPersonalInfo: PersonalInfoValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  country: "United States",
  zipCode: "",
};

export const defaultProfessionalLinks: ProfessionalLinksValues = {
  linkedinUrl: "",
  portfolioUrl: "",
  githubUrl: "",
};

export const defaultWorkAuth: WorkAuthValues = {
  authorizedToWork: true,
  requiresSponsorship: false,
  visaStatus: "",
};

export const defaultAvailability: AvailabilityValues = {
  startDateType: "two_weeks",
  customStartDate: "",
  noticePeriodWeeks: 2,
};

// Validation functions
export function validatePersonalInfo(values: PersonalInfoValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.firstName.trim()) errors.firstName = "First name is required";
  if (!values.lastName.trim()) errors.lastName = "Last name is required";
  if (!values.email.trim()) errors.email = "Email is required";
  if (!values.phone.trim()) errors.phone = "Phone number is required";
  if (!values.city.trim()) errors.city = "City is required";
  if (!values.state.trim()) errors.state = "State is required";
  return errors;
}

export function validateProfessionalLinks(values: ProfessionalLinksValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (values.linkedinUrl && !values.linkedinUrl.includes("linkedin.com")) {
    errors.linkedinUrl = "Please enter a valid LinkedIn URL";
  }
  return errors;
}

export function validateAvailability(values: AvailabilityValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (values.startDateType === "custom" && !values.customStartDate) {
    errors.customStartDate = "Please select a start date";
  }
  return errors;
}
