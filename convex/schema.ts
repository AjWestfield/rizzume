import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User profiles with resume data and job board credentials
  users: defineTable({
    authId: v.optional(v.string()), // Link to Convex Auth user
    clerkId: v.optional(v.string()), // For future Clerk integration (legacy)
    email: v.string(),
    name: v.optional(v.string()),

    // Personal info (enhanced for auto-apply)
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()), // Profile image from Clerk
    phone: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    country: v.optional(v.string()),
    zipCode: v.optional(v.string()),

    // Professional links
    linkedinUrl: v.optional(v.string()),
    portfolioUrl: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    professionalLinksSkipped: v.optional(v.boolean()),

    // Work authorization
    workAuthorization: v.optional(v.object({
      authorizedToWork: v.boolean(),
      requiresSponsorship: v.boolean(),
      visaStatus: v.optional(v.string()),
    })),

    // Availability
    availability: v.optional(v.object({
      startDateType: v.string(), // "immediately", "two_weeks", "one_month", "custom"
      customStartDate: v.optional(v.number()),
      noticePeriodWeeks: v.optional(v.number()),
    })),

    // Profile completeness (0-100)
    profileCompleteness: v.optional(v.number()),

    // Resume data
    resumeText: v.optional(v.string()), // Original parsed resume text
    optimizedResumeText: v.optional(v.string()), // AI-optimized resume
    resumeFileUrl: v.optional(v.string()), // URL to stored resume file

    // Parsed resume components for matching
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

    // Job preferences
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

    // Job board credentials (encrypted)
    jobBoardCredentials: v.optional(v.array(v.object({
      platform: v.string(), // "linkedin", "indeed", "glassdoor", etc.
      encryptedUsername: v.string(),
      encryptedPassword: v.string(),
      lastVerified: v.optional(v.number()),
    }))),

    // Settings
    autoApplyEnabled: v.optional(v.boolean()),
    dailyApplicationLimit: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_clerkId", ["clerkId"])
    .index("by_authId", ["authId"]),

  // Job queue - jobs discovered for user to review/approve
  jobQueue: defineTable({
    userId: v.id("users"),

    // Job details
    jobId: v.string(), // External job ID from source
    jobTitle: v.string(),
    company: v.string(),
    location: v.optional(v.string()),
    salary: v.optional(v.string()),
    jobType: v.optional(v.string()), // "full-time", "contract", etc.
    remote: v.optional(v.boolean()),
    description: v.optional(v.string()),
    requirements: v.optional(v.array(v.string())),

    // Application details
    applyLink: v.string(),
    source: v.string(), // "linkedin", "indeed", "jsearch", etc.

    // AI analysis
    matchScore: v.number(), // 0-100
    matchAnalysis: v.optional(v.string()), // AI explanation of match
    matchedSkills: v.optional(v.array(v.string())),
    missingSkills: v.optional(v.array(v.string())),

    // Generated content
    coverLetter: v.optional(v.string()),
    customAnswers: v.optional(v.array(v.object({
      question: v.string(),
      answer: v.string(),
    }))),

    // Status workflow
    status: v.union(
      v.literal("discovered"), // AI found this job
      v.literal("saved"), // User saved this job manually
      v.literal("pending"), // Awaiting user review
      v.literal("approved"), // User approved for application
      v.literal("rejected"), // User rejected
      v.literal("applying"), // Currently being applied to
      v.literal("applied"), // Successfully applied
      v.literal("failed") // Application failed
    ),

    // Automation tracking
    applicationAttempts: v.optional(v.number()),
    lastAttemptError: v.optional(v.string()),
    appliedAt: v.optional(v.number()),

    // Metadata
    discoveredAt: v.number(),
    updatedAt: v.number(),
    expiresAt: v.optional(v.number()), // Job listing expiration
  })
    .index("by_userId", ["userId"])
    .index("by_userId_status", ["userId", "status"])
    .index("by_status", ["status"])
    .index("by_matchScore", ["matchScore"]),

  // Application history - completed applications for tracking
  applications: defineTable({
    userId: v.id("users"),
    jobQueueId: v.optional(v.id("jobQueue")), // Reference to original queue item

    // Job snapshot (in case job is deleted from queue)
    jobId: v.string(),
    jobTitle: v.string(),
    company: v.string(),
    location: v.optional(v.string()),
    applyLink: v.string(),
    source: v.string(),

    // Application details
    appliedAt: v.number(),
    applicationMethod: v.union(
      v.literal("auto"), // Automated via browser automation
      v.literal("manual"), // User clicked through
      v.literal("easy_apply") // Platform's easy apply feature
    ),

    // Cover letter and materials used
    coverLetterUsed: v.optional(v.string()),
    resumeVersionUsed: v.optional(v.string()), // "original" or "optimized"

    // Status tracking
    status: v.union(
      v.literal("applied"), // Application submitted
      v.literal("viewed"), // Employer viewed application
      v.literal("screening"), // In screening process
      v.literal("interviewing"), // Interview scheduled/in progress
      v.literal("offer"), // Received offer
      v.literal("rejected"), // Application rejected
      v.literal("withdrawn"), // User withdrew application
      v.literal("no_response") // No response after X days
    ),

    // Communication tracking
    lastStatusUpdate: v.optional(v.number()),
    notes: v.optional(v.string()),
    interviewDates: v.optional(v.array(v.number())),

    // Analytics
    matchScore: v.optional(v.number()), // Score at time of application

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_status", ["userId", "status"])
    .index("by_company", ["company"])
    .index("by_appliedAt", ["appliedAt"]),

  // Discovery sessions - track AI job discovery runs
  discoverySessions: defineTable({
    userId: v.id("users"),

    // Search parameters used
    searchQuery: v.optional(v.string()),
    searchFilters: v.optional(v.object({
      locations: v.optional(v.array(v.string())),
      jobTypes: v.optional(v.array(v.string())),
      remote: v.optional(v.boolean()),
      salaryMin: v.optional(v.number()),
    })),

    // Results
    jobsFound: v.number(),
    jobsQualified: v.number(), // Jobs with 70%+ match
    jobsAdded: v.number(), // Jobs added to queue

    // Status
    status: v.union(
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    error: v.optional(v.string()),

    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),

  // Professional references for job applications
  references: defineTable({
    userId: v.id("users"),
    name: v.string(),
    title: v.string(),
    company: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    relationship: v.string(), // "manager", "colleague", "mentor", etc.
    order: v.number(), // Display order
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_active", ["userId", "isActive"]),

  // User documents (resumes, cover letter templates)
  documents: defineTable({
    userId: v.id("users"),
    type: v.string(), // "resume", "cover_letter_template", "portfolio"
    name: v.string(),
    fileId: v.optional(v.id("_storage")), // Convex storage file ID
    fileUrl: v.optional(v.string()), // External URL or signed URL
    textContent: v.optional(v.string()), // Extracted text content
    isDefault: v.optional(v.boolean()), // Default document for this type
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_type", ["userId", "type"])
    .index("by_userId_type_default", ["userId", "type", "isDefault"]),

  // Cover letters - generated cover letters for job applications
  coverLetters: defineTable({
    userId: v.id("users"),
    jobTitle: v.string(),
    companyName: v.string(),
    content: v.string(),
    jobDescription: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_active", ["userId", "isActive"]),

  // Auto-apply sessions - track automated application runs
  autoApplySessions: defineTable({
    userId: v.id("users"),

    // Jobs being applied to
    jobIds: v.array(v.id("jobQueue")),
    totalJobs: v.number(),

    // Progress tracking
    currentJobIndex: v.number(),
    currentJobId: v.optional(v.id("jobQueue")),
    currentPhase: v.optional(v.string()), // "filling_form", "submitting", etc.

    // Results
    successCount: v.number(),
    failedCount: v.number(),
    skippedCount: v.number(),

    // Detailed results per job
    results: v.optional(v.array(v.object({
      jobId: v.id("jobQueue"),
      status: v.string(), // "success", "failed", "skipped"
      method: v.optional(v.string()), // "easy_apply", "form_fill", "email"
      error: v.optional(v.string()),
      formFieldsFilled: v.optional(v.number()),
      appliedAt: v.optional(v.number()),
    }))),

    // Status
    status: v.union(
      v.literal("running"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    error: v.optional(v.string()),

    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_userId_status", ["userId", "status"]),

  // Application queue - for cron-based processing
  // Each job approved for auto-apply gets an entry here
  applicationQueue: defineTable({
    userId: v.id("users"),
    jobQueueId: v.id("jobQueue"), // Reference to the job in jobQueue

    // Status for cron processing
    status: v.union(
      v.literal("pending"),      // Waiting to be processed
      v.literal("in_progress"),  // Currently being processed by cron
      v.literal("completed"),    // Successfully applied
      v.literal("failed"),       // Failed after max attempts
      v.literal("skipped")       // Skipped (e.g., job expired)
    ),

    // Retry tracking
    attempts: v.number(),
    maxAttempts: v.number(), // Default 3
    lastAttemptAt: v.optional(v.number()),
    nextAttemptAfter: v.optional(v.number()), // For exponential backoff

    // Browser session tracking
    browserSessionId: v.optional(v.string()),

    // Result data
    result: v.optional(v.object({
      success: v.boolean(),
      method: v.optional(v.string()), // "easy_apply", "form_fill", "redirect"
      confirmationText: v.optional(v.string()),
      screenshotUrl: v.optional(v.string()),
      error: v.optional(v.string()),
      durationMs: v.optional(v.number()),
    })),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_userId_status", ["userId", "status"])
    .index("by_pending_oldest", ["status", "createdAt"]) // For cron to pick oldest pending
    .index("by_next_attempt", ["status", "nextAttemptAfter"]), // For retry scheduling
});
