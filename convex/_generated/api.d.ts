/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as ResetOTPPasswordReset from "../ResetOTPPasswordReset.js";
import type * as actions_auth_createUser from "../actions/auth/createUser.js";
import type * as auth from "../auth.js";
import type * as emailVerification from "../emailVerification.js";
import type * as http from "../http.js";
import type * as mutations_users_createUser from "../mutations/users/createUser.js";
import type * as passwordReset_PasswordResetEmail from "../passwordReset/PasswordResetEmail.js";
import type * as profile from "../profile.js";
import type * as properties from "../properties.js";
import type * as tenancy from "../tenancy.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  ResetOTPPasswordReset: typeof ResetOTPPasswordReset;
  "actions/auth/createUser": typeof actions_auth_createUser;
  auth: typeof auth;
  emailVerification: typeof emailVerification;
  http: typeof http;
  "mutations/users/createUser": typeof mutations_users_createUser;
  "passwordReset/PasswordResetEmail": typeof passwordReset_PasswordResetEmail;
  profile: typeof profile;
  properties: typeof properties;
  tenancy: typeof tenancy;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
