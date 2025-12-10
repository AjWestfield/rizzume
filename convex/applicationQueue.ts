import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Application Queue Mutations
 *
 * Manages the queue of jobs to be auto-applied via cron jobs.
 * Each job approved for auto-apply gets an entry here for processing.
 */

// Add approved jobs to the application queue
export const queueJobsForApplication = mutation({
  args: {
    userId: v.id("users"),
    jobQueueIds: v.array(v.id("jobQueue")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const queuedIds: string[] = [];

    for (const jobQueueId of args.jobQueueIds) {
      // Check if already in application queue
      const existing = await ctx.db
        .query("applicationQueue")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .filter((q) => q.eq(q.field("jobQueueId"), jobQueueId))
        .first();

      if (existing) {
        // Skip if already queued and not failed
        if (existing.status !== "failed") {
          continue;
        }
        // Reset failed job for retry
        await ctx.db.patch(existing._id, {
          status: "pending",
          attempts: 0,
          lastAttemptAt: undefined,
          nextAttemptAfter: undefined,
          result: undefined,
          updatedAt: now,
        });
        queuedIds.push(existing._id);
        continue;
      }

      // Create new queue entry
      const queueId = await ctx.db.insert("applicationQueue", {
        userId: args.userId,
        jobQueueId,
        status: "pending",
        attempts: 0,
        maxAttempts: 3,
        createdAt: now,
        updatedAt: now,
      });

      queuedIds.push(queueId);

      // Update jobQueue status to "applying"
      await ctx.db.patch(jobQueueId, {
        status: "applying",
        updatedAt: now,
      });
    }

    return { success: true, queuedCount: queuedIds.length, queuedIds };
  },
});

// Get the next pending job from the queue (for cron processing)
export const getNextPendingJob = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // First, try to get a job that's ready for retry
    const retryJob = await ctx.db
      .query("applicationQueue")
      .withIndex("by_next_attempt", (q) =>
        q.eq("status", "pending")
      )
      .filter((q) =>
        q.or(
          q.eq(q.field("nextAttemptAfter"), undefined),
          q.lte(q.field("nextAttemptAfter"), now)
        )
      )
      .first();

    if (retryJob) {
      // Get the associated job details
      const job = await ctx.db.get(retryJob.jobQueueId);
      const user = await ctx.db.get(retryJob.userId);

      return {
        queueEntry: retryJob,
        job,
        user,
      };
    }

    // Fall back to oldest pending job
    const oldestPending = await ctx.db
      .query("applicationQueue")
      .withIndex("by_pending_oldest", (q) => q.eq("status", "pending"))
      .first();

    if (oldestPending) {
      const job = await ctx.db.get(oldestPending.jobQueueId);
      const user = await ctx.db.get(oldestPending.userId);

      return {
        queueEntry: oldestPending,
        job,
        user,
      };
    }

    return null;
  },
});

// Mark a job as in progress (called when cron starts processing)
export const markInProgress = mutation({
  args: {
    queueId: v.id("applicationQueue"),
    browserSessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.patch(args.queueId, {
      status: "in_progress",
      browserSessionId: args.browserSessionId,
      lastAttemptAt: now,
      updatedAt: now,
    });

    // Get the queue entry to update the jobQueue
    const queueEntry = await ctx.db.get(args.queueId);
    if (queueEntry) {
      await ctx.db.patch(queueEntry.jobQueueId, {
        status: "applying",
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

// Mark a job as completed successfully
export const markCompleted = mutation({
  args: {
    queueId: v.id("applicationQueue"),
    result: v.object({
      success: v.boolean(),
      method: v.optional(v.string()),
      confirmationText: v.optional(v.string()),
      screenshotUrl: v.optional(v.string()),
      error: v.optional(v.string()),
      durationMs: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const queueEntry = await ctx.db.get(args.queueId);
    if (!queueEntry) {
      return { success: false, error: "Queue entry not found" };
    }

    // Update application queue
    await ctx.db.patch(args.queueId, {
      status: "completed",
      result: args.result,
      completedAt: now,
      updatedAt: now,
    });

    // Update jobQueue status
    await ctx.db.patch(queueEntry.jobQueueId, {
      status: "applied",
      appliedAt: now,
      updatedAt: now,
    });

    // Create application record
    const job = await ctx.db.get(queueEntry.jobQueueId);
    if (job) {
      await ctx.db.insert("applications", {
        userId: queueEntry.userId,
        jobQueueId: queueEntry.jobQueueId,
        jobId: job.jobId,
        jobTitle: job.jobTitle,
        company: job.company,
        location: job.location,
        applyLink: job.applyLink,
        source: job.source,
        appliedAt: now,
        applicationMethod: args.result.method === "easy_apply" ? "easy_apply" : "auto",
        coverLetterUsed: job.coverLetter,
        resumeVersionUsed: "optimized",
        status: "applied",
        matchScore: job.matchScore,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

// Mark a job as failed (with retry logic)
export const markFailed = mutation({
  args: {
    queueId: v.id("applicationQueue"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const queueEntry = await ctx.db.get(args.queueId);
    if (!queueEntry) {
      return { success: false, error: "Queue entry not found" };
    }

    const newAttempts = queueEntry.attempts + 1;
    const shouldRetry = newAttempts < queueEntry.maxAttempts;

    // Calculate exponential backoff: 1min, 5min, 15min
    const backoffMinutes = [1, 5, 15];
    const backoffMs =
      backoffMinutes[Math.min(newAttempts - 1, backoffMinutes.length - 1)] *
      60 *
      1000;

    await ctx.db.patch(args.queueId, {
      status: shouldRetry ? "pending" : "failed",
      attempts: newAttempts,
      lastAttemptAt: now,
      nextAttemptAfter: shouldRetry ? now + backoffMs : undefined,
      result: {
        success: false,
        error: args.error,
        durationMs: 0,
      },
      updatedAt: now,
    });

    // Update jobQueue status
    await ctx.db.patch(queueEntry.jobQueueId, {
      status: shouldRetry ? "applying" : "failed",
      lastAttemptError: args.error,
      applicationAttempts: (queueEntry.attempts || 0) + 1,
      updatedAt: now,
    });

    return {
      success: true,
      willRetry: shouldRetry,
      nextAttemptAt: shouldRetry ? now + backoffMs : null,
    };
  },
});

// Mark a job as skipped (e.g., job expired, already applied externally)
export const markSkipped = mutation({
  args: {
    queueId: v.id("applicationQueue"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const queueEntry = await ctx.db.get(args.queueId);
    if (!queueEntry) {
      return { success: false, error: "Queue entry not found" };
    }

    await ctx.db.patch(args.queueId, {
      status: "skipped",
      result: {
        success: false,
        error: args.reason,
      },
      completedAt: now,
      updatedAt: now,
    });

    // Update jobQueue - keep as discovered so user can try again
    await ctx.db.patch(queueEntry.jobQueueId, {
      status: "discovered",
      lastAttemptError: args.reason,
      updatedAt: now,
    });

    return { success: true };
  },
});

// Get queue statistics for a user
export const getQueueStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("applicationQueue")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const stats = {
      total: entries.length,
      pending: 0,
      inProgress: 0,
      completed: 0,
      failed: 0,
      skipped: 0,
    };

    for (const entry of entries) {
      switch (entry.status) {
        case "pending":
          stats.pending++;
          break;
        case "in_progress":
          stats.inProgress++;
          break;
        case "completed":
          stats.completed++;
          break;
        case "failed":
          stats.failed++;
          break;
        case "skipped":
          stats.skipped++;
          break;
      }
    }

    return stats;
  },
});

// Get all queue entries for a user
export const getUserQueue = query({
  args: {
    userId: v.id("users"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("failed"),
        v.literal("skipped")
      )
    ),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("applicationQueue")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId));

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const entries = await query.order("desc").collect();

    // Enrich with job details
    const enriched = await Promise.all(
      entries.map(async (entry) => {
        const job = await ctx.db.get(entry.jobQueueId);
        return {
          ...entry,
          job: job
            ? {
                title: job.jobTitle,
                company: job.company,
                applyLink: job.applyLink,
                matchScore: job.matchScore,
              }
            : null,
        };
      })
    );

    return enriched;
  },
});

// Cancel a pending application
export const cancelApplication = mutation({
  args: { queueId: v.id("applicationQueue") },
  handler: async (ctx, args) => {
    const now = Date.now();

    const queueEntry = await ctx.db.get(args.queueId);
    if (!queueEntry) {
      return { success: false, error: "Queue entry not found" };
    }

    if (queueEntry.status !== "pending") {
      return { success: false, error: "Can only cancel pending applications" };
    }

    // Delete from queue
    await ctx.db.delete(args.queueId);

    // Reset jobQueue status
    await ctx.db.patch(queueEntry.jobQueueId, {
      status: "approved",
      updatedAt: now,
    });

    return { success: true };
  },
});

// Clear completed/failed entries older than X days
export const cleanupOldEntries = mutation({
  args: { daysOld: v.number() },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - args.daysOld * 24 * 60 * 60 * 1000;

    const oldEntries = await ctx.db
      .query("applicationQueue")
      .filter((q) =>
        q.and(
          q.or(
            q.eq(q.field("status"), "completed"),
            q.eq(q.field("status"), "failed"),
            q.eq(q.field("status"), "skipped")
          ),
          q.lt(q.field("completedAt"), cutoff)
        )
      )
      .collect();

    for (const entry of oldEntries) {
      await ctx.db.delete(entry._id);
    }

    return { deletedCount: oldEntries.length };
  },
});

// Get currently processing job (for UI status display)
export const getCurrentlyProcessing = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const inProgress = await ctx.db
      .query("applicationQueue")
      .withIndex("by_userId_status", (q) =>
        q.eq("userId", args.userId).eq("status", "in_progress")
      )
      .first();

    if (!inProgress) {
      return null;
    }

    const job = await ctx.db.get(inProgress.jobQueueId);

    return {
      queueEntry: inProgress,
      job: job
        ? {
            title: job.jobTitle,
            company: job.company,
            applyLink: job.applyLink,
          }
        : null,
    };
  },
});
