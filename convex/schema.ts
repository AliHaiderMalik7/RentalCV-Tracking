// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { users } from "./schemas/users.schema";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const applicationTables = {
  properties: defineTable({
    landlordId: v.id("users"),
    addressLine1: v.string(),
    addressLine2: v.optional(v.string()),
    city: v.string(),
    county: v.string(),
    postcode: v.string(),
    propertyType: v.union(
      v.literal("flat"),
      v.literal("house"),
      v.literal("bungalow"),
      v.literal("other")
    ),
    occupancyStatus: v.optional(
      v.union(
        v.literal("vacant"),
        v.literal("occupied"),
        v.literal("maintenance"),
        v.literal("unavailable")
      )
    ),
    rent: v.optional(v.number()),
    bedrooms: v.number(),
    bathrooms: v.number(),
    livingRooms: v.number(),
    kitchens: v.number(),
    hasGarden: v.boolean(),
    parkingType: v.union(
      v.literal("street"),
      v.literal("driveway"),
      v.literal("garage"),
      v.literal("none")
    ),
    epcRating: v.optional(v.union(
      v.literal("A"),
      v.literal("B"),
      v.literal("C"),
      v.literal("D"),
      v.literal("E"),
      v.literal("F"),
      v.literal("G")
    )),
    description: v.optional(v.string()),
    images: v.array(v.id("_storage")), // Array of image IDs
    documents: v.optional(v.array(v.id("_storage"))),
    createdAt: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  }).index("landlord_properties", ["landlordId"]).index("by_postcode_address", ["postcode", "addressLine1"]),


  tenancies: defineTable({
    // ... your existing fields ...
    propertyId: v.id("properties"),
    // tenantId: v.id("users"), // This must be optional for pending invites!
    startDate: v.number(),
    endDate: v.optional(v.number()),
    monthlyRent: v.optional(v.number()),
    depositAmount: v.optional(v.number()),
    createdAt: v.number(),

    // --- NEW FIELDS FOR ONBOARDING & STATUS ---
    status: v.union(
      v.literal("pending"), // Invite sent, tenant hasn't accepted
      v.literal("active"),  // Tenant accepted, tenancy is live
      v.literal("ended"),   // Tenancy end date has passed
      v.literal("declined") // Tenant flagged details as incorrect
    ),
    // Optional for tenant-initiated flow where landlord hasn't confirmed
    landlordId: v.optional(v.id("users")),

    // --- NEW FIELDS FOR INVITATION LOGIC ---
    inviteToken: v.optional(v.string()), // The unique token for the invite link
    inviteTokenExpiry: v.optional(v.number()), // Timestamp when the token expires (14 days)
    invitedTenantEmail: v.optional(v.string()), // The email the invite was sent to
    invitedTenantName: v.optional(v.string()), // The name provided by the landlord
    
    invitedTenantPhone: v.optional(v.string()), // The phone number provided

    // --- NEW FIELDS FOR LEGAL COMPLIANCE ---
    tenantCountry: v.optional(v.union(v.string(), v.null())),
    landlordCountry: v.optional(v.union(v.string(), v.null())),
    disclaimerVersionTenant: v.optional(v.union(v.string(), v.null())),
    disclaimerVersionLandlord: v.optional(v.union(v.string(), v.null())),

    // --- NEW FIELDS FOR REVIEW LOGIC ---
    landlordReviewId: v.optional(v.union(v.id("reviews"), v.null())),
    tenantReviewId: v.optional(v.union(v.id("reviews"), v.null())),
    freeReviewEligible: v.optional(v.union(v.boolean(), v.null())),
    landlordReviewable: v.optional(v.union(v.boolean(), v.null())),

  })
    // .index("tenant_tenancies", ["tenantId"])
    .index("property_tenancies", ["propertyId"])
    .index("by_invite_token", ["inviteToken"]) 
    .index("by_status", ["status"]) 
    .index("by_landlord", ["landlordId"]) 
    .index("by_tenant_email", ["invitedTenantEmail"]), 

  reviews: defineTable({
    tenancyId: v.id("tenancies"),
    reviewerId: v.id("users"),
    revieweeType: v.union(v.literal("tenant"), v.literal("landlord")),
    communicationRating: v.union(
      v.literal(1),
      v.literal(2),
      v.literal(3),
      v.literal(4),
      v.literal(5)
    ),
    punctualityRating: v.union(
      v.literal(1),
      v.literal(2),
      v.literal(3),
      v.literal(4),
      v.literal(5)
    ),
    conditionRating: v.union(
      v.literal(1),
      v.literal(2),
      v.literal(3),
      v.literal(4),
      v.literal(5)
    ),
    paymentRating: v.union(
      v.literal(1),
      v.literal(2),
      v.literal(3),
      v.literal(4),
      v.literal(5)
    ),
    overallRating: v.number(),
    comment: v.optional(v.string()),
    createdAt: v.number(),
    isVerified: v.boolean(),
  })
    .index("tenancy_reviews", ["tenancyId"])
    .index("user_reviews", ["reviewerId"]),

  mediaUploads: defineTable({
    userId: v.id("users"),
    associatedReview: v.optional(v.id("reviews")),
    associatedDispute: v.optional(v.id("disputes")),
    fileUrl: v.string(),
    exifTimestamp: v.number(),
    uploadTimestamp: v.number(),
    verificationStatus: v.union(
      v.literal("pending"),
      v.literal("verified"),
      v.literal("rejected")
    ),
  }).index("user_uploads", ["userId"]),

  rentalCVs: defineTable({
    userId: v.id("users"),
    averageRating: v.number(),
    totalReviews: v.number(),
    lastUpdated: v.number(),
    cvData: v.any(),
  }).index("user_cv", ["userId"]),

  paymentMetadata: defineTable({
    userId: v.id("users"),
    stripeCustomerId: v.optional(v.string()),
    lastBillingDate: v.optional(v.number()),
    nextBillingDate: v.optional(v.number()),
    planType: v.union(
      v.literal("free"),
      v.literal("premium"),
      v.literal("business")
    ),
  }).index("user_payment", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
  users: users,
});
