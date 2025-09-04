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
      v.literal("other"),
    ),
    occupancyStatus: v.optional(
      v.union(
        v.literal("vacant"),
        v.literal("occupied"),
        v.literal("maintenance"),
        v.literal("unavailable"),
      ),
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
      v.literal("none"),
    ),
    epcRating: v.optional(
      v.union(
        v.literal("A"),
        v.literal("B"),
        v.literal("C"),
        v.literal("D"),
        v.literal("E"),
        v.literal("F"),
        v.literal("G"),
      ),
    ),
    description: v.optional(v.string()),
    images: v.array(v.id("_storage")), // Array of image IDs
    documents: v.optional(v.array(v.id("_storage"))),
    createdAt: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  })
    .index("landlord_properties", ["landlordId"])
    .index("by_postcode_address", ["postcode", "addressLine1"]),

  tenancies: defineTable({
    // Core References
    propertyId: v.id("properties"),
    tenantId: v.optional(v.id("users")),
    landlordId: v.optional(v.id("users")),

    // Tenancy Details
    startDate: v.number(),
    endDate: v.optional(v.number()),
    monthlyRent: v.optional(v.number()),
    depositAmount: v.optional(v.number()),

    // Status Management (Production Ready)
    status: v.union(
      v.literal("invited"), // Landlord sent invite
      v.literal("pending_tenant_response"), // Tenant needs to accept/decline
      v.literal("pending_confirmation"), // Tenant accepted, needs final confirmation
      v.literal("active"), // Confirmed and active
      v.literal("ended"), // Tenancy ended
      v.literal("declined"), // Tenant declined
      v.literal("tenant_initiated"), // Tenant initiated request
      v.literal("landlord_reviewing"), // Landlord reviewing tenant request
      v.literal("disputed"), // Dispute raised
    ),

    // Invitation System
    inviteToken: v.optional(v.string()),
    inviteTokenExpiry: v.optional(v.number()),
    invitedTenantEmail: v.optional(v.string()),
    invitedTenantName: v.optional(v.string()),
    invitedTenantPhone: v.optional(v.string()),
    resendCount: v.optional(v.number()),
    lastResendAt: v.optional(v.number()),

    // Compliance & Legal (Production Requirements)
    tenantCountry: v.optional(v.string()),
    tenantRegion: v.optional(v.string()),
    landlordCountry: v.optional(v.string()),
    tenantDisclaimerLogId: v.optional(v.id("complianceLogs")),
    landlordDisclaimerLogId: v.optional(v.id("complianceLogs")),
    ipAddressTenant: v.optional(v.string()),
    ipAddressLandlord: v.optional(v.string()),

    // Review System (Enhanced)
    landlordReviewId: v.optional(v.id("reviews")),
    tenantReviewId: v.optional(v.id("reviews")),
    freeReviewEligible: v.boolean(),
    landlordReviewable: v.boolean(), // Landlord agrees to be reviewed
    mutualReviewAgreed: v.boolean(), // Both agreed to mutual reviews

    // Verification & Quality Control
    tenantVerified: v.boolean(),
    landlordVerified: v.boolean(),
    addressVerified: v.boolean(),
    documentsVerified: v.boolean(),

    // Dispute Management
    disputeRaised: v.optional(v.boolean()),
    disputeReason: v.optional(v.string()),
    disputeRaisedBy: v.optional(
      v.union(v.literal("tenant"), v.literal("landlord")),
    ),
    disputeRaisedAt: v.optional(v.number()),

    // Timestamps & Audit Trail
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    tenantAcceptedAt: v.optional(v.number()),
    confirmedAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),

    // 2FA & Security
    requires2FA: v.boolean(),
    tenant2FAVerified: v.optional(v.boolean()),
    landlord2FAVerified: v.optional(v.boolean()),
  })
    .index("property_tenancies", ["propertyId"])
    .index("by_invite_token", ["inviteToken"])
    .index("by_status", ["status"])
    .index("by_landlord", ["landlordId"])
    .index("by_tenant_email", ["invitedTenantEmail"])
    .index("by_tenant", ["tenantId"])
    .index("by_active_tenancies", ["status", "startDate"])
    .index("by_verification_status", ["tenantVerified", "landlordVerified"])
    .index("by_expiry", ["inviteTokenExpiry"])
    .index("by_created", ["createdAt"]),

  tenancyInvitations: defineTable({
    propertyId: v.id("properties"),

    startDate: v.number(),
    endDate: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.optional(v.number()),

    createdBy: v.optional(v.id("users")),
    updatedBy: v.optional(v.id("users")),

    status: v.union(
      v.literal("invited"),
      v.literal("pending"),
      v.literal("active"),
      v.literal("ended"),
      v.literal("declined"),
    ),

    landlordId: v.optional(v.id("users")),

    inviteToken: v.optional(v.string()),
    inviteTokenExpiry: v.optional(v.number()),

    invitedTenantEmail: v.optional(v.string()),
    invitedTenantName: v.optional(v.string()),
    invitedTenantPhone: v.optional(v.string()),

    tenantCountry: v.optional(v.union(v.string(), v.null())),
    tenantRegion: v.optional(v.union(v.string(), v.null())),

    // New fields for tracking tenant acceptance context
    country: v.optional(v.union(v.string(), v.null())),
    disclaimerVersion: v.optional(v.union(v.string(), v.null())),
    timestamp: v.optional(v.number()),
    ip: v.optional(v.string()),
    device: v.optional(v.string()),
  })
    .index("by_property", ["propertyId"])
    .index("by_status", ["status"])
    .index("by_invite_token", ["inviteToken"])
    .index("by_tenant_email", ["invitedTenantEmail"])
    .index("by_landlord", ["landlordId"]),

  reviews: defineTable({
    tenancyId: v.id("tenancies"),
    reviewerId: v.id("users"),
    revieweeType: v.union(v.literal("tenant"), v.literal("landlord")),
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
      v.literal("rejected"),
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
      v.literal("business"),
    ),
  }).index("user_payment", ["userId"]),

  paymentIntents: defineTable({
    paymentIntentId: v.string(),
    tenancyId: v.id("tenancies"),
    landlordId: v.id("users"),
    amount: v.number(),
    reviewType: v.union(v.literal("single_review"), v.literal("mutual_review")),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("failed"),
      v.literal("cancelled"),
    ),
    stripePaymentIntentId: v.optional(v.string()),
    createdAt: v.number(),
    confirmedAt: v.optional(v.number()),
  })
    .index("by_payment_intent", ["paymentIntentId"])
    .index("by_landlord", ["landlordId"])
    .index("by_tenancy", ["tenancyId"]),

  complianceLogs: defineTable({
    userId: v.id("users"),
    disclaimerVersionId: v.optional(v.id("disclaimerVersions")), // Reference to disclaimer version
    country: v.string(),
    disclaimerVersion: v.string(),
    ip: v.string(),
    device: v.string(),
    userAgent: v.string(),
    acceptanceContext: v.union(
      v.literal("tenant_signup"),
      v.literal("landlord_signup"),
      v.literal("tenant_invite_acceptance"),
      v.literal("landlord_invite_acceptance"),
      v.literal("review_submission"),
      v.literal("tenant_initiated_request"),
      v.literal("landlord_verification"), // Add missing category
    ),
    relatedTenancyId: v.optional(v.id("tenancies")),
    timestamp: v.number(),
    retentionExpiryDate: v.number(),
    isArchived: v.boolean(),
    archivedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_tenancy", ["relatedTenancyId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_retention", ["retentionExpiryDate"]),

  disclaimerVersions: defineTable({
    version: v.string(),
    region: v.union(
      v.literal("US"),
      v.literal("UK"),
      v.literal("EU"),
      v.literal("INTERNATIONAL"),
    ),
    content: v.string(), // Full disclaimer text
    changelog: v.string(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    isActive: v.boolean(),
    category: v.union(
      v.literal("tenant_signup"),
      v.literal("landlord_signup"),
      v.literal("tenant_invite_acceptance"),
      v.literal("landlord_verification"),
    ),
  })
    .index("by_region", ["region"])
    .index("by_created", ["createdAt"])
    .index("by_active", ["isActive"])
    .index("by_category", ["category", "region"]),

  // 2FA Verification System
  verificationCodes: defineTable({
    userId: v.id("users"),
    code: v.string(),
    type: v.union(
      v.literal("email_verification"),
      v.literal("phone_verification"),
      v.literal("2fa_login"),
      v.literal("password_reset"),
    ),
    method: v.union(
      v.literal("email"),
      v.literal("sms"),
      v.literal("authenticator"),
    ),
    expiresAt: v.number(),
    isUsed: v.boolean(),
    attemptsCount: v.number(),
    createdAt: v.number(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_code", ["code"])
    .index("by_expiry", ["expiresAt"])
    .index("by_type", ["type", "isUsed"]),

  // IP/Country Detection Cache
  ipLocationCache: defineTable({
    ipAddress: v.string(),
    country: v.string(),
    countryCode: v.string(),
    region: v.string(),
    city: v.string(),
    timezone: v.string(),
    provider: v.string(), // e.g., "ipapi", "ipgeolocation"
    confidence: v.number(), // 0-100
    createdAt: v.number(),
    lastUsedAt: v.number(),
  })
    .index("by_ip", ["ipAddress"])
    .index("by_country", ["country"])
    .index("by_last_used", ["lastUsedAt"]),

  // SMS/Email Delivery Tracking
  messageDelivery: defineTable({
    messageId: v.string(),
    recipientEmail: v.optional(v.string()),
    recipientPhone: v.optional(v.string()),
    messageType: v.union(
      v.literal("invitation_email"),
      v.literal("invitation_sms"),
      v.literal("verification_email"),
      v.literal("verification_sms"),
      v.literal("notification_email"),
      v.literal("notification_sms"),
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("failed"),
      v.literal("bounced"),
    ),
    provider: v.string(), // "resend", "twilio", etc.
    providerMessageId: v.optional(v.string()),
    relatedTenancyId: v.optional(v.id("tenancies")),
    relatedUserId: v.optional(v.id("users")),
    sentAt: v.number(),
    deliveredAt: v.optional(v.number()),
    failedAt: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    retryCount: v.number(),
  })
    .index("by_recipient_email", ["recipientEmail"])
    .index("by_recipient_phone", ["recipientPhone"])
    .index("by_status", ["status"])
    .index("by_tenancy", ["relatedTenancyId"])
    .index("by_sent_at", ["sentAt"]),

  // System Settings for Production
  systemSettings: defineTable({
    key: v.string(),
    value: v.any(),
    description: v.string(),
    category: v.union(
      v.literal("compliance"),
      v.literal("messaging"),
      v.literal("payment"),
      v.literal("security"),
      v.literal("features"),
    ),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    updatedBy: v.optional(v.id("users")),
  })
    .index("by_key", ["key"])
    .index("by_category", ["category"])
    .index("by_active", ["isActive"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
  users: users,
});
