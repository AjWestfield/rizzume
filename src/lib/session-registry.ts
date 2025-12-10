/**
 * Session Registry - Hot-reload resistant session storage
 *
 * Uses globalThis to persist sessions across module reloads in development.
 * This solves the "Session not found" issue where different module instances
 * have different Map objects during Next.js hot-reloads.
 */

import type { DiscoveredJob } from "@/lib/ai/agents/job-discovery-agent";

// Types for discovery sessions
export interface DiscoveryProgress {
  sessionId: string;
  status: "searching" | "analyzing" | "complete" | "failed";
  currentPhase: string;
  jobsFound: number;
  jobsAnalyzed: number;
  jobsQualified: number;
  averageMatchScore: number;
  error?: string;
  createdAt?: number;  // Auto-populated by set()
  updatedAt?: number;  // Auto-populated by set()
}

export interface DiscoveryResults {
  jobs: DiscoveredJob[];
  completed: boolean;
}

interface SessionRegistry {
  discoveryProgress: Map<string, DiscoveryProgress>;
  discoveryResults: Map<string, DiscoveryResults>;
}

// Symbol key to prevent collisions with other globals
const REGISTRY_KEY = Symbol.for("__rizzume_session_registry__");

/**
 * Get the global session registry, creating it if needed
 */
function getRegistry(): SessionRegistry {
  const globalObj = globalThis as Record<symbol, SessionRegistry | undefined>;

  if (!globalObj[REGISTRY_KEY]) {
    globalObj[REGISTRY_KEY] = {
      discoveryProgress: new Map<string, DiscoveryProgress>(),
      discoveryResults: new Map<string, DiscoveryResults>(),
    };
    console.log("[SessionRegistry] Created new registry");
  }

  return globalObj[REGISTRY_KEY]!;
}

// Discovery Progress Store - wraps the global Map with a consistent interface
export const discoveryProgressStore = {
  get(sessionId: string): DiscoveryProgress | undefined {
    return getRegistry().discoveryProgress.get(sessionId);
  },

  set(sessionId: string, progress: DiscoveryProgress): void {
    progress.updatedAt = Date.now();
    if (!progress.createdAt) {
      progress.createdAt = Date.now();
    }
    getRegistry().discoveryProgress.set(sessionId, progress);
  },

  has(sessionId: string): boolean {
    return getRegistry().discoveryProgress.has(sessionId);
  },

  delete(sessionId: string): boolean {
    return getRegistry().discoveryProgress.delete(sessionId);
  },

  // For debugging
  size(): number {
    return getRegistry().discoveryProgress.size;
  },

  keys(): IterableIterator<string> {
    return getRegistry().discoveryProgress.keys();
  },
};

// Discovery Results Store - wraps the global Map with a consistent interface
export const discoveryResultsStore = {
  get(sessionId: string): DiscoveryResults | undefined {
    return getRegistry().discoveryResults.get(sessionId);
  },

  set(sessionId: string, results: DiscoveryResults): void {
    getRegistry().discoveryResults.set(sessionId, results);
  },

  has(sessionId: string): boolean {
    return getRegistry().discoveryResults.has(sessionId);
  },

  delete(sessionId: string): boolean {
    return getRegistry().discoveryResults.delete(sessionId);
  },

  // For debugging
  size(): number {
    return getRegistry().discoveryResults.size;
  },
};

/**
 * Clean up old sessions (call periodically)
 * Sessions older than maxAge will be removed
 */
export function cleanupSessions(maxAgeMs: number = 30 * 60 * 1000): number {
  const now = Date.now();
  const registry = getRegistry();
  let cleanedCount = 0;

  for (const [sessionId, progress] of registry.discoveryProgress) {
    const lastUpdate = progress.updatedAt ?? progress.createdAt ?? 0;
    if (now - lastUpdate > maxAgeMs) {
      registry.discoveryProgress.delete(sessionId);
      registry.discoveryResults.delete(sessionId);
      cleanedCount++;
      console.log(`[SessionRegistry] Cleaned up session: ${sessionId}`);
    }
  }

  return cleanedCount;
}

/**
 * Debug function to list all active sessions
 */
export function listSessions(): Array<{
  sessionId: string;
  status: string;
  age: string;
}> {
  const registry = getRegistry();
  const now = Date.now();
  const sessions: Array<{ sessionId: string; status: string; age: string }> = [];

  for (const [sessionId, progress] of registry.discoveryProgress) {
    const createdAt = progress.createdAt ?? now;
    const ageMs = now - createdAt;
    const ageMin = Math.floor(ageMs / 60000);
    const ageSec = Math.floor((ageMs % 60000) / 1000);

    sessions.push({
      sessionId,
      status: progress.status,
      age: `${ageMin}m ${ageSec}s`,
    });
  }

  return sessions;
}
