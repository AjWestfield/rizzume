import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

/**
 * Auto-Apply API - Queue-Based Architecture
 *
 * This endpoint queues jobs for auto-apply processing.
 * Actual applications are handled by the cron job (/api/cron/apply).
 *
 * Flow:
 * 1. User approves jobs for auto-apply
 * 2. This endpoint adds them to applicationQueue
 * 3. Cron job processes one job every 2 minutes
 * 4. UI polls for progress via Convex real-time
 */

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;
const convex = new ConvexHttpClient(CONVEX_URL);

interface AutoApplyRequest {
  userId: string;
  jobQueueIds: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: AutoApplyRequest = await request.json();
    const { userId, jobQueueIds } = body;

    // Validate request
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      );
    }

    if (!jobQueueIds || !Array.isArray(jobQueueIds) || jobQueueIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "No jobs provided" },
        { status: 400 }
      );
    }

    // Queue jobs for processing
    const result = await convex.mutation(api.applicationQueue.queueJobsForApplication, {
      userId: userId as Id<"users">,
      jobQueueIds: jobQueueIds as Id<"jobQueue">[],
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Failed to queue jobs" },
        { status: 500 }
      );
    }

    // Calculate estimated completion time
    // Cron runs every 2 minutes, so each job takes ~2 minutes
    const estimatedMinutes = result.queuedCount * 2;
    const estimatedCompletionTime = new Date(
      Date.now() + estimatedMinutes * 60 * 1000
    );

    return NextResponse.json({
      success: true,
      queuedCount: result.queuedCount,
      message: `Queued ${result.queuedCount} jobs for auto-apply`,
      estimatedMinutes,
      estimatedCompletionTime: estimatedCompletionTime.toISOString(),
      note: "Jobs will be processed every 2 minutes by the cron job. Track progress via Convex real-time updates.",
    });
  } catch (error) {
    console.error("Auto-apply queue error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to queue jobs",
      },
      { status: 500 }
    );
  }
}

// GET - Get queue status for user
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const action = searchParams.get("action");

  // Health check
  if (action === "health") {
    const hasBrowserbaseKey = !!process.env.BROWSERBASE_API_KEY;
    const hasBrowserbaseProject = !!process.env.BROWSERBASE_PROJECT_ID;
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

    return NextResponse.json({
      success: true,
      available: hasBrowserbaseKey && hasBrowserbaseProject,
      configuration: {
        browserbase: hasBrowserbaseKey && hasBrowserbaseProject,
        openai: hasOpenAIKey,
      },
      message:
        hasBrowserbaseKey && hasBrowserbaseProject
          ? "Browserbase + Stagehand configured"
          : "Missing BROWSERBASE_API_KEY or BROWSERBASE_PROJECT_ID",
      architecture: "queue-based",
      cronSchedule: "*/2 * * * *",
    });
  }

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "User ID required" },
      { status: 400 }
    );
  }

  try {
    // Get queue statistics
    const stats = await convex.query(api.applicationQueue.getQueueStats, {
      userId: userId as Id<"users">,
    });

    // Get currently processing job
    const currentlyProcessing = await convex.query(
      api.applicationQueue.getCurrentlyProcessing,
      { userId: userId as Id<"users"> }
    );

    // Estimate time remaining
    const pendingJobs = stats.pending + stats.inProgress;
    const estimatedMinutesRemaining = pendingJobs * 2;

    return NextResponse.json({
      success: true,
      stats,
      currentlyProcessing,
      estimatedMinutesRemaining,
      nextCronRun: getNextCronRun(),
    });
  } catch (error) {
    console.error("Queue status error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get status",
      },
      { status: 500 }
    );
  }
}

// DELETE - Cancel pending applications
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const queueId = searchParams.get("queueId");

  if (!queueId) {
    return NextResponse.json(
      { success: false, error: "Queue ID required" },
      { status: 400 }
    );
  }

  try {
    const result = await convex.mutation(api.applicationQueue.cancelApplication, {
      queueId: queueId as Id<"applicationQueue">,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Cancel error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to cancel",
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate when the next cron job will run
 * Cron runs every 2 minutes: */2 * * * *
 */
function getNextCronRun(): string {
  const now = new Date();
  const minutes = now.getMinutes();
  const nextMinute = minutes % 2 === 0 ? minutes + 2 : minutes + 1;

  const next = new Date(now);
  next.setMinutes(nextMinute);
  next.setSeconds(0);
  next.setMilliseconds(0);

  return next.toISOString();
}
