"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";

// Check if Convex is configured
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

export function Providers({ children }: { children: ReactNode }) {
  // Create Convex client only if URL is configured
  const convexClient = useMemo(() => {
    if (CONVEX_URL) {
      return new ConvexReactClient(CONVEX_URL);
    }
    return null;
  }, []);

  // If Convex isn't configured, just render children without the provider
  if (!convexClient) {
    return <>{children}</>;
  }

  return (
    <ConvexProvider client={convexClient}>
      {children}
    </ConvexProvider>
  );
}
