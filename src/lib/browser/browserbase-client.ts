import { Stagehand } from "@browserbasehq/stagehand";

/**
 * Browserbase + Stagehand Client (v3)
 *
 * AI-powered browser automation that works on Vercel serverless.
 * Uses natural language commands instead of brittle CSS selectors.
 *
 * @see https://docs.browserbase.com/introduction/stagehand
 */

export interface BrowserbaseConfig {
  apiKey?: string;
  projectId?: string;
  model?: string;
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
 * Create a new Browserbase session with Stagehand v3
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

  // Initialize Stagehand v3 with Browserbase cloud
  // v3 uses unified 'model' config instead of modelName + modelClientOptions
  const stagehand = new Stagehand({
    env: "BROWSERBASE",
    apiKey,
    projectId,
    model: mergedConfig.model || "openai/gpt-4o", // v3 format: provider/model
    domSettleTimeout: 5000,
  });

  await stagehand.init();

  // Generate a session ID for tracking
  const sessionId = stagehand.browserbaseSessionID ||
    `bb_${Date.now()}_${Math.random().toString(36).substring(7)}`;

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
 * Get the active page from Stagehand v3 context
 */
export function getPage(session: BrowserSession) {
  return session.stagehand.context.pages()[0];
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
  const page = getPage(session);
  const screenshot = await page.screenshot({
    type: "png",
    fullPage: false,
  });
  return screenshot.toString("base64");
}

/**
 * Get the current page URL
 */
export function getCurrentUrl(session: BrowserSession): string {
  const page = getPage(session);
  return page.url();
}

/**
 * Wait for navigation to complete
 */
export async function waitForNavigation(
  session: BrowserSession,
  timeoutMs: number = 30000
): Promise<void> {
  const page = getPage(session);
  await page.waitForLoadState("networkidle", timeoutMs);
}

// Export Stagehand type for use in strategies
export type { Stagehand };
