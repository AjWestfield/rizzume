import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Add a job to the queue
export const addToQueue = mutation({
  args: {
    userId: v.id("users"),
    jobId: v.string(),
    jobTitle: v.string(),
    company: v.string(),
    location: v.optional(v.string()),
    salary: v.optional(v.string()),
    jobType: v.optional(v.string()),
    remote: v.optional(v.boolean()),
    description: v.optional(v.string()),
    requirements: v.optional(v.array(v.string())),
    applyLink: v.string(),
    source: v.string(),
    matchScore: v.number(),
    matchAnalysis: v.optional(v.string()),
    matchedSkills: v.optional(v.array(v.string())),
    missingSkills: v.optional(v.array(v.string())),
    coverLetter: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("discovered"),
      v.literal("saved"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("applying"),
      v.literal("applied"),
      v.literal("failed")
    )),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if job already exists in queue
    const existing = await ctx.db
      .query("jobQueue")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("jobId"), args.jobId))
      .first();

    if (existing) {
      // Update existing entry
      await ctx.db.patch(existing._id, {
        matchScore: args.matchScore,
        matchAnalysis: args.matchAnalysis,
        matchedSkills: args.matchedSkills,
        missingSkills: args.missingSkills,
        coverLetter: args.coverLetter,
        updatedAt: now,
      });
      return existing._id;
    }

    // Create new entry
    const queueId = await ctx.db.insert("jobQueue", {
      ...args,
      status: args.status ?? "discovered",
      applicationAttempts: 0,
      discoveredAt: now,
      updatedAt: now,
    });

    return queueId;
  },
});

// Get jobs in queue for user
export const getQueue = query({
  args: {
    userId: v.id("users"),
    status: v.optional(v.union(
      v.literal("discovered"),
      v.literal("saved"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("applying"),
      v.literal("applied"),
      v.literal("failed")
    )),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("jobQueue")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId));

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const jobs = await query.order("desc").collect();
    return jobs;
  },
});

// Get approved jobs ready for application
export const getApprovedJobs = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("jobQueue")
      .withIndex("by_userId_status", (q) =>
        q.eq("userId", args.userId).eq("status", "approved")
      )
      .collect();
  },
});

// Get queue statistics for user
export const getQueueStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const jobs = await ctx.db
      .query("jobQueue")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const stats = {
      total: jobs.length,
      discovered: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      applying: 0,
      applied: 0,
      failed: 0,
      averageMatchScore: 0,
    };

    let totalScore = 0;
    for (const job of jobs) {
      stats[job.status as keyof typeof stats]++;
      totalScore += job.matchScore;
    }

    stats.averageMatchScore =
      jobs.length > 0 ? Math.round(totalScore / jobs.length) : 0;

    return stats;
  },
});

// Update job status
export const updateJobStatus = mutation({
  args: {
    jobQueueId: v.id("jobQueue"),
    status: v.union(
      v.literal("discovered"),
      v.literal("saved"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("applying"),
      v.literal("applied"),
      v.literal("failed")
    ),
    lastAttemptError: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { jobQueueId, status, lastAttemptError } = args;

    const updates: Record<string, unknown> = {
      status,
      updatedAt: Date.now(),
    };

    if (status === "applied") {
      updates.appliedAt = Date.now();
    }

    if (lastAttemptError !== undefined) {
      updates.lastAttemptError = lastAttemptError;
    }

    if (status === "applying" || status === "failed") {
      const job = await ctx.db.get(jobQueueId);
      if (job) {
        updates.applicationAttempts = (job.applicationAttempts || 0) + 1;
      }
    }

    await ctx.db.patch(jobQueueId, updates);
    return jobQueueId;
  },
});

// Batch approve jobs
export const batchApprove = mutation({
  args: {
    jobQueueIds: v.array(v.id("jobQueue")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    for (const id of args.jobQueueIds) {
      await ctx.db.patch(id, {
        status: "approved",
        updatedAt: now,
      });
    }

    return args.jobQueueIds.length;
  },
});

// Batch reject jobs
export const batchReject = mutation({
  args: {
    jobQueueIds: v.array(v.id("jobQueue")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    for (const id of args.jobQueueIds) {
      await ctx.db.patch(id, {
        status: "rejected",
        updatedAt: now,
      });
    }

    return args.jobQueueIds.length;
  },
});

// Update cover letter for a job
export const updateCoverLetter = mutation({
  args: {
    jobQueueId: v.id("jobQueue"),
    coverLetter: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobQueueId, {
      coverLetter: args.coverLetter,
      updatedAt: Date.now(),
    });
    return args.jobQueueId;
  },
});

// Delete a job from queue
export const removeFromQueue = mutation({
  args: { jobQueueId: v.id("jobQueue") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.jobQueueId);
    return args.jobQueueId;
  },
});

// Get single job from queue
export const getJob = query({
  args: { jobQueueId: v.id("jobQueue") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.jobQueueId);
  },
});

// Get high-match jobs (70%+)
export const getHighMatchJobs = query({
  args: {
    userId: v.id("users"),
    minScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const minScore = args.minScore ?? 70;

    const jobs = await ctx.db
      .query("jobQueue")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        q.and(
          q.gte(q.field("matchScore"), minScore),
          q.or(
            q.eq(q.field("status"), "discovered"),
            q.eq(q.field("status"), "pending")
          )
        )
      )
      .collect();

    // Sort by match score descending
    return jobs.sort((a, b) => b.matchScore - a.matchScore);
  },
});

// Add discovered jobs to queue by email (for frontend convenience)
export const addDiscoveredJobsByEmail = mutation({
  args: {
    userEmail: v.string(),
    jobs: v.array(v.object({
      jobId: v.string(),
      jobTitle: v.string(),
      company: v.string(),
      location: v.optional(v.string()),
      salary: v.optional(v.string()),
      jobType: v.optional(v.string()),
      remote: v.optional(v.boolean()),
      description: v.optional(v.string()),
      applyLink: v.string(),
      source: v.string(),
      matchScore: v.number(),
      matchAnalysis: v.optional(v.string()),
      matchedSkills: v.optional(v.array(v.string())),
      missingSkills: v.optional(v.array(v.string())),
      coverLetter: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Get user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.userEmail))
      .first();

    if (!user) {
      return { success: false, error: "User not found", addedCount: 0 };
    }

    const now = Date.now();
    let addedCount = 0;

    for (const job of args.jobs) {
      // Check if job already exists
      const existing = await ctx.db
        .query("jobQueue")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("jobId"), job.jobId))
        .first();

      if (existing) {
        // Update existing job
        await ctx.db.patch(existing._id, {
          matchScore: job.matchScore,
          matchAnalysis: job.matchAnalysis,
          matchedSkills: job.matchedSkills,
          missingSkills: job.missingSkills,
          coverLetter: job.coverLetter,
          updatedAt: now,
        });
      } else {
        // Add new job
        await ctx.db.insert("jobQueue", {
          userId: user._id,
          jobId: job.jobId,
          jobTitle: job.jobTitle,
          company: job.company,
          location: job.location,
          salary: job.salary,
          jobType: job.jobType,
          remote: job.remote,
          description: job.description,
          applyLink: job.applyLink,
          source: job.source,
          matchScore: job.matchScore,
          matchAnalysis: job.matchAnalysis,
          matchedSkills: job.matchedSkills,
          missingSkills: job.missingSkills,
          coverLetter: job.coverLetter,
          status: "discovered",
          applicationAttempts: 0,
          discoveredAt: now,
          updatedAt: now,
        });
        addedCount++;
      }
    }

    return { success: true, addedCount };
  },
});

// Approve a job by external jobId and user email
export const approveJobByJobId = mutation({
  args: {
    userEmail: v.string(),
    jobId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.userEmail))
      .first();

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Find the job in queue
    const job = await ctx.db
      .query("jobQueue")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("jobId"), args.jobId))
      .first();

    if (!job) {
      return { success: false, error: "Job not found in queue" };
    }

    // Update status to approved
    await ctx.db.patch(job._id, {
      status: "approved",
      updatedAt: Date.now(),
    });

    return { success: true, jobQueueId: job._id };
  },
});

// Reject a job by external jobId and user email
export const rejectJobByJobId = mutation({
  args: {
    userEmail: v.string(),
    jobId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.userEmail))
      .first();

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Find the job in queue
    const job = await ctx.db
      .query("jobQueue")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("jobId"), args.jobId))
      .first();

    if (!job) {
      return { success: false, error: "Job not found in queue" };
    }

    // Update status to rejected
    await ctx.db.patch(job._id, {
      status: "rejected",
      updatedAt: Date.now(),
    });

    return { success: true, jobQueueId: job._id };
  },
});

// Save a job (wrapper around addToQueue with specific status logic)
export const saveJob = mutation({
  args: {
    userId: v.id("users"),
    jobId: v.string(),
    jobTitle: v.string(),
    company: v.string(),
    location: v.optional(v.string()),
    salary: v.optional(v.string()),
    jobType: v.optional(v.string()),
    remote: v.optional(v.boolean()),
    description: v.optional(v.string()),
    applyLink: v.string(),
    source: v.string(),
    matchScore: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if job already exists in queue
    const existing = await ctx.db
      .query("jobQueue")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("jobId"), args.jobId))
      .first();

    if (existing) {
      // If it exists but is just 'discovered' or 'rejected', move to 'saved'
      if (existing.status === "discovered" || existing.status === "rejected") {
        await ctx.db.patch(existing._id, {
          status: "saved",
          updatedAt: now,
        });
      }
      return existing._id;
    }

    // Create new entry as saved
    const queueId = await ctx.db.insert("jobQueue", {
      ...args,
      status: "saved",
      applicationAttempts: 0,
      discoveredAt: now,
      updatedAt: now,
    });

    return queueId;
  },
});

// Get all tracked job IDs for a user (saved, applied, etc.)
export const getTrackedJobIds = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Get from jobQueue
    const queuedJobs = await ctx.db
      .query("jobQueue")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // Get from applications
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const tracked = new Set<string>();

    for (const job of queuedJobs) {
      if (job.status !== "rejected" && job.status !== "discovered") {
        tracked.add(job.jobId);
      }
      if (job.status === "saved") {
        tracked.add(job.jobId);
      }
    }

    for (const app of applications) {
      tracked.add(app.jobId);
    }

    return Array.from(tracked);
  },
});

