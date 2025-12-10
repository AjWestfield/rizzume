import { Stagehand } from "@browserbasehq/stagehand";

/**
 * Browserbase + Stagehand Client
 *
 * AI-powered browser automation that works on Vercel serverless.
 * Uses natural language commands instead of brittle CSS selectors.
 *
 * @see https://docs.browserbase.com/introduction/stagehand
 */

export interface BrowserbaseConfig {
  apiKey?: string;
  projectId?: string;
  modelName?: string;
  modelApiKey?: string;
  headless?: boolean;
  timeout?: number;
}

export interface BrowserSession {
  stagehand: Stagehand;
  sessionId: string;
  startedAt: Date;
}

const DEFAULT_CONFIG: Partial<BrowserbaseConfig> = {
  headless: true,
  timeout: 55000, // 55s to leave buffer for Vercel's 60s limit
};

/**
 * Create a new Browserbase session with Stagehand
 *
 * @param config - Optional configuration overrides
 * @returns BrowserSession with initialized Stagehand instance
 */
export async function createBrowserSession(
  config: Partial<BrowserbaseConfig> = {}
): Promise<BrowserSession> {
  const apiKey = config.apiKey || process.env.BROWSERBASE_API_KEY;
  const projectId = config.projectId || process.env.BROWSERBASE_PROJECT_ID;

  if (!apiKey) {
    throw new Error(
      "BROWSERBASE_API_KEY is required. Get one at https://browserbase.com"
    );
  }

  if (!projectId) {
    throw new Error(
      "BROWSERBASE_PROJECT_ID is required. Find it in your Browserbase dashboard."
    );
  }

  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  // Initialize Stagehand with Browserbase cloud
  const stagehand = new Stagehand({
    env: "BROWSERBASE",
    apiKey,
    projectId,
    modelName: mergedConfig.modelName || "gpt-4o",
    modelApiKey: mergedConfig.modelApiKey || process.env.OPENAI_API_KEY,
    enableCaching: true, // Cache AI decisions for speed
    headless: mergedConfig.headless,
  });

  await stagehand.init();

  // Generate a session ID for tracking
  const sessionId = `bb_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  console.log(`[Browserbase] Session created: ${sessionId}`);

  return {
    stagehand,
    sessionId,
    startedAt: new Date(),
  };
}

/**
 * Close a Browserbase session gracefully
 *
 * @param session - The session to close
 */
export async function closeBrowserSession(
  session: BrowserSession
): Promise<void> {
  try {
    await session.stagehand.close();
    console.log(`[Browserbase] Session closed: ${session.sessionId}`);
  } catch (error) {
    console.warn(
      `[Browserbase] Error closing session ${session.sessionId}:`,
      error
    );
  }
}

/**
 * Get session duration in milliseconds
 */
export function getSessionDuration(session: BrowserSession): number {
  return Date.now() - session.startedAt.getTime();
}

/**
 * Check if session is approaching timeout
 *
 * @param session - The session to check
 * @param bufferMs - Buffer time before timeout (default 10s)
 * @returns true if session should be closed soon
 */
export function isSessionNearTimeout(
  session: BrowserSession,
  bufferMs: number = 10000
): boolean {
  const maxDuration = 55000; // 55 seconds
  return getSessionDuration(session) >= maxDuration - bufferMs;
}

/**
 * Take a screenshot of the current page
 *
 * @param session - The browser session
 * @returns Base64 encoded screenshot
 */
export async function takeScreenshot(
  session: BrowserSession
): Promise<string> {
  const screenshot = await session.stagehand.page.screenshot({
    type: "png",
    fullPage: false,
  });
  return screenshot.toString("base64");
}

/**
 * Get the current page URL
 */
export function getCurrentUrl(session: BrowserSession): string {
  return session.stagehand.page.url();
}

/**
 * Wait for navigation to complete
 */
export async function waitForNavigation(
  session: BrowserSession,
  timeout: number = 30000
): Promise<void> {
  await session.stagehand.page.waitForLoadState("networkidle", { timeout });
}

// Export Stagehand type for use in strategies
export type { Stagehand };
