import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Required fields for auto-apply functionality
const REQUIRED_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "city",
  "state",
  "country",
  "resumeText",
] as const;

// Calculate profile completeness percentage
function calculateCompleteness(profile: Record<string, unknown>): {
  percentage: number;
  missingFields: string[];
  completedFields: string[];
} {
  const completedFields: string[] = [];
  const missingFields: string[] = [];

  for (const field of REQUIRED_FIELDS) {
    const value = profile[field];
    if (value && (typeof value !== "string" || value.trim() !== "")) {
      completedFields.push(field);
    } else {
      missingFields.push(field);
    }
  }

  // Check work authorization
  if (profile.workAuthorization) {
    completedFields.push("workAuthorization");
  } else {
    missingFields.push("workAuthorization");
  }

  // Check availability
  if (profile.availability) {
    completedFields.push("availability");
  } else {
    missingFields.push("availability");
  }

  const totalFields = REQUIRED_FIELDS.length + 2; // +2 for workAuth and availability
  const percentage = Math.round((completedFields.length / totalFields) * 100);

  return { percentage, missingFields, completedFields };
}

// ============================================
// USER PROFILE QUERIES
// ============================================

// Get user by email
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

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
    workAuthorization: v.optional(v.object({
      authorizedToWork: v.boolean(),
      requiresSponsorship: v.boolean(),
      visaStatus: v.optional(v.string()),
    })),
    availability: v.optional(v.object({
      startDateType: v.string(),
      customStartDate: v.optional(v.number()),
      noticePeriodWeeks: v.optional(v.number()),
    })),
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
      const { percentage } = calculateCompleteness(updatedUser);

      await ctx.db.patch(existingUser._id, {
        ...filteredData,
        profileCompleteness: percentage,
        updatedAt: now,
      });

      return { userId: existingUser._id, isNew: false };
    } else {
      // Create new user
      const newUser = { email, ...filteredData };
      const { percentage } = calculateCompleteness(newUser);

      const userId = await ctx.db.insert("users", {
        email,
        ...filteredData,
        profileCompleteness: percentage,
        createdAt: now,
        updatedAt: now,
      });

      return { userId, isNew: true };
    }
  },
});

// Get profile completeness
export const getProfileCompleteness = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return { percentage: 0, missingFields: [...REQUIRED_FIELDS], completedFields: [], isReadyForAutoApply: false };
    }

    const { percentage, missingFields, completedFields } = calculateCompleteness(user);
    return {
      percentage,
      missingFields,
      completedFields,
      isReadyForAutoApply: percentage >= 80,
    };
  },
});

// Get full profile for auto-apply
export const getFullProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    // Get active references
    const references = await ctx.db
      .query("references")
      .withIndex("by_userId_active", (q) =>
        q.eq("userId", args.userId).eq("isActive", true)
      )
      .collect();

    // Get default resume
    const defaultResume = await ctx.db
      .query("documents")
      .withIndex("by_userId_type", (q) =>
        q.eq("userId", args.userId).eq("type", "resume")
      )
      .filter((q) => q.eq(q.field("isDefault"), true))
      .first();

    // Get default cover letter template
    const coverLetterTemplate = await ctx.db
      .query("documents")
      .withIndex("by_userId_type", (q) =>
        q.eq("userId", args.userId).eq("type", "cover_letter_template")
      )
      .filter((q) => q.eq(q.field("isDefault"), true))
      .first();

    const { percentage, missingFields, completedFields } = calculateCompleteness(user);

    return {
      ...user,
      references: references.sort((a, b) => a.order - b.order),
      defaultResume,
      coverLetterTemplate,
      profileCompleteness: {
        percentage,
        missingFields,
        completedFields,
        isReadyForAutoApply: percentage >= 80,
      },
    };
  },
});

// ============================================
// USER PROFILE MUTATIONS
// ============================================

// Create or get user
export const getOrCreate = mutation({
  args: { email: v.string(), name: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      return existing._id;
    }

    const now = Date.now();
    return await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      profileCompleteness: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update personal info
export const updatePersonalInfo = mutation({
  args: {
    userId: v.id("users"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    country: v.optional(v.string()),
    zipCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Filter out undefined values
    const filteredUpdates: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        filteredUpdates[key] = value;
      }
    }

    // Calculate new completeness
    const updatedUser = { ...user, ...filteredUpdates };
    const { percentage } = calculateCompleteness(updatedUser);

    await ctx.db.patch(userId, {
      ...filteredUpdates,
      profileCompleteness: percentage,
      updatedAt: Date.now(),
    });

    return { success: true, profileCompleteness: percentage };
  },
});

// Update professional links
export const updateProfessionalLinks = mutation({
  args: {
    userId: v.id("users"),
    linkedinUrl: v.optional(v.string()),
    portfolioUrl: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const filteredUpdates: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        filteredUpdates[key] = value;
      }
    }

    await ctx.db.patch(userId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Update work authorization
export const updateWorkAuthorization = mutation({
  args: {
    userId: v.id("users"),
    authorizedToWork: v.boolean(),
    requiresSponsorship: v.boolean(),
    visaStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...workAuth } = args;
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const updatedUser = {
      ...user,
      workAuthorization: workAuth,
    };
    const { percentage } = calculateCompleteness(updatedUser);

    await ctx.db.patch(userId, {
      workAuthorization: workAuth,
      profileCompleteness: percentage,
      updatedAt: Date.now(),
    });

    return { success: true, profileCompleteness: percentage };
  },
});

// Update availability
export const updateAvailability = mutation({
  args: {
    userId: v.id("users"),
    startDateType: v.string(),
    customStartDate: v.optional(v.number()),
    noticePeriodWeeks: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, ...availability } = args;
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const updatedUser = {
      ...user,
      availability,
    };
    const { percentage } = calculateCompleteness(updatedUser);

    await ctx.db.patch(userId, {
      availability,
      profileCompleteness: percentage,
      updatedAt: Date.now(),
    });

    return { success: true, profileCompleteness: percentage };
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
    const { userId, ...prefs } = args;
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const filteredUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(prefs)) {
      if (value !== undefined) {
        filteredUpdates[key] = value;
      }
    }

    await ctx.db.patch(userId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Update resume data
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
    const { userId, ...resumeData } = args;
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const filteredUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(resumeData)) {
      if (value !== undefined) {
        filteredUpdates[key] = value;
      }
    }

    const updatedUser = { ...user, ...filteredUpdates };
    const { percentage } = calculateCompleteness(updatedUser);

    await ctx.db.patch(userId, {
      ...filteredUpdates,
      profileCompleteness: percentage,
      updatedAt: Date.now(),
    });

    return { success: true, profileCompleteness: percentage };
  },
});

// ============================================
// REFERENCES
// ============================================

// Get user's references
export const getReferences = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const references = await ctx.db
      .query("references")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    return references.sort((a, b) => a.order - b.order);
  },
});

// Add reference
export const addReference = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    title: v.string(),
    company: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    relationship: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, ...referenceData } = args;

    // Get current count for order
    const existingRefs = await ctx.db
      .query("references")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const now = Date.now();
    return await ctx.db.insert("references", {
      userId,
      ...referenceData,
      order: existingRefs.length,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update reference
export const updateReference = mutation({
  args: {
    referenceId: v.id("references"),
    name: v.optional(v.string()),
    title: v.optional(v.string()),
    company: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    relationship: v.optional(v.string()),
    order: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { referenceId, ...updates } = args;
    const reference = await ctx.db.get(referenceId);
    if (!reference) throw new Error("Reference not found");

    const filteredUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        filteredUpdates[key] = value;
      }
    }

    await ctx.db.patch(referenceId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Delete reference
export const deleteReference = mutation({
  args: { referenceId: v.id("references") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.referenceId);
    return { success: true };
  },
});

// ============================================
// DOCUMENTS
// ============================================

// Get user's documents
export const getDocuments = query({
  args: {
    userId: v.id("users"),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.type) {
      return await ctx.db
        .query("documents")
        .withIndex("by_userId_type", (q) =>
          q.eq("userId", args.userId).eq("type", args.type!)
        )
        .collect();
    }
    return await ctx.db
      .query("documents")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Add document
export const addDocument = mutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    name: v.string(),
    fileId: v.optional(v.id("_storage")),
    fileUrl: v.optional(v.string()),
    textContent: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, isDefault, ...docData } = args;

    // If this is being set as default, unset other defaults of same type
    if (isDefault) {
      const existingDocs = await ctx.db
        .query("documents")
        .withIndex("by_userId_type", (q) =>
          q.eq("userId", userId).eq("type", args.type)
        )
        .collect();

      for (const doc of existingDocs) {
        if (doc.isDefault) {
          await ctx.db.patch(doc._id, { isDefault: false });
        }
      }
    }

    const now = Date.now();
    return await ctx.db.insert("documents", {
      userId,
      ...docData,
      isDefault: isDefault ?? false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update document
export const updateDocument = mutation({
  args: {
    documentId: v.id("documents"),
    name: v.optional(v.string()),
    textContent: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { documentId, isDefault, ...updates } = args;
    const document = await ctx.db.get(documentId);
    if (!document) throw new Error("Document not found");

    // If setting as default, unset other defaults
    if (isDefault) {
      const existingDocs = await ctx.db
        .query("documents")
        .withIndex("by_userId_type", (q) =>
          q.eq("userId", document.userId).eq("type", document.type)
        )
        .collect();

      for (const doc of existingDocs) {
        if (doc._id !== documentId && doc.isDefault) {
          await ctx.db.patch(doc._id, { isDefault: false });
        }
      }
    }

    const filteredUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        filteredUpdates[key] = value;
      }
    }

    await ctx.db.patch(documentId, {
      ...filteredUpdates,
      isDefault,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Delete document
export const deleteDocument = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (document?.fileId) {
      await ctx.storage.delete(document.fileId);
    }
    await ctx.db.delete(args.documentId);
    return { success: true };
  },
});

// ============================================
// AUTO-APPLY SESSIONS
// ============================================

// Get active auto-apply session
export const getActiveAutoApplySession = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("autoApplySessions")
      .withIndex("by_userId_status", (q) =>
        q.eq("userId", args.userId).eq("status", "running")
      )
      .first();
  },
});

// Create auto-apply session
export const createAutoApplySession = mutation({
  args: {
    userId: v.id("users"),
    jobIds: v.array(v.id("jobQueue")),
  },
  handler: async (ctx, args) => {
    // Check for existing running session
    const existingSession = await ctx.db
      .query("autoApplySessions")
      .withIndex("by_userId_status", (q) =>
        q.eq("userId", args.userId).eq("status", "running")
      )
      .first();

    if (existingSession) {
      throw new Error("An auto-apply session is already running");
    }

    const now = Date.now();
    return await ctx.db.insert("autoApplySessions", {
      userId: args.userId,
      jobIds: args.jobIds,
      totalJobs: args.jobIds.length,
      currentJobIndex: 0,
      successCount: 0,
      failedCount: 0,
      skippedCount: 0,
      status: "running",
      startedAt: now,
    });
  },
});

// Update auto-apply session progress
export const updateAutoApplyProgress = mutation({
  args: {
    sessionId: v.id("autoApplySessions"),
    currentJobIndex: v.optional(v.number()),
    currentJobId: v.optional(v.id("jobQueue")),
    currentPhase: v.optional(v.string()),
    successCount: v.optional(v.number()),
    failedCount: v.optional(v.number()),
    skippedCount: v.optional(v.number()),
    result: v.optional(v.object({
      jobId: v.id("jobQueue"),
      status: v.string(),
      method: v.optional(v.string()),
      error: v.optional(v.string()),
      formFieldsFilled: v.optional(v.number()),
      appliedAt: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const { sessionId, result, ...updates } = args;
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Session not found");

    const filteredUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        filteredUpdates[key] = value;
      }
    }

    // Add result to results array if provided
    if (result) {
      const existingResults = session.results || [];
      filteredUpdates.results = [...existingResults, result];
    }

    await ctx.db.patch(sessionId, filteredUpdates);
    return { success: true };
  },
});

// Complete auto-apply session
export const completeAutoApplySession = mutation({
  args: {
    sessionId: v.id("autoApplySessions"),
    status: v.union(
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      status: args.status,
      error: args.error,
      completedAt: Date.now(),
    });
    return { success: true };
  },
});

// Get auto-apply session history
export const getAutoApplyHistory = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("autoApplySessions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit ?? 10);
    return sessions;
  },
});
