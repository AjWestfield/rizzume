import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Start a new discovery session
export const startSession = mutation({
  args: {
    userId: v.id("users"),
    searchQuery: v.optional(v.string()),
    searchFilters: v.optional(v.object({
      locations: v.optional(v.array(v.string())),
      jobTypes: v.optional(v.array(v.string())),
      remote: v.optional(v.boolean()),
      salaryMin: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("discoverySessions", {
      userId: args.userId,
      searchQuery: args.searchQuery,
      searchFilters: args.searchFilters,
      jobsFound: 0,
      jobsQualified: 0,
      jobsAdded: 0,
      status: "running",
      startedAt: Date.now(),
    });

    return sessionId;
  },
});

// Update session progress
export const updateProgress = mutation({
  args: {
    sessionId: v.id("discoverySessions"),
    jobsFound: v.optional(v.number()),
    jobsQualified: v.optional(v.number()),
    jobsAdded: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { sessionId, ...updates } = args;

    // Filter out undefined values
    const filteredUpdates: Record<string, number> = {};
    if (updates.jobsFound !== undefined) filteredUpdates.jobsFound = updates.jobsFound;
    if (updates.jobsQualified !== undefined) filteredUpdates.jobsQualified = updates.jobsQualified;
    if (updates.jobsAdded !== undefined) filteredUpdates.jobsAdded = updates.jobsAdded;

    await ctx.db.patch(sessionId, filteredUpdates);

    return sessionId;
  },
});

// Complete session
export const completeSession = mutation({
  args: {
    sessionId: v.id("discoverySessions"),
    jobsFound: v.number(),
    jobsQualified: v.number(),
    jobsAdded: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      status: "completed",
      jobsFound: args.jobsFound,
      jobsQualified: args.jobsQualified,
      jobsAdded: args.jobsAdded,
      completedAt: Date.now(),
    });

    return args.sessionId;
  },
});

// Fail session
export const failSession = mutation({
  args: {
    sessionId: v.id("discoverySessions"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      status: "failed",
      error: args.error,
      completedAt: Date.now(),
    });

    return args.sessionId;
  },
});

// Cancel session
export const cancelSession = mutation({
  args: { sessionId: v.id("discoverySessions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      status: "cancelled",
      completedAt: Date.now(),
    });

    return args.sessionId;
  },
});

// Get session by ID
export const getSession = query({
  args: { sessionId: v.id("discoverySessions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sessionId);
  },
});

// Get user's discovery sessions
export const getUserSessions = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("discoverySessions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    if (args.limit) {
      return sessions.slice(0, args.limit);
    }

    return sessions;
  },
});

// Get active (running) session for user
export const getActiveSession = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("discoverySessions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "running"))
      .first();
  },
});

// Get discovery statistics
export const getDiscoveryStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("discoverySessions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const stats = {
      totalSessions: sessions.length,
      completedSessions: 0,
      totalJobsFound: 0,
      totalJobsQualified: 0,
      totalJobsAdded: 0,
      averageQualificationRate: 0,
    };

    for (const session of sessions) {
      if (session.status === "completed") {
        stats.completedSessions++;
        stats.totalJobsFound += session.jobsFound;
        stats.totalJobsQualified += session.jobsQualified;
        stats.totalJobsAdded += session.jobsAdded;
      }
    }

    if (stats.totalJobsFound > 0) {
      stats.averageQualificationRate = Math.round(
        (stats.totalJobsQualified / stats.totalJobsFound) * 100
      );
    }

    return stats;
  },
});
