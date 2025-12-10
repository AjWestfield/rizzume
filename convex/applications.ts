import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Record a new application
export const recordApplication = mutation({
  args: {
    userId: v.id("users"),
    jobQueueId: v.optional(v.id("jobQueue")),
    jobId: v.string(),
    jobTitle: v.string(),
    company: v.string(),
    location: v.optional(v.string()),
    applyLink: v.string(),
    source: v.string(),
    applicationMethod: v.union(
      v.literal("auto"),
      v.literal("manual"),
      v.literal("easy_apply")
    ),
    coverLetterUsed: v.optional(v.string()),
    resumeVersionUsed: v.optional(v.string()),
    matchScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const applicationId = await ctx.db.insert("applications", {
      userId: args.userId,
      jobQueueId: args.jobQueueId,
      jobId: args.jobId,
      jobTitle: args.jobTitle,
      company: args.company,
      location: args.location,
      applyLink: args.applyLink,
      source: args.source,
      appliedAt: now,
      applicationMethod: args.applicationMethod,
      coverLetterUsed: args.coverLetterUsed,
      resumeVersionUsed: args.resumeVersionUsed,
      status: "applied",
      matchScore: args.matchScore,
      createdAt: now,
      updatedAt: now,
    });

    // If came from job queue, update the queue status
    if (args.jobQueueId) {
      await ctx.db.patch(args.jobQueueId, {
        status: "applied",
        appliedAt: now,
        updatedAt: now,
      });
    }

    return applicationId;
  },
});

// Get all applications for user
export const getApplications = query({
  args: {
    userId: v.id("users"),
    status: v.optional(v.union(
      v.literal("applied"),
      v.literal("viewed"),
      v.literal("screening"),
      v.literal("interviewing"),
      v.literal("offer"),
      v.literal("rejected"),
      v.literal("withdrawn"),
      v.literal("no_response")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("applications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId));

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const applications = await query.order("desc").collect();

    if (args.limit) {
      return applications.slice(0, args.limit);
    }

    return applications;
  },
});

// Get application statistics
export const getApplicationStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const stats = {
      total: applications.length,
      applied: 0,
      viewed: 0,
      screening: 0,
      interviewing: 0,
      offer: 0,
      rejected: 0,
      withdrawn: 0,
      no_response: 0,
      responseRate: 0,
      interviewRate: 0,
      offerRate: 0,
    };

    for (const app of applications) {
      stats[app.status as keyof typeof stats]++;
    }

    // Calculate rates
    if (stats.total > 0) {
      stats.responseRate = Math.round(
        ((stats.viewed + stats.screening + stats.interviewing + stats.offer + stats.rejected) /
          stats.total) *
          100
      );
      stats.interviewRate = Math.round(
        ((stats.interviewing + stats.offer) / stats.total) * 100
      );
      stats.offerRate = Math.round((stats.offer / stats.total) * 100);
    }

    return stats;
  },
});

// Update application status
export const updateStatus = mutation({
  args: {
    applicationId: v.id("applications"),
    status: v.union(
      v.literal("applied"),
      v.literal("viewed"),
      v.literal("screening"),
      v.literal("interviewing"),
      v.literal("offer"),
      v.literal("rejected"),
      v.literal("withdrawn"),
      v.literal("no_response")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.patch(args.applicationId, {
      status: args.status,
      notes: args.notes,
      lastStatusUpdate: now,
      updatedAt: now,
    });

    return args.applicationId;
  },
});

// Add interview date
export const addInterviewDate = mutation({
  args: {
    applicationId: v.id("applications"),
    interviewDate: v.number(),
  },
  handler: async (ctx, args) => {
    const application = await ctx.db.get(args.applicationId);
    if (!application) throw new Error("Application not found");

    const dates = application.interviewDates || [];
    dates.push(args.interviewDate);

    await ctx.db.patch(args.applicationId, {
      interviewDates: dates,
      status: "interviewing",
      updatedAt: Date.now(),
    });

    return args.applicationId;
  },
});

// Add notes to application
export const addNotes = mutation({
  args: {
    applicationId: v.id("applications"),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.applicationId, {
      notes: args.notes,
      updatedAt: Date.now(),
    });

    return args.applicationId;
  },
});

// Get recent applications (last 30 days)
export const getRecentApplications = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("appliedAt"), thirtyDaysAgo))
      .order("desc")
      .collect();

    return applications;
  },
});

// Get applications by company
export const getByCompany = query({
  args: {
    userId: v.id("users"),
    company: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("applications")
      .withIndex("by_company", (q) => q.eq("company", args.company))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
  },
});

// Delete application
export const deleteApplication = mutation({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.applicationId);
    return args.applicationId;
  },
});

// Get single application
export const getApplication = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.applicationId);
  },
});

// Get daily application count (for rate limiting)
export const getTodayApplicationCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("appliedAt"), startOfDay.getTime()))
      .collect();

    return applications.length;
  },
});
