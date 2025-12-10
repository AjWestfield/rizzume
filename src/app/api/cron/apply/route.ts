import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import {
  createBrowserSession,
  closeBrowserSession,
  applyToJob,
  detectPlatform,
} from "@/lib/browser";
import type { AutoApplyProfile } from "@/types/user-profile";

/**
 * Cron Job: Process Application Queue
 *
 * This endpoint is called by Vercel cron every 2 minutes.
 * It picks ONE pending job from the queue and applies to it.
 *
 * Architecture:
 * - Vercel cron triggers this endpoint
 * - Picks oldest pending job from applicationQueue
 * - Creates Browserbase session
 * - Uses Stagehand AI to fill out application
 * - Updates queue status (completed/failed)
 * - Returns within 60 seconds (Vercel limit)
 */

const CRON_SECRET = process.env.CRON_SECRET;
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;

// Initialize Convex client
const convex = new ConvexHttpClient(CONVEX_URL);

export const maxDuration = 60; // Maximum allowed for Vercel Pro
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    console.log("[Cron] Unauthorized request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[Cron] Starting application queue processing");

  try {
    // Get next pending job from queue
    const nextJob = await convex.query(api.applicationQueue.getNextPendingJob);

    if (!nextJob || !nextJob.job || !nextJob.user) {
      console.log("[Cron] No pending jobs in queue");
      return NextResponse.json({
        success: true,
        message: "No pending jobs",
        processed: 0,
      });
    }

    const { queueEntry, job, user } = nextJob;

    console.log(
      `[Cron] Processing job: ${job.jobTitle} at ${job.company} for user ${user.email}`
    );

    // Mark as in progress
    await convex.mutation(api.applicationQueue.markInProgress, {
      queueId: queueEntry._id,
    });

    // Build profile for auto-apply
    const profile = buildAutoApplyProfile(user);

    // Validate profile has required fields
    const missingFields = validateProfile(profile);
    if (missingFields.length > 0) {
      console.log(`[Cron] Missing required fields: ${missingFields.join(", ")}`);
      await convex.mutation(api.applicationQueue.markFailed, {
        queueId: queueEntry._id,
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
      return NextResponse.json({
        success: false,
        error: "Missing profile fields",
        missingFields,
      });
    }

    // Create browser session
    let session;
    try {
      session = await createBrowserSession();
      console.log(`[Cron] Browser session created: ${session.sessionId}`);

      // Update with browser session ID
      await convex.mutation(api.applicationQueue.markInProgress, {
        queueId: queueEntry._id,
        browserSessionId: session.sessionId,
      });
    } catch (error) {
      console.error("[Cron] Failed to create browser session:", error);
      await convex.mutation(api.applicationQueue.markFailed, {
        queueId: queueEntry._id,
        error: `Browser session failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
      return NextResponse.json({
        success: false,
        error: "Failed to create browser session",
      });
    }

    try {
      // Apply to job using Stagehand
      const result = await applyToJob(
        session,
        {
          id: job.jobId,
          title: job.jobTitle,
          company: job.company,
          applyUrl: job.applyLink,
          platform: detectPlatform(job.applyLink),
          coverLetter: job.coverLetter,
        },
        profile
      );

      console.log(
        `[Cron] Application result: ${result.success ? "SUCCESS" : "FAILED"}`
      );

      if (result.success) {
        // Mark as completed
        await convex.mutation(api.applicationQueue.markCompleted, {
          queueId: queueEntry._id,
          result: {
            success: true,
            method: result.method,
            confirmationText: result.confirmationText,
            durationMs: result.durationMs,
          },
        });

        return NextResponse.json({
          success: true,
          jobId: job.jobId,
          jobTitle: job.jobTitle,
          company: job.company,
          method: result.method,
          durationMs: result.durationMs,
        });
      } else {
        // Check if it's a redirect (external application)
        if (result.method === "redirect") {
          await convex.mutation(api.applicationQueue.markSkipped, {
            queueId: queueEntry._id,
            reason: "External application site - manual application required",
          });
        } else {
          await convex.mutation(api.applicationQueue.markFailed, {
            queueId: queueEntry._id,
            error: result.error || "Application failed",
          });
        }

        return NextResponse.json({
          success: false,
          jobId: job.jobId,
          error: result.error,
          method: result.method,
        });
      }
    } finally {
      // Always close browser session
      try {
        await closeBrowserSession(session);
        console.log("[Cron] Browser session closed");
      } catch (e) {
        console.warn("[Cron] Error closing session:", e);
      }
    }
  } catch (error) {
    console.error("[Cron] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Build AutoApplyProfile from user data
 */
function buildAutoApplyProfile(user: Record<string, unknown>): AutoApplyProfile {
  return {
    // Personal
    firstName: (user.firstName as string) || "",
    lastName: (user.lastName as string) || "",
    email: (user.email as string) || "",
    phone: (user.phone as string) || "",

    // Location
    city: (user.city as string) || "",
    state: (user.state as string) || "",
    country: (user.country as string) || "United States",
    zipCode: (user.zipCode as string) || "",

    // Links
    linkedinUrl: user.linkedinUrl as string | undefined,
    portfolioUrl: user.portfolioUrl as string | undefined,
    githubUrl: user.githubUrl as string | undefined,

    // Work authorization
    authorizedToWork:
      (user.workAuthorization as { authorizedToWork?: boolean })
        ?.authorizedToWork ?? true,
    requiresSponsorship:
      (user.workAuthorization as { requiresSponsorship?: boolean })
        ?.requiresSponsorship ?? false,
    visaStatus: (user.workAuthorization as { visaStatus?: string })?.visaStatus,

    // Availability
    startDateType:
      ((user.availability as { startDateType?: string })?.startDateType as
        | "immediately"
        | "two_weeks"
        | "one_month"
        | "custom") || "two_weeks",
    noticePeriodWeeks: (user.availability as { noticePeriodWeeks?: number })
      ?.noticePeriodWeeks,

    // Salary
    salaryMin: user.salaryMin as number | undefined,
    salaryMax: user.salaryMax as number | undefined,
    salaryExpectation: user.salaryMin
      ? `$${((user.salaryMin as number) / 1000).toFixed(0)}k - $${((user.salaryMax as number) / 1000).toFixed(0)}k`
      : undefined,

    // Documents
    resumeText: (user.optimizedResumeText as string) || (user.resumeText as string) || "",
    resumeFileUrl: user.resumeFileUrl as string | undefined,

    // References (would need separate query)
    references: [],

    // Skills
    skills: (user.parsedSkills as string[]) || [],
    yearsOfExperience: undefined, // Would calculate from experience
    currentTitle: (user.parsedExperience as { title: string }[])?.[0]?.title,
    currentCompany: (user.parsedExperience as { company: string }[])?.[0]
      ?.company,
  };
}

/**
 * Validate profile has required fields for auto-apply
 */
function validateProfile(profile: AutoApplyProfile): string[] {
  const required = [
    { field: "firstName", value: profile.firstName },
    { field: "lastName", value: profile.lastName },
    { field: "email", value: profile.email },
    { field: "phone", value: profile.phone },
    { field: "resumeText", value: profile.resumeText },
  ];

  return required
    .filter(({ value }) => !value || value.trim() === "")
    .map(({ field }) => field);
}

// Health check endpoint
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
