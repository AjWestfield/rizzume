/**
 * Browser Automation Module
 *
 * Exports all browser automation functionality for job applications.
 */

// Client & session management
export {
  createBrowserSession,
  closeBrowserSession,
  getSessionDuration,
  isSessionNearTimeout,
  takeScreenshot,
  getCurrentUrl,
  waitForNavigation,
  type BrowserSession,
  type BrowserbaseConfig,
  type Stagehand,
} from "./browserbase-client";

// Job application
export {
  applyToJob,
  detectPlatform,
  type JobToApply,
  type ApplicationResult,
} from "./apply-to-job";

// Types
export * from "./types";
