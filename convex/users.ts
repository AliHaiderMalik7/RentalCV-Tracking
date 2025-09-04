import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getUserById = query({
  args: { userId: v.id("users") },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user;
  },
});

export const getCurrentUser = query({
  args: {},
  returns: v.union(v.any(), v.null()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db.get(userId);
  },
});

export const getLandlordStatus = query({
  args: { userId: v.id("users") },
  returns: v.object({
    isVerified: v.boolean(),
    badgeType: v.union(
      v.literal("verified_landlord"),
      v.literal("reviewing_landlord"),
      v.literal("mutual_review_landlord"),
      v.literal("none"),
    ),
    reviewCount: v.number(),
    mutualReviewCount: v.number(),
  }),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || user.roles !== "landlord") {
      return {
        isVerified: false,
        badgeType: "none" as const,
        reviewCount: 0,
        mutualReviewCount: 0,
      };
    }

    // Check if landlord is verified (has uploaded required documents)
    const isVerified = Boolean(
      user.verified ||
        (user.idVerificationDocs &&
          user.idVerificationDocs.length > 0 &&
          user.proofOfAddress &&
          user.proofOfAddress.length > 0 &&
          user.landlordLicense &&
          user.landlordLicense.length > 0),
    );

    // Get review statistics
    const tenanciesAsLandlord = await ctx.db
      .query("tenancies")
      .withIndex("by_landlord", (q) => q.eq("landlordId", args.userId))
      .collect();

    let reviewCount = 0;
    let mutualReviewCount = 0;

    for (const tenancy of tenanciesAsLandlord) {
      if (tenancy.landlordReviewId) {
        reviewCount++;
        if (tenancy.tenantReviewId) {
          mutualReviewCount++;
        }
      }
    }

    // Determine badge type based on verification and review activity
    let badgeType:
      | "verified_landlord"
      | "reviewing_landlord"
      | "mutual_review_landlord"
      | "none" = "none";

    if (isVerified && mutualReviewCount >= 3) {
      badgeType = "mutual_review_landlord";
    } else if (isVerified) {
      badgeType = "verified_landlord";
    } else if (reviewCount >= 2) {
      badgeType = "reviewing_landlord";
    }

    return {
      isVerified,
      badgeType,
      reviewCount,
      mutualReviewCount,
    };
  },
});

export const getTenantStatus = query({
  args: { userId: v.id("users") },
  returns: v.object({
    isVerified: v.boolean(),
    badgeType: v.union(v.literal("verified_tenant"), v.literal("none")),
    reviewCount: v.number(),
    averageRating: v.number(),
  }),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || user.roles !== "tenant") {
      return {
        isVerified: false,
        badgeType: "none" as const,
        reviewCount: 0,
        averageRating: 0,
      };
    }

    // Get tenancies as tenant
    const tenanciesAsTenant = await ctx.db
      .query("tenancies")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.userId))
      .collect();

    let reviewCount = 0;
    let totalRating = 0;

    for (const tenancy of tenanciesAsTenant) {
      if (tenancy.tenantReviewId) {
        const review = await ctx.db.get(tenancy.tenantReviewId);
        if (review) {
          reviewCount++;
          totalRating += review.overallRating;
        }
      }
    }

    const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;
    const isVerified = reviewCount >= 1 && averageRating >= 3.0;

    return {
      isVerified,
      badgeType: isVerified ? ("verified_tenant" as const) : ("none" as const),
      reviewCount,
      averageRating,
    };
  },
});

export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),
    updates: v.object({
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      phone: v.optional(v.string()),
      address: v.optional(v.string()),
      city: v.optional(v.string()),
      state: v.optional(v.string()),
      postalCode: v.optional(v.string()),
    }),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId || currentUserId !== args.userId) {
      return { success: false, error: "Unauthorized" };
    }

    try {
      await ctx.db.patch(args.userId, {
        ...args.updates,
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});
