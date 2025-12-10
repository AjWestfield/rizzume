import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new cover letter
export const create = mutation({
  args: {
    userId: v.id("users"),
    jobTitle: v.string(),
    companyName: v.string(),
    content: v.string(),
    jobDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const letterId = await ctx.db.insert("coverLetters", {
      userId: args.userId,
      jobTitle: args.jobTitle,
      companyName: args.companyName,
      content: args.content,
      jobDescription: args.jobDescription,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    return letterId;
  },
});

// Get all active cover letters for a user
export const getByUserId = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const coverLetters = await ctx.db
      .query("coverLetters")
      .withIndex("by_userId_active", (q) =>
        q.eq("userId", args.userId).eq("isActive", true)
      )
      .order("desc")
      .collect();

    return coverLetters;
  },
});

// Get a single cover letter by ID
export const getById = query({
  args: {
    letterId: v.id("coverLetters"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.letterId);
  },
});

// Update a cover letter
export const update = mutation({
  args: {
    letterId: v.id("coverLetters"),
    jobTitle: v.optional(v.string()),
    companyName: v.optional(v.string()),
    content: v.optional(v.string()),
    jobDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { letterId, ...updates } = args;

    // Filter out undefined values
    const cleanUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }

    await ctx.db.patch(letterId, {
      ...cleanUpdates,
      updatedAt: Date.now(),
    });

    return letterId;
  },
});

// Soft delete a cover letter
export const softDelete = mutation({
  args: {
    letterId: v.id("coverLetters"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.letterId, {
      isActive: false,
      updatedAt: Date.now(),
    });
    return args.letterId;
  },
});

// Hard delete a cover letter (permanent)
export const hardDelete = mutation({
  args: {
    letterId: v.id("coverLetters"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.letterId);
    return args.letterId;
  },
});
