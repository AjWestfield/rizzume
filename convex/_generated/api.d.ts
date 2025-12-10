/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as applicationQueue from "../applicationQueue.js";
import type * as applications from "../applications.js";
import type * as autoApplyTrigger from "../autoApplyTrigger.js";
import type * as coverLetters from "../coverLetters.js";
import type * as discovery from "../discovery.js";
import type * as http from "../http.js";
import type * as jobs from "../jobs.js";
import type * as userProfile from "../userProfile.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  applicationQueue: typeof applicationQueue;
  applications: typeof applications;
  autoApplyTrigger: typeof autoApplyTrigger;
  coverLetters: typeof coverLetters;
  discovery: typeof discovery;
  http: typeof http;
  jobs: typeof jobs;
  userProfile: typeof userProfile;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
