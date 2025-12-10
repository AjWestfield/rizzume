import {
  BrowserSession,
  takeScreenshot,
  isSessionNearTimeout,
  waitForNavigation,
} from "./browserbase-client";
import type { AutoApplyProfile } from "@/types/user-profile";

/**
 * Job Application Data
 */
export interface JobToApply {
  id: string;
  title: string;
  company: string;
  applyUrl: string;
  platform: "linkedin" | "indeed" | "greenhouse" | "lever" | "other";
  coverLetter?: string;
}

/**
 * Application Result
 */
export interface ApplicationResult {
  success: boolean;
  jobId: string;
  platform: string;
  method?: "easy_apply" | "form_fill" | "redirect";
  screenshotBase64?: string;
  confirmationText?: string;
  error?: string;
  durationMs: number;
}

/**
 * Detect the platform from a URL
 */
export function detectPlatform(
  url: string
): "linkedin" | "indeed" | "greenhouse" | "lever" | "other" {
  const urlLower = url.toLowerCase();

  if (urlLower.includes("linkedin.com")) return "linkedin";
  if (urlLower.includes("indeed.com")) return "indeed";
  if (urlLower.includes("greenhouse.io") || urlLower.includes("boards.greenhouse.io"))
    return "greenhouse";
  if (urlLower.includes("lever.co") || urlLower.includes("jobs.lever.co"))
    return "lever";

  return "other";
}

/**
 * Apply to a single job using AI-powered form filling
 *
 * This is the main entry point for job applications.
 * It detects the platform and uses natural language commands
 * to fill out the application form.
 */
export async function applyToJob(
  session: BrowserSession,
  job: JobToApply,
  profile: AutoApplyProfile
): Promise<ApplicationResult> {
  const startTime = Date.now();
  const { stagehand } = session;

  try {
    console.log(`[Apply] Starting application for ${job.title} at ${job.company}`);

    // Navigate to the job application page
    await stagehand.page.goto(job.applyUrl, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await waitForNavigation(session, 10000);

    // Check for timeout
    if (isSessionNearTimeout(session)) {
      return {
        success: false,
        jobId: job.id,
        platform: job.platform,
        error: "Session timeout approaching",
        durationMs: Date.now() - startTime,
      };
    }

    // Detect platform if not specified
    const platform = job.platform || detectPlatform(job.applyUrl);

    // Route to platform-specific strategy
    let result: ApplicationResult;

    switch (platform) {
      case "indeed":
        result = await applyViaIndeed(session, job, profile);
        break;
      case "linkedin":
        result = await applyViaLinkedIn(session, job, profile);
        break;
      case "greenhouse":
        result = await applyViaGenericForm(session, job, profile, "greenhouse");
        break;
      case "lever":
        result = await applyViaGenericForm(session, job, profile, "lever");
        break;
      default:
        result = await applyViaGenericForm(session, job, profile, "other");
    }

    // Take confirmation screenshot
    try {
      result.screenshotBase64 = await takeScreenshot(session);
    } catch (e) {
      console.warn("[Apply] Could not take screenshot:", e);
    }

    result.durationMs = Date.now() - startTime;
    return result;
  } catch (error) {
    console.error(`[Apply] Error applying to ${job.title}:`, error);
    return {
      success: false,
      jobId: job.id,
      platform: job.platform,
      error: error instanceof Error ? error.message : "Unknown error",
      durationMs: Date.now() - startTime,
    };
  }
}

/**
 * Apply via Indeed
 *
 * Indeed has a simpler application flow:
 * 1. Click "Apply now" button
 * 2. Fill contact info (or use saved info)
 * 3. Upload resume
 * 4. Answer any screening questions
 * 5. Submit
 */
async function applyViaIndeed(
  session: BrowserSession,
  job: JobToApply,
  profile: AutoApplyProfile
): Promise<ApplicationResult> {
  const { stagehand } = session;

  try {
    // Step 1: Click Apply button
    await stagehand.act({
      action: "Click the 'Apply now' or 'Apply on company site' button",
    });

    await stagehand.page.waitForTimeout(2000);

    // Check if we're redirected to external site
    const currentUrl = stagehand.page.url();
    if (!currentUrl.includes("indeed.com")) {
      return {
        success: false,
        jobId: job.id,
        platform: "indeed",
        method: "redirect",
        error: "Redirected to external application site",
        durationMs: 0,
      };
    }

    // Step 2: Fill contact information
    await stagehand.act({
      action: `If there's an email field that's empty, fill it with: ${profile.email}`,
    });

    await stagehand.act({
      action: `If there's a phone number field that's empty, fill it with: ${profile.phone}`,
    });

    // Step 3: Handle resume upload
    await stagehand.act({
      action: "If there's a resume upload section, click to upload or use a previously uploaded resume",
    });

    // Step 4: Fill any additional required fields
    await fillCommonFields(session, profile);

    // Step 5: Handle screening questions
    await handleScreeningQuestions(session, profile);

    // Step 6: Submit the application
    await stagehand.act({
      action: "Click the 'Submit your application' or 'Apply' or 'Continue' button to submit the application",
    });

    await stagehand.page.waitForTimeout(3000);

    // Check for confirmation
    const confirmationText = await detectConfirmation(session);

    return {
      success: true,
      jobId: job.id,
      platform: "indeed",
      method: "easy_apply",
      confirmationText,
      durationMs: 0,
    };
  } catch (error) {
    return {
      success: false,
      jobId: job.id,
      platform: "indeed",
      error: error instanceof Error ? error.message : "Indeed application failed",
      durationMs: 0,
    };
  }
}

/**
 * Apply via LinkedIn
 *
 * LinkedIn Easy Apply flow:
 * 1. Click "Easy Apply" button
 * 2. Fill/verify contact info
 * 3. Upload resume (or use saved)
 * 4. Answer screening questions (multi-step)
 * 5. Review and submit
 */
async function applyViaLinkedIn(
  session: BrowserSession,
  job: JobToApply,
  profile: AutoApplyProfile
): Promise<ApplicationResult> {
  const { stagehand } = session;

  try {
    // Step 1: Click Easy Apply button
    const easyApplyClicked = await stagehand.act({
      action: "Click the 'Easy Apply' button on the job posting",
    });

    if (!easyApplyClicked) {
      // Try regular Apply button
      await stagehand.act({
        action: "Click the 'Apply' button on the job posting",
      });

      // Check if redirected
      await stagehand.page.waitForTimeout(2000);
      const currentUrl = stagehand.page.url();
      if (!currentUrl.includes("linkedin.com")) {
        return {
          success: false,
          jobId: job.id,
          platform: "linkedin",
          method: "redirect",
          error: "Redirected to external application site",
          durationMs: 0,
        };
      }
    }

    await stagehand.page.waitForTimeout(2000);

    // Step 2: Fill contact info
    await stagehand.act({
      action: `If there's a phone number field that's empty, fill it with: ${profile.phone}`,
    });

    await stagehand.act({
      action: `If there's an email field that's empty, fill it with: ${profile.email}`,
    });

    // Step 3: Handle multi-step form
    let maxSteps = 10;
    let currentStep = 0;

    while (currentStep < maxSteps) {
      // Check if we're on the final review/submit step
      const pageContent = await stagehand.page.content();
      const isReviewStep =
        pageContent.includes("Review your application") ||
        pageContent.includes("Submit application");

      if (isReviewStep) {
        // Submit the application
        await stagehand.act({
          action: "Click the 'Submit application' button",
        });
        break;
      }

      // Fill any visible form fields
      await fillCommonFields(session, profile);
      await handleScreeningQuestions(session, profile);

      // Try to click Next/Continue
      const nextClicked = await stagehand.act({
        action: "Click the 'Next' or 'Continue' or 'Review' button to proceed to the next step",
      });

      if (!nextClicked) {
        // No next button found, try submit
        await stagehand.act({
          action: "Click the 'Submit application' or 'Submit' button",
        });
        break;
      }

      await stagehand.page.waitForTimeout(1500);
      currentStep++;
    }

    await stagehand.page.waitForTimeout(3000);

    // Check for confirmation
    const confirmationText = await detectConfirmation(session);

    return {
      success: confirmationText !== null,
      jobId: job.id,
      platform: "linkedin",
      method: "easy_apply",
      confirmationText: confirmationText || "Application submitted",
      durationMs: 0,
    };
  } catch (error) {
    return {
      success: false,
      jobId: job.id,
      platform: "linkedin",
      error: error instanceof Error ? error.message : "LinkedIn application failed",
      durationMs: 0,
    };
  }
}

/**
 * Apply via generic form (Greenhouse, Lever, or other ATS)
 */
async function applyViaGenericForm(
  session: BrowserSession,
  job: JobToApply,
  profile: AutoApplyProfile,
  platform: string
): Promise<ApplicationResult> {
  const { stagehand } = session;

  try {
    // Fill all visible form fields
    await stagehand.act({
      action: `Fill the first name field with: ${profile.firstName}`,
    });

    await stagehand.act({
      action: `Fill the last name field with: ${profile.lastName}`,
    });

    await stagehand.act({
      action: `Fill the email field with: ${profile.email}`,
    });

    await stagehand.act({
      action: `Fill the phone field with: ${profile.phone}`,
    });

    // Handle resume upload
    await stagehand.act({
      action: "Click on the resume upload button or drag and drop area",
    });

    // Fill additional common fields
    await fillCommonFields(session, profile);

    // Handle cover letter if available
    if (job.coverLetter) {
      await stagehand.act({
        action: `If there's a cover letter text area, fill it with: ${job.coverLetter.substring(0, 500)}...`,
      });
    }

    // Handle any screening questions
    await handleScreeningQuestions(session, profile);

    // Submit the application
    await stagehand.act({
      action: "Click the 'Submit Application' or 'Apply' or 'Submit' button",
    });

    await stagehand.page.waitForTimeout(3000);

    const confirmationText = await detectConfirmation(session);

    return {
      success: confirmationText !== null,
      jobId: job.id,
      platform,
      method: "form_fill",
      confirmationText: confirmationText || "Application may have been submitted",
      durationMs: 0,
    };
  } catch (error) {
    return {
      success: false,
      jobId: job.id,
      platform,
      error: error instanceof Error ? error.message : "Form submission failed",
      durationMs: 0,
    };
  }
}

/**
 * Fill common form fields that appear across platforms
 */
async function fillCommonFields(
  session: BrowserSession,
  profile: AutoApplyProfile
): Promise<void> {
  const { stagehand } = session;

  // Location fields
  if (profile.city) {
    await stagehand.act({
      action: `If there's a city field that's empty, fill it with: ${profile.city}`,
    });
  }

  if (profile.state) {
    await stagehand.act({
      action: `If there's a state field that's empty, fill it with: ${profile.state}`,
    });
  }

  if (profile.zipCode) {
    await stagehand.act({
      action: `If there's a zip code or postal code field that's empty, fill it with: ${profile.zipCode}`,
    });
  }

  // Professional links
  if (profile.linkedinUrl) {
    await stagehand.act({
      action: `If there's a LinkedIn URL field that's empty, fill it with: ${profile.linkedinUrl}`,
    });
  }

  if (profile.portfolioUrl) {
    await stagehand.act({
      action: `If there's a portfolio or website URL field that's empty, fill it with: ${profile.portfolioUrl}`,
    });
  }

  if (profile.githubUrl) {
    await stagehand.act({
      action: `If there's a GitHub URL field that's empty, fill it with: ${profile.githubUrl}`,
    });
  }
}

/**
 * Handle common screening questions
 */
async function handleScreeningQuestions(
  session: BrowserSession,
  profile: AutoApplyProfile
): Promise<void> {
  const { stagehand } = session;

  // Work authorization
  if (profile.authorizedToWork) {
    await stagehand.act({
      action: `If there's a question about authorization to work in the US, select 'Yes'`,
    });
  }

  // Sponsorship
  await stagehand.act({
    action: `If there's a question about requiring visa sponsorship, select '${profile.requiresSponsorship ? "Yes" : "No"}'`,
  });

  // Start date / availability
  const startDateText =
    profile.startDateType === "immediately"
      ? "immediately"
      : profile.startDateType === "two_weeks"
        ? "in 2 weeks"
        : profile.startDateType === "one_month"
          ? "in 1 month"
          : "flexible";

  await stagehand.act({
    action: `If there's a question about start date or availability, indicate: ${startDateText}`,
  });

  // Salary expectations
  if (profile.salaryExpectation) {
    await stagehand.act({
      action: `If there's a salary expectation field, enter: ${profile.salaryExpectation}`,
    });
  } else if (profile.salaryMin) {
    await stagehand.act({
      action: `If there's a salary expectation field, enter: ${profile.salaryMin}`,
    });
  }

  // Years of experience
  if (profile.yearsOfExperience) {
    await stagehand.act({
      action: `If there's a years of experience field, enter: ${profile.yearsOfExperience}`,
    });
  }

  // Handle yes/no questions by answering affirmatively when safe
  await stagehand.act({
    action: `For any unanswered yes/no questions about qualifications, select 'Yes' if it seems beneficial`,
  });

  // Handle required dropdowns by selecting the first reasonable option
  await stagehand.act({
    action: `For any required dropdown fields that are empty, select the first reasonable option`,
  });
}

/**
 * Detect confirmation message after submission
 */
async function detectConfirmation(
  session: BrowserSession
): Promise<string | null> {
  const { stagehand } = session;

  try {
    const result = await stagehand.extract({
      instruction:
        "Extract any confirmation message that indicates the application was submitted successfully. Look for text like 'Application submitted', 'Thank you for applying', 'Your application has been received', etc. Return null if no confirmation is found.",
      schema: {
        type: "object",
        properties: {
          confirmationMessage: {
            type: "string",
            description: "The confirmation message text",
          },
          isConfirmed: {
            type: "boolean",
            description: "Whether a confirmation was found",
          },
        },
      },
    });

    if (result && typeof result === "object" && "isConfirmed" in result) {
      return result.isConfirmed
        ? (result.confirmationMessage as string) || "Application submitted"
        : null;
    }

    return null;
  } catch {
    // If extraction fails, check page content manually
    const pageText = await stagehand.page.textContent("body");
    const confirmationPatterns = [
      "application submitted",
      "thank you for applying",
      "application received",
      "successfully applied",
      "application sent",
    ];

    for (const pattern of confirmationPatterns) {
      if (pageText?.toLowerCase().includes(pattern)) {
        return pattern;
      }
    }

    return null;
  }
}
