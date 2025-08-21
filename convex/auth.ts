import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { Email } from "@convex-dev/auth/providers/Email";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ResendOTPPasswordReset } from "./ResetOTPPasswordReset";
import { verify } from "crypto";

// export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
//   providers: [Password({  reset: ResendOTPPasswordReset})],

  
// });

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        return {
          email: params.email as string,
          emailVerified: false,
        };
      },
    }),
    Anonymous
  ],
});




export const validateSession = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    return {
      isValid: !!identity,
      user: identity 
    };
  },
});

export const checkUserExists = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    // Check both auth system and your custom users table
    
    // 1. Check Convex auth system (for registered users)
    const tokenIdentifier = `password|${email}`;

    // 2. Check your custom users table
    const userRecord = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .first();

    return { 
      exists:  !!userRecord,
      inUsersTable: !!userRecord
    };
  },
});
export const updateUser = mutation({
  args: {
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    phone: v.string(),
    gender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
    address: v.optional(v.string()),
    city: v.string(),
    state: v.string(),
    postalCode: v.string(),
    roles: v.union(
      v.literal("tenant"),
      v.literal("landlord"),
      v.literal("admin")
    ),
    createdAt: v.number(),

    // ✅ New optional landlord verification fields
    idVerificationDocs: v.optional(v.array(v.string())),  
    proofOfAddress: v.optional(v.array(v.string())),      
    landlordLicense: v.optional(v.array(v.string())),     
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      // ✅ Update existing user
      await ctx.db.patch(existing._id, {
        firstName: args.firstName,
        lastName: args.lastName,
        phone: args.phone,
        gender: args.gender,
        address: args.address,
        city: args.city,
        state: args.state,
        postalCode: args.postalCode,
        roles: args.roles,
        idVerificationDocs: args.idVerificationDocs,
        proofOfAddress: args.proofOfAddress,
        landlordLicense: args.landlordLicense,
      });
    } else {
      // ✅ Create new user
      await ctx.db.insert("users", args);
    }
  },
});



export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});

export const isEmailVerified = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }
    const user = await ctx.db.get(userId);
    return user?.emailVerified ?? false;
  },
});

export const isTwoFactorEnabled = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }
    const user = await ctx.db.get(userId);
    return user?.twoFactorEnabled ?? false;
  },
});

export const isProfileComplete = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }
    const user = await ctx.db.get(userId);
    // Check if user has completed their profile (has required fields)
    return !!(user?.firstName && user?.lastName && user?.roles);
  },
});

export const checkEmailVerifiedByEmail = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .unique();

    if (!user) {
      return { success: false, code: "USER_NOT_FOUND" };
    }

    if (!user.emailVerified) {
      return { success: false, code: "EMAIL_NOT_VERIFIED" };
    }

    return { success: true };
  },
});