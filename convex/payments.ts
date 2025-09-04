import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const checkReviewEligibility = query({
  args: {
    landlordId: v.id("users"),
    tenancyId: v.id("tenancies"),
  },
  returns: v.object({
    isFreeEligible: v.boolean(),
    reason: v.string(),
    requiresPayment: v.boolean(),
    amount: v.optional(v.number()),
  }),
  handler: async (ctx, args) => {
    // Get the tenancy details
    const tenancy = await ctx.db.get(args.tenancyId);
    if (!tenancy) {
      return {
        isFreeEligible: false,
        reason: "Tenancy not found",
        requiresPayment: false,
      };
    }

    // Check if this is already marked as free eligible (tenant-initiated)
    if (tenancy.freeReviewEligible) {
      return {
        isFreeEligible: true,
        reason: "First review for tenant-initiated tenancy (free)",
        requiresPayment: false,
      };
    }

    // Check if this is the landlord's first review ever
    const landlordReviews = await ctx.db
      .query("reviews")
      .withIndex("user_reviews", (q) => q.eq("reviewerId", args.landlordId))
      .collect();

    const hasGivenReviewsBefore = landlordReviews.length > 0;

    if (!hasGivenReviewsBefore) {
      return {
        isFreeEligible: true,
        reason: "First review ever from this landlord (free trial)",
        requiresPayment: false,
      };
    }

    // Check payment metadata for this landlord
    const paymentMetadata = await ctx.db
      .query("paymentMetadata")
      .withIndex("user_payment", (q) => q.eq("userId", args.landlordId))
      .first();

    if (!paymentMetadata) {
      // First time using the service after free trial
      return {
        isFreeEligible: false,
        reason: "Free trial expired - payment required",
        requiresPayment: true,
        amount: 4.99, // $4.99 per review
      };
    }

    // Check subscription status
    if (
      paymentMetadata.planType === "premium" ||
      paymentMetadata.planType === "business"
    ) {
      return {
        isFreeEligible: true,
        reason: `Included in ${paymentMetadata.planType} plan`,
        requiresPayment: false,
      };
    }

    // Free plan - requires payment for each review
    return {
      isFreeEligible: false,
      reason: "Free plan - pay per review",
      requiresPayment: true,
      amount: 4.99,
    };
  },
});

export const initializePayment = mutation({
  args: {
    tenancyId: v.id("tenancies"),
    reviewType: v.union(v.literal("single_review"), v.literal("mutual_review")),
    amount: v.number(),
  },
  returns: v.object({
    success: v.boolean(),
    paymentIntentId: v.optional(v.string()),
    clientSecret: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { success: false, error: "User must be authenticated" };
    }

    const tenancy = await ctx.db.get(args.tenancyId);
    if (!tenancy || tenancy.landlordId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    // In a real implementation, you would:
    // 1. Create a Stripe PaymentIntent
    // 2. Store the payment intent ID
    // 3. Return the client secret for frontend processing

    // For this demo, we'll create a mock payment intent
    const mockPaymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mockClientSecret = `${mockPaymentIntentId}_secret_${Math.random().toString(36).substr(2, 9)}`;

    // Store payment intent details
    await ctx.db.insert("paymentIntents", {
      paymentIntentId: mockPaymentIntentId,
      tenancyId: args.tenancyId,
      landlordId: userId,
      amount: args.amount,
      reviewType: args.reviewType,
      status: "pending",
      createdAt: Date.now(),
    });

    return {
      success: true,
      paymentIntentId: mockPaymentIntentId,
      clientSecret: mockClientSecret,
    };
  },
});

export const confirmPayment = mutation({
  args: {
    paymentIntentId: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { success: false, error: "User must be authenticated" };
    }

    // Find the payment intent
    const paymentIntent = await ctx.db
      .query("paymentIntents")
      .filter((q) => q.eq(q.field("paymentIntentId"), args.paymentIntentId))
      .first();

    if (!paymentIntent || paymentIntent.landlordId !== userId) {
      return { success: false, error: "Payment intent not found" };
    }

    // In a real implementation, you would verify the payment with Stripe
    // For this demo, we'll just mark it as confirmed

    await ctx.db.patch(paymentIntent._id, {
      status: "confirmed",
      stripePaymentIntentId: args.stripePaymentIntentId,
      confirmedAt: Date.now(),
    });

    // Update or create payment metadata
    const existingMetadata = await ctx.db
      .query("paymentMetadata")
      .withIndex("user_payment", (q) => q.eq("userId", userId))
      .first();

    if (existingMetadata) {
      await ctx.db.patch(existingMetadata._id, {
        lastBillingDate: Date.now(),
      });
    } else {
      await ctx.db.insert("paymentMetadata", {
        userId,
        lastBillingDate: Date.now(),
        planType: "free", // Single payment, still on free plan
      });
    }

    return { success: true };
  },
});

export const getPaymentHistory = query({
  args: { userId: v.optional(v.id("users")) },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const userId = args.userId || (await getAuthUserId(ctx));
    if (!userId) {
      return [];
    }

    const payments = await ctx.db
      .query("paymentIntents")
      .filter((q) => q.eq(q.field("landlordId"), userId))
      .order("desc")
      .collect();

    return payments;
  },
});

export const createSubscription = mutation({
  args: {
    planType: v.union(v.literal("premium"), v.literal("business")),
    stripeSubscriptionId: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { success: false, error: "User must be authenticated" };
    }

    // Update or create payment metadata
    const existingMetadata = await ctx.db
      .query("paymentMetadata")
      .withIndex("user_payment", (q) => q.eq("userId", userId))
      .first();

    const now = Date.now();
    const nextBilling = now + 30 * 24 * 60 * 60 * 1000; // 30 days

    if (existingMetadata) {
      await ctx.db.patch(existingMetadata._id, {
        planType: args.planType,
        stripeCustomerId: args.stripeSubscriptionId,
        lastBillingDate: now,
        nextBillingDate: nextBilling,
      });
    } else {
      await ctx.db.insert("paymentMetadata", {
        userId,
        planType: args.planType,
        stripeCustomerId: args.stripeSubscriptionId,
        lastBillingDate: now,
        nextBillingDate: nextBilling,
      });
    }

    return { success: true };
  },
});

export const cancelSubscription = mutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { success: false, error: "User must be authenticated" };
    }

    const metadata = await ctx.db
      .query("paymentMetadata")
      .withIndex("user_payment", (q) => q.eq("userId", userId))
      .first();

    if (!metadata) {
      return { success: false, error: "No subscription found" };
    }

    await ctx.db.patch(metadata._id, {
      planType: "free",
      stripeCustomerId: undefined,
      nextBillingDate: undefined,
    });

    return { success: true };
  },
});
