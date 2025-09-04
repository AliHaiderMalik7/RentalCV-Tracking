import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const submitLandlordReview = mutation({
  args: {
    tenancyId: v.id("tenancies"),
    reviewerId: v.id("users"),
    revieweeType: v.literal("tenant"),
    communicationRating: v.union(
      v.literal(1),
      v.literal(2),
      v.literal(3),
      v.literal(4),
      v.literal(5),
    ),
    punctualityRating: v.union(
      v.literal(1),
      v.literal(2),
      v.literal(3),
      v.literal(4),
      v.literal(5),
    ),
    conditionRating: v.union(
      v.literal(1),
      v.literal(2),
      v.literal(3),
      v.literal(4),
      v.literal(5),
    ),
    paymentRating: v.union(
      v.literal(1),
      v.literal(2),
      v.literal(3),
      v.literal(4),
      v.literal(5),
    ),
    overallRating: v.number(),
    comment: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
    reviewId: v.optional(v.id("reviews")),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId || userId !== args.reviewerId) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify tenancy exists and reviewer is the landlord
    const tenancy = await ctx.db.get(args.tenancyId);
    if (!tenancy) {
      return { success: false, error: "Tenancy not found" };
    }

    if (tenancy.landlordId !== userId) {
      return {
        success: false,
        error: "Only the landlord can review this tenant",
      };
    }

    // Check if review already exists
    const existingReview = await ctx.db
      .query("reviews")
      .withIndex("tenancy_reviews", (q) => q.eq("tenancyId", args.tenancyId))
      .filter((q) =>
        q.and(
          q.eq(q.field("reviewerId"), args.reviewerId),
          q.eq(q.field("revieweeType"), "tenant"),
        ),
      )
      .first();

    if (existingReview) {
      return { success: false, error: "You have already reviewed this tenant" };
    }

    // Create the review
    const reviewId = await ctx.db.insert("reviews", {
      tenancyId: args.tenancyId,
      reviewerId: args.reviewerId,
      revieweeType: args.revieweeType,
      communicationRating: args.communicationRating,
      punctualityRating: args.punctualityRating,
      conditionRating: args.conditionRating,
      paymentRating: args.paymentRating,
      overallRating: args.overallRating,
      comment: args.comment,
      createdAt: Date.now(),
      isVerified: true, // Landlord reviews are automatically verified
    });

    // Update tenancy with review reference
    await ctx.db.patch(args.tenancyId, {
      landlordReviewId: reviewId,
    });

    // TODO: Update tenant's RentalCV with new review data
    // This would involve recalculating averages and updating the rentalCVs table

    return {
      success: true,
      reviewId,
    };
  },
});

export const submitTenantReview = mutation({
  args: {
    tenancyId: v.id("tenancies"),
    reviewerId: v.id("users"),
    revieweeType: v.literal("landlord"),
    communicationRating: v.union(
      v.literal(1),
      v.literal(2),
      v.literal(3),
      v.literal(4),
      v.literal(5),
    ),
    punctualityRating: v.union(
      v.literal(1),
      v.literal(2),
      v.literal(3),
      v.literal(4),
      v.literal(5),
    ),
    conditionRating: v.union(
      v.literal(1),
      v.literal(2),
      v.literal(3),
      v.literal(4),
      v.literal(5),
    ),
    paymentRating: v.union(
      v.literal(1),
      v.literal(2),
      v.literal(3),
      v.literal(4),
      v.literal(5),
    ),
    overallRating: v.number(),
    comment: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
    reviewId: v.optional(v.id("reviews")),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId || userId !== args.reviewerId) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify tenancy exists and reviewer is the tenant
    const tenancy = await ctx.db.get(args.tenancyId);
    if (!tenancy) {
      return { success: false, error: "Tenancy not found" };
    }

    if (tenancy.tenantId !== userId) {
      return {
        success: false,
        error: "Only the tenant can review this landlord",
      };
    }

    // Check if landlord opted in to be reviewed
    if (!tenancy.landlordReviewable) {
      return {
        success: false,
        error: "This landlord has not opted in to receive reviews",
      };
    }

    // Check if review already exists
    const existingReview = await ctx.db
      .query("reviews")
      .withIndex("tenancy_reviews", (q) => q.eq("tenancyId", args.tenancyId))
      .filter((q) =>
        q.and(
          q.eq(q.field("reviewerId"), args.reviewerId),
          q.eq(q.field("revieweeType"), "landlord"),
        ),
      )
      .first();

    if (existingReview) {
      return {
        success: false,
        error: "You have already reviewed this landlord",
      };
    }

    // Create the review
    const reviewId = await ctx.db.insert("reviews", {
      tenancyId: args.tenancyId,
      reviewerId: args.reviewerId,
      revieweeType: args.revieweeType,
      communicationRating: args.communicationRating,
      punctualityRating: args.punctualityRating,
      conditionRating: args.conditionRating,
      paymentRating: args.paymentRating,
      overallRating: args.overallRating,
      comment: args.comment,
      createdAt: Date.now(),
      isVerified: true, // Reviews are automatically verified in this flow
    });

    // Update tenancy with review reference
    await ctx.db.patch(args.tenancyId, {
      tenantReviewId: reviewId,
    });

    return {
      success: true,
      reviewId,
    };
  },
});

export const getUserReviews = query({
  args: {
    userId: v.id("users"),
    revieweeType: v.union(v.literal("tenant"), v.literal("landlord")),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("user_reviews", (q) => q.eq("reviewerId", args.userId))
      .filter((q) => q.eq(q.field("revieweeType"), args.revieweeType))
      .collect();

    return reviews;
  },
});

export const getTenancyReviews = query({
  args: {
    tenancyId: v.id("tenancies"),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("tenancy_reviews", (q) => q.eq("tenancyId", args.tenancyId))
      .collect();

    return reviews;
  },
});

export const getReviewsForUser = query({
  args: {
    userId: v.id("users"),
    asReviewee: v.boolean(), // true = reviews about this user, false = reviews by this user
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    if (args.asReviewee) {
      // Get all tenancies where this user was involved
      const tenanciesAsLandlord = await ctx.db
        .query("tenancies")
        .withIndex("by_landlord", (q) => q.eq("landlordId", args.userId))
        .collect();

      const tenanciesAsTenant = await ctx.db
        .query("tenancies")
        .withIndex("by_tenant", (q) => q.eq("tenantId", args.userId))
        .collect();

      // Get reviews for these tenancies where the user is the reviewee
      const reviews = [];

      for (const tenancy of tenanciesAsLandlord) {
        const tenancyReviews = await ctx.db
          .query("reviews")
          .withIndex("tenancy_reviews", (q) => q.eq("tenancyId", tenancy._id))
          .filter((q) => q.eq(q.field("revieweeType"), "landlord"))
          .collect();
        reviews.push(...tenancyReviews);
      }

      for (const tenancy of tenanciesAsTenant) {
        const tenancyReviews = await ctx.db
          .query("reviews")
          .withIndex("tenancy_reviews", (q) => q.eq("tenancyId", tenancy._id))
          .filter((q) => q.eq(q.field("revieweeType"), "tenant"))
          .collect();
        reviews.push(...tenancyReviews);
      }

      return reviews;
    } else {
      // Get reviews written by this user
      return await ctx.db
        .query("reviews")
        .withIndex("user_reviews", (q) => q.eq("reviewerId", args.userId))
        .collect();
    }
  },
});
