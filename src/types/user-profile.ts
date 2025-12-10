import { Id } from "../../convex/_generated/dataModel";

// Work Authorization Types
export interface WorkAuthorization {
  authorizedToWork: boolean;
  requiresSponsorship: boolean;
  visaStatus?: string;
}

export type VisaStatus =
  | "citizen"
  | "permanent_resident"
  | "h1b"
  | "h4_ead"
  | "l1"
  | "opt"
  | "cpt"
  | "tn"
  | "other";

// Availability Types
export type StartDateType = "immediately" | "two_weeks" | "one_month" | "custom";

export interface Availability {
  startDateType: StartDateType;
  customStartDate?: number; // Unix timestamp
  noticePeriodWeeks?: number;
}

// Reference Types
export type ReferenceRelationship =
  | "manager"
  | "colleague"
  | "mentor"
  | "professor"
  | "client"
  | "other";

export interface Reference {
  _id?: Id<"references">;
  userId: Id<"users">;
  name: string;
  title: string;
  company: string;
  email: string;
  phone?: string;
  relationship: ReferenceRelationship | string;
  order: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ReferenceInput {
  name: string;
  title: string;
  company: string;
  email: string;
  phone?: string;
  relationship: ReferenceRelationship | string;
}

// Document Types
export type DocumentType = "resume" | "cover_letter_template" | "portfolio";

export interface Document {
  _id?: Id<"documents">;
  userId: Id<"users">;
  type: DocumentType | string;
  name: string;
  fileId?: Id<"_storage">;
  fileUrl?: string;
  textContent?: string;
  isDefault?: boolean;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// User Profile Types
export interface UserProfile {
  _id?: Id<"users">;
  clerkId?: string;
  email: string;
  name?: string;

  // Personal info
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;

  // Professional links
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  professionalLinksSkipped?: boolean;

  // Work authorization
  workAuthorization?: WorkAuthorization;

  // Availability
  availability?: Availability;

  // Profile completeness
  profileCompleteness?: number;

  // Resume data
  resumeText?: string;
  optimizedResumeText?: string;
  resumeFileUrl?: string;

  // Parsed resume components
  parsedSkills?: string[];
  parsedExperience?: {
    title: string;
    company: string;
    duration?: string;
    description?: string;
  }[];
  parsedEducation?: {
    degree: string;
    institution: string;
    year?: string;
  }[];

  // Job preferences
  preferredJobTitles?: string[];
  preferredLocations?: string[];
  remotePreference?: "remote" | "hybrid" | "onsite" | "any";
  salaryMin?: number;
  salaryMax?: number;

  // Settings
  autoApplyEnabled?: boolean;
  dailyApplicationLimit?: number;

  createdAt: number;
  updatedAt: number;
}

// Profile Update Input Types
export interface PersonalInfoInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface ProfessionalLinksInput {
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  professionalLinksSkipped?: boolean;
}

export interface JobPreferencesInput {
  preferredJobTitles?: string[];
  preferredLocations?: string[];
  remotePreference?: "remote" | "hybrid" | "onsite" | "any";
  salaryMin?: number;
  salaryMax?: number;
}

// Full Profile Data for Auto-Apply
export interface AutoApplyProfile {
  // Personal
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Location
  city: string;
  state: string;
  country: string;
  zipCode: string;

  // Links
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;

  // Work authorization
  authorizedToWork: boolean;
  requiresSponsorship: boolean;
  visaStatus?: string;

  // Availability
  startDateType: StartDateType;
  customStartDate?: Date;
  noticePeriodWeeks?: number;

  // Salary
  salaryMin?: number;
  salaryMax?: number;
  salaryExpectation?: string; // Formatted string

  // Documents
  resumeText: string;
  resumeFileUrl?: string;
  coverLetterTemplate?: string;

  // References
  references: Reference[];

  // Skills and experience
  skills: string[];
  yearsOfExperience?: number;
  currentTitle?: string;
  currentCompany?: string;
}

// Profile Completeness
export interface ProfileCompleteness {
  percentage: number;
  missingFields: string[];
  completedFields: string[];
  isReadyForAutoApply: boolean;
}

// Required fields for auto-apply
export const REQUIRED_AUTO_APPLY_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "city",
  "state",
  "country",
  "resumeText",
  "workAuthorization",
  "availability",
] as const;

// Auto-Apply Session Types
export type AutoApplySessionStatus =
  | "idle"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

export interface AutoApplyResult {
  jobId: Id<"jobQueue">;
  status: "success" | "failed" | "skipped";
  method?: "easy_apply" | "form_fill" | "email" | "redirect";
  error?: string;
  formFieldsFilled?: number;
  appliedAt?: number;
}

export interface AutoApplySession {
  _id?: Id<"autoApplySessions">;
  userId: Id<"users">;
  jobIds: Id<"jobQueue">[];
  totalJobs: number;
  currentJobIndex: number;
  currentJobId?: Id<"jobQueue">;
  currentPhase?: string;
  successCount: number;
  failedCount: number;
  skippedCount: number;
  results?: AutoApplyResult[];
  status: AutoApplySessionStatus;
  error?: string;
  startedAt: number;
  completedAt?: number;
}

// Auto-Apply Progress (for UI updates)
export interface AutoApplyProgress {
  sessionId: string;
  status: AutoApplySessionStatus;
  currentPhase: string;
  totalJobs: number;
  currentJobIndex: number;
  currentJob?: {
    id: string;
    title: string;
    company: string;
  };
  successCount: number;
  failedCount: number;
  skippedCount: number;
  lastError?: string;
}
