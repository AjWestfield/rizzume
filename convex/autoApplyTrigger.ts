import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/**
 * Auto-Apply Trigger Module
 *
 * Provides queries and mutations for automatic job application triggering.
 * Jobs are automatically applied to when they reach "approved" status.
 */

/**
 * Get all approved jobs for a user that are ready for auto-apply
 */
export const getApprovedJobsForAutoApply = query({
  args: {
    userEmail: v.string(),
  },
  handler: async (ctx, args) => {
    // First get the user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.userEmail))
      .first();

    if (!user) {
      return [];
    }

    // Get approved jobs for this user
    const approvedJobs = await ctx.db
      .query("jobQueue")
      .withIndex("by_userId_status", (q) =>
        q.eq("userId", user._id).eq("status", "approved")
      )
      .collect();

    return approvedJobs;
  },
});

/**
 * Atomically mark a job as "applying" to prevent double-apply
 * Returns the job data if successful, null if the job was already picked up
 */
export const markJobAsApplying = mutation({
  args: {
    jobQueueId: v.id("jobQueue"),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobQueueId);

    // Only mark if status is still "approved"
    if (!job || job.status !== "approved") {
      return { success: false, job: null };
    }

    // Update to "applying"
    await ctx.db.patch(args.jobQueueId, {
      status: "applying",
      updatedAt: Date.now(),
      applicationAttempts: (job.applicationAttempts || 0) + 1,
    });

    // Return the job with updated status
    const updatedJob = await ctx.db.get(args.jobQueueId);
    return { success: true, job: updatedJob };
  },
});

/**
 * Mark a job as successfully applied
 */
export const markJobAsApplied = mutation({
  args: {
    jobQueueId: v.id("jobQueue"),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobQueueId);

    if (!job) {
      return { success: false };
    }

    await ctx.db.patch(args.jobQueueId, {
      status: "applied",
      appliedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Mark a job as failed with error message
 */
export const markJobAsFailed = mutation({
  args: {
    jobQueueId: v.id("jobQueue"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobQueueId);

    if (!job) {
      return { success: false };
    }

    await ctx.db.patch(args.jobQueueId, {
      status: "failed",
      lastAttemptError: args.error,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Reset a failed job back to approved status for retry
 */
export const retryFailedJob = mutation({
  args: {
    jobQueueId: v.id("jobQueue"),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobQueueId);

    if (!job || job.status !== "failed") {
      return { success: false };
    }

    await ctx.db.patch(args.jobQueueId, {
      status: "approved",
      lastAttemptError: undefined,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Get count of jobs in various statuses for a user
 */
export const getAutoApplyStats = query({
  args: {
    userEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.userEmail))
      .first();

    if (!user) {
      return {
        approved: 0,
        applying: 0,
        applied: 0,
        failed: 0,
      };
    }

    // Get all jobs for this user
    const allJobs = await ctx.db
      .query("jobQueue")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    // Count by status
    const stats = {
      approved: 0,
      applying: 0,
      applied: 0,
      failed: 0,
    };

    for (const job of allJobs) {
      if (job.status === "approved") stats.approved++;
      else if (job.status === "applying") stats.applying++;
      else if (job.status === "applied") stats.applied++;
      else if (job.status === "failed") stats.failed++;
    }

    return stats;
  },
});

/**
 * Batch update job statuses (for bulk operations)
 */
export const batchUpdateJobStatuses = mutation({
  args: {
    updates: v.array(
      v.object({
        jobQueueId: v.id("jobQueue"),
        status: v.union(
          v.literal("discovered"),
          v.literal("pending"),
          v.literal("approved"),
          v.literal("rejected"),
          v.literal("applying"),
          v.literal("applied"),
          v.literal("failed")
        ),
        error: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const results = [];

    for (const update of args.updates) {
      try {
        const patchData: Record<string, unknown> = {
          status: update.status,
          updatedAt: now,
        };

        if (update.status === "applied") {
          patchData.appliedAt = now;
        }

        if (update.status === "failed" && update.error) {
          patchData.lastAttemptError = update.error;
        }

        await ctx.db.patch(update.jobQueueId, patchData);
        results.push({ jobQueueId: update.jobQueueId, success: true });
      } catch (error) {
        results.push({
          jobQueueId: update.jobQueueId,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  },
});
