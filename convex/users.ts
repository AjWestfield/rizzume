import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Internal mutation for Clerk webhook - upsert user
export const upsertFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if user exists by clerkId
    let user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", args.clerkId))
      .first();

    if (user) {
      // Update existing user
      await ctx.db.patch(user._id, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        name: args.firstName && args.lastName
          ? `${args.firstName} ${args.lastName}`.trim()
          : args.firstName || args.lastName,
        imageUrl: args.imageUrl,
        updatedAt: now,
      });
      return user._id;
    }

    // Check if user exists by email (linking existing account)
    user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (user) {
      // Link existing user to Clerk
      await ctx.db.patch(user._id, {
        authId: args.clerkId,
        firstName: args.firstName,
        lastName: args.lastName,
        name: args.firstName && args.lastName
          ? `${args.firstName} ${args.lastName}`.trim()
          : args.firstName || args.lastName,
        imageUrl: args.imageUrl,
        updatedAt: now,
      });
      return user._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      authId: args.clerkId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      name: args.firstName && args.lastName
        ? `${args.firstName} ${args.lastName}`.trim()
        : args.firstName || args.lastName,
      imageUrl: args.imageUrl,
      autoApplyEnabled: false,
      dailyApplicationLimit: 25,
      profileCompleteness: 0,
      createdAt: now,
      updatedAt: now,
    });

    return userId;
  },
});

// Internal mutation for Clerk webhook - delete user
export const deleteByClerkId = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", args.clerkId))
      .first();

    if (user) {
      await ctx.db.delete(user._id);
      return true;
    }
    return false;
  },
});

// Create a new user
export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      return existing._id;
    }

    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      clerkId: args.clerkId,
      autoApplyEnabled: false,
      dailyApplicationLimit: 25,
      createdAt: now,
      updatedAt: now,
    });

    return userId;
  },
});

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Get user by ID
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Update user resume data
export const updateResumeData = mutation({
  args: {
    userId: v.id("users"),
    resumeText: v.optional(v.string()),
    optimizedResumeText: v.optional(v.string()),
    resumeFileUrl: v.optional(v.string()),
    parsedSkills: v.optional(v.array(v.string())),
    parsedExperience: v.optional(v.array(v.object({
      title: v.string(),
      company: v.string(),
      duration: v.optional(v.string()),
      description: v.optional(v.string()),
    }))),
    parsedEducation: v.optional(v.array(v.object({
      degree: v.string(),
      institution: v.string(),
      year: v.optional(v.string()),
    }))),
  },
  handler: async (ctx, args) => {
    const { userId, ...data } = args;

    await ctx.db.patch(userId, {
      ...data,
      updatedAt: Date.now(),
    });

    return userId;
  },
});

// Update job preferences
export const updateJobPreferences = mutation({
  args: {
    userId: v.id("users"),
    preferredJobTitles: v.optional(v.array(v.string())),
    preferredLocations: v.optional(v.array(v.string())),
    remotePreference: v.optional(v.union(
      v.literal("remote"),
      v.literal("hybrid"),
      v.literal("onsite"),
      v.literal("any")
    )),
    salaryMin: v.optional(v.number()),
    salaryMax: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, ...preferences } = args;

    await ctx.db.patch(userId, {
      ...preferences,
      updatedAt: Date.now(),
    });

    return userId;
  },
});

// Add job board credentials
export const addJobBoardCredential = mutation({
  args: {
    userId: v.id("users"),
    platform: v.string(),
    encryptedUsername: v.string(),
    encryptedPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const credentials = user.jobBoardCredentials || [];

    // Update existing or add new
    const existingIndex = credentials.findIndex(
      (c) => c.platform === args.platform
    );

    const newCredential = {
      platform: args.platform,
      encryptedUsername: args.encryptedUsername,
      encryptedPassword: args.encryptedPassword,
      lastVerified: Date.now(),
    };

    if (existingIndex >= 0) {
      credentials[existingIndex] = newCredential;
    } else {
      credentials.push(newCredential);
    }

    await ctx.db.patch(args.userId, {
      jobBoardCredentials: credentials,
      updatedAt: Date.now(),
    });

    return args.userId;
  },
});

// Remove job board credentials
export const removeJobBoardCredential = mutation({
  args: {
    userId: v.id("users"),
    platform: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const credentials = (user.jobBoardCredentials || []).filter(
      (c) => c.platform !== args.platform
    );

    await ctx.db.patch(args.userId, {
      jobBoardCredentials: credentials,
      updatedAt: Date.now(),
    });

    return args.userId;
  },
});

// Update auto-apply settings
export const updateAutoApplySettings = mutation({
  args: {
    userId: v.id("users"),
    autoApplyEnabled: v.optional(v.boolean()),
    dailyApplicationLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, ...settings } = args;

    await ctx.db.patch(userId, {
      ...settings,
      updatedAt: Date.now(),
    });

    return userId;
  },
});

// Helper function to calculate profile completeness
function calculateProfileCompleteness(user: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  professionalLinksSkipped?: boolean;
  workAuthorization?: { authorizedToWork?: boolean };
  availability?: { startDateType?: string };
}): number {
  let percentage = 0;

  // Personal info (40%)
  const hasPersonalInfo = !!(
    user.firstName &&
    user.lastName &&
    user.email &&
    user.phone
  );
  if (hasPersonalInfo) percentage += 40;

  // Professional links (20%) - can be skipped
  const hasProfessionalLinks = !!(
    user.linkedinUrl ||
    user.portfolioUrl ||
    user.githubUrl ||
    user.professionalLinksSkipped
  );
  if (hasProfessionalLinks) percentage += 20;

  // Work authorization (20%)
  const hasWorkAuth = user.workAuthorization?.authorizedToWork !== undefined;
  if (hasWorkAuth) percentage += 20;

  // Availability (20%)
  const hasAvailability = !!user.availability?.startDateType;
  if (hasAvailability) percentage += 20;

  return percentage;
}

// Sync full profile from localStorage (upsert by email)
export const syncProfile = mutation({
  args: {
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    country: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    portfolioUrl: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    professionalLinksSkipped: v.optional(v.boolean()),
    workAuthorization: v.optional(
      v.object({
        authorizedToWork: v.boolean(),
        requiresSponsorship: v.boolean(),
        visaStatus: v.optional(v.string()),
      })
    ),
    availability: v.optional(
      v.object({
        startDateType: v.string(),
        customStartDate: v.optional(v.number()),
        noticePeriodWeeks: v.optional(v.number()),
      })
    ),
    resumeText: v.optional(v.string()),
    parsedSkills: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { email, ...profileData } = args;

    // Find existing user by email
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    const now = Date.now();

    // Filter out undefined values
    const filteredData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(profileData)) {
      if (value !== undefined) {
        filteredData[key] = value;
      }
    }

    if (existingUser) {
      // Update existing user
      const updatedUser = { ...existingUser, ...filteredData };
      const percentage = calculateProfileCompleteness(updatedUser);

      await ctx.db.patch(existingUser._id, {
        ...filteredData,
        profileCompleteness: percentage,
        updatedAt: now,
      });

      return { userId: existingUser._id, isNew: false };
    } else {
      // Create new user
      const newUser = { email, ...filteredData };
      const percentage = calculateProfileCompleteness(newUser);

      const userId = await ctx.db.insert("users", {
        email,
        ...filteredData,
        profileCompleteness: percentage,
        autoApplyEnabled: false,
        dailyApplicationLimit: 25,
        createdAt: now,
        updatedAt: now,
      });

      return { userId, isNew: true };
    }
  },
});

// Get user by auth ID
export const getUserByAuthId = query({
  args: { authId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", args.authId))
      .first();
  },
});

// Get or create user from auth (called after sign-in/sign-up)
export const getOrCreateUserFromAuth = mutation({
  args: {
    authId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if user already exists by authId
    let user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", args.authId))
      .first();

    if (user) {
      return { userId: user._id, isNew: false };
    }

    // Check if user exists by email (linking existing account)
    user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (user) {
      // Link existing user to auth
      await ctx.db.patch(user._id, {
        authId: args.authId,
        updatedAt: now,
      });
      return { userId: user._id, isNew: false };
    }

    // Create new user
    const [firstName, ...lastNameParts] = (args.name || "").split(" ");
    const lastName = lastNameParts.join(" ");

    const userId = await ctx.db.insert("users", {
      authId: args.authId,
      email: args.email,
      name: args.name,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      autoApplyEnabled: false,
      dailyApplicationLimit: 25,
      profileCompleteness: 0,
      createdAt: now,
      updatedAt: now,
    });

    return { userId, isNew: true };
  },
});
