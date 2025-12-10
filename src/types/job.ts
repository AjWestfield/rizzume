import { z } from "zod";
import type {
  ExperienceLevel,
  JobFunction,
  Industry,
  LocationDistance,
  OfficeRequirement,
  DatePosted,
  EmploymentType,
} from "@/lib/jobs/filter-options";

// JSearch API Response Types - using .optional() for fields that may be missing
export const JobSchema = z.object({
  job_id: z.string(),
  employer_name: z.string(),
  employer_logo: z.string().nullable().optional(),
  employer_website: z.string().nullable().optional(),
  job_employment_type: z.string().nullable().optional(),
  job_title: z.string(),
  job_apply_link: z.string(),
  job_description: z.string(),
  job_is_remote: z.boolean().optional().default(false),
  job_posted_at_datetime_utc: z.string().nullable().optional(),
  job_city: z.string().nullable().optional(),
  job_state: z.string().nullable().optional(),
  job_country: z.string().nullable().optional(),
  job_benefits: z.array(z.string()).nullable().optional(),
  job_min_salary: z.number().nullable().optional(),
  job_max_salary: z.number().nullable().optional(),
  job_salary_currency: z.string().nullable().optional(),
  job_salary_period: z.string().nullable().optional(),
  job_highlights: z.object({
    Qualifications: z.array(z.string()).optional(),
    Responsibilities: z.array(z.string()).optional(),
    Benefits: z.array(z.string()).optional(),
  }).nullable().optional(),
  job_required_experience: z.object({
    no_experience_required: z.boolean().optional(),
    required_experience_in_months: z.number().nullable().optional(),
    experience_mentioned: z.boolean().optional(),
    experience_preferred: z.boolean().optional(),
  }).nullable().optional(),
  job_required_skills: z.array(z.string()).nullable().optional(),
  job_required_education: z.object({
    postgraduate_degree: z.boolean().optional(),
    professional_certification: z.boolean().optional(),
    high_school: z.boolean().optional(),
    associates_degree: z.boolean().optional(),
    bachelors_degree: z.boolean().optional(),
    degree_mentioned: z.boolean().optional(),
    degree_preferred: z.boolean().optional(),
    professional_certification_mentioned: z.boolean().optional(),
  }).nullable().optional(),
});

export type Job = z.infer<typeof JobSchema>;

export const JSearchResponseSchema = z.object({
  status: z.string(),
  request_id: z.string(),
  data: z.array(JobSchema),
});

export type JSearchResponse = z.infer<typeof JSearchResponseSchema>;

// Search Parameters (for API calls)
export interface JobSearchParams {
  query: string;
  location?: string;
  locationDistance?: string; // "25", "50", "100", "anywhere"
  page?: number;
  datePosted?: "all" | "today" | "3days" | "week" | "month";
  remoteOnly?: boolean;
  officeType?: string; // "on-site", "hybrid", "remote"
  employmentType?: string; // "FULLTIME,PARTTIME,CONTRACTOR,INTERN"
  experienceLevel?: string; // "internship", "entry_level", "associate", "mid_senior", "director", "executive"
  minSalary?: number;
  requireSalary?: boolean; // Hide jobs with no salary info
  jobFunction?: string;
  industry?: string;
}

// UI State Types
export interface JobSearchState {
  jobs: Job[];
  selectedJob: Job | null;
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
}

// Re-export filter options from constants file
export {
  DATE_POSTED_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  OFFICE_REQUIREMENTS_OPTIONS,
  JOB_FUNCTION_OPTIONS,
  INDUSTRY_OPTIONS,
  LOCATION_DISTANCE_OPTIONS,
} from "@/lib/jobs/filter-options";

// Comprehensive Job Filters Interface (matching Swooped.co)
export interface JobFilters {
  // Search
  query: string;

  // Location
  location: string;
  locationDistance: LocationDistance;

  // Time
  datePosted: DatePosted;

  // Work Type
  officeRequirements: OfficeRequirement;
  employmentType: EmploymentType;

  // Salary
  minSalary: number | null;
  hideSalaryless: boolean;

  // Experience & Role
  experienceLevel: ExperienceLevel;
  jobFunction: JobFunction;
  industry: Industry;

  // App Features
  rizzumeApply: boolean; // Easy apply filter
}

// Default filter values
export const DEFAULT_JOB_FILTERS: JobFilters = {
  query: "",
  location: "",
  locationDistance: "25",
  datePosted: "all",
  officeRequirements: "all",
  employmentType: "all",
  minSalary: null,
  hideSalaryless: false,
  experienceLevel: "all",
  jobFunction: "all",
  industry: "all",
  rizzumeApply: false,
};

// Legacy filter options for backwards compatibility
export const OFFICE_TYPE_OPTIONS = [
  { value: "all_office", label: "All" },
  { value: "remote", label: "Remote" },
  { value: "onsite", label: "On-site" },
] as const;
