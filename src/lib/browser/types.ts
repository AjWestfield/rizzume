/**
 * Browser Automation Types
 *
 * Shared types for browser automation functionality.
 */

export type JobPlatform = "linkedin" | "indeed" | "greenhouse" | "lever" | "other";

export type ApplicationMethod = "easy_apply" | "form_fill" | "redirect" | "email";

export type ApplicationStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "failed"
  | "skipped"
  | "timeout";

export interface JobApplicationData {
  id: string;
  title: string;
  company: string;
  applyUrl: string;
  platform: JobPlatform;
  coverLetter?: string;
  matchScore?: number;
}

export interface ApplicationAttempt {
  jobId: string;
  status: ApplicationStatus;
  method?: ApplicationMethod;
  screenshotUrl?: string;
  confirmationText?: string;
  error?: string;
  startedAt: string;
  completedAt?: string;
  durationMs: number;
}

export interface QueuedApplication {
  id: string;
  userId: string;
  jobId: string;
  status: ApplicationStatus;
  attempts: number;
  lastAttemptAt?: string;
  error?: string;
  result?: ApplicationAttempt;
  createdAt: string;
  updatedAt: string;
}

export interface ApplySessionProgress {
  sessionId: string;
  totalJobs: number;
  processedJobs: number;
  successCount: number;
  failedCount: number;
  skippedCount: number;
  currentJob?: {
    id: string;
    title: string;
    company: string;
  };
  status: "idle" | "running" | "paused" | "completed" | "failed";
  startedAt?: string;
  completedAt?: string;
  estimatedTimeRemaining?: number;
}
