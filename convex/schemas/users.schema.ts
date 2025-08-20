import { defineTable } from "convex/server";
import { v } from "convex/values";

export const users = defineTable({
  email: v.optional(v.string()),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  phone: v.optional(v.string()),
  emailVerificationTime: v.optional(v.number()),
  phoneVerificationTime: v.optional(v.number()),

  gender: v.optional(
    v.union(
      v.literal("male"),
      v.literal("female"),
      v.literal("other")
    )
  ),
  address: v.optional(v.string()),
  city: v.optional(v.string()),
  state: v.optional(v.string()),
  postalCode: v.optional(v.string()),

  roles: v.optional(v.union(
    v.literal("tenant"),
    v.literal("landlord"),
    v.literal("admin"),
  )),

  // Email verification fields
  emailVerified: v.optional(v.boolean()),
  emailVerificationToken: v.optional(v.string()),
  emailVerificationExpires: v.optional(v.number()),
  // 2FA fields
  twoFactorEnabled: v.optional(v.boolean()),
  twoFactorSecret: v.optional(v.string()),
  twoFactorBackupCodes: v.optional(v.array(v.string())),
  // Phone verification for 2FA
  phoneVerified: v.optional(v.boolean()),
  phoneVerificationCode: v.optional(v.string()),
  phoneVerificationExpires: v.optional(v.number()),

  createdAt: v.optional(v.number()),
}).index("email", ["email"])
.index("by_role", ["roles"])
.index("email_verified", ["emailVerified"])
.index("phone_verified", ["phoneVerified"])
.index("two_factor_enabled", ["twoFactorEnabled"])
.index("email_verification_token", ["emailVerificationToken"])
.index("phone_verification_code", ["phoneVerificationCode"])
.index("email_verification_expires", ["emailVerificationExpires"])
.index("phone_verification_expires", ["phoneVerificationExpires"]);
;
