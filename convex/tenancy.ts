import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

export const addTenancy = mutation({
    args: {
        propertyId: v.id("properties"),
        startDate: v.number(),
        endDate: v.optional(v.number()),
        // monthlyRent: v.number(),
        // depositAmount: v.number(),
        name: v.string(),
        email: v.string(),
        mobile: v.optional(v.string()),
        inviteToken: v.optional(v.string()),
        // inviteTokenExpiry: v.number(),
        landlordId: v.id("users"),

        status: v.string(),
        // sendEmail: v.boolean(),
    },
    handler: async (ctx, args) => {
        const { email, propertyId, inviteToken } = args;

        // 1. Check for existing pending/active tenancy for same property + email
        const existingTenancy = await ctx.db
            .query("tenancies")
            .withIndex("by_tenant_email", (q) => q.eq("invitedTenantEmail", email))
            .filter((q) =>
                q.and(
                    q.eq(q.field("propertyId"), propertyId),
                    q.or(
                        q.eq(q.field("status"), "pending"),
                        q.eq(q.field("status"), "active")
                    )
                )
            )
            .first();

        console.log("tenancy exists", existingTenancy);


        if (existingTenancy) {
            throw new Error(
                "An active or pending invitation already exists for this tenant at this property"
            );
        }

        // 2. Check if user already exists
        // const userExists:any = await ctx.runQuery(internal.users.checkUserExists, {
        //   email: args.email,
        // });

        // let tenantId = undefined;
        // if (userExists.exists) {
        //   // Find the user ID from the users table
        //   const userRecord = await ctx.db
        //     .query("users")
        //     .withIndex("email", (q) => q.eq("email", args.email))
        //     .first();

        //   if (userRecord) {
        //     tenantId = userRecord._id;
        //   }
        // }

        // 3. Create the tenancy record
        const tenancyId = await ctx.db.insert("tenancies", {
            propertyId: args.propertyId,
            startDate: args.startDate,
            endDate: args.endDate,
            createdAt: Date.now(),
            status: "pending",
            invitedTenantEmail: args.email,
            invitedTenantName: args.name,
            invitedTenantPhone: args.mobile,
            landlordId: args.landlordId,

        });

        // ✅ Return a response
        return {
            success: true,
            message: "Tenancy created successfully",
            tenancyId,
        };

        // 4. Send invitation email if requested
        // if (args.sendEmail) {
        //   try {
        //     // Get property details for the email
        //     const property = await ctx.db.get(args.propertyId);
        //     if (!property) {
        //       throw new Error("Property not found");
        //     }

        //     // Get landlord details
        //     const landlord = await ctx.db.get(args.landlordId);
        //     if (!landlord) {
        //       throw new Error("Landlord not found");
        //     }

        //     // Send the invitation email
        //     await ctx.scheduler.runAfter(0, internal.emails.sendTenantInvitation, {
        //       tenancyId,
        //       tenantEmail: args.email,
        //       tenantName: args.name,
        //       propertyAddress: property.addressLine1,
        //       landlordName: landlord.name,
        //       inviteToken: args.inviteToken,
        //       isExistingUser: userExists.exists,
        //     });

        //     // Optionally send SMS if mobile provided
        //     if (args.mobile) {
        //       await ctx.scheduler.runAfter(0, internal.sms.sendTenantInvitationSms, {
        //         mobile: args.mobile,
        //         tenantName: args.name,
        //         landlordName: landlord.name,
        //         inviteToken: args.inviteToken,
        //       });
        //     }
        //   } catch (emailError) {
        //     console.error("Failed to send invitation email:", emailError);
        //     // Don't throw here - the tenancy was created successfully
        //     // Just log the error for monitoring
        //   }
        // }

        // return {
        //   tenancyId,
        //   tenantExists: userExists.exists,
        //   tenantId,
        //   message: userExists.exists
        //     ? "Invitation sent to existing user"
        //     : "Invitation sent to new user",
        // };
    },
});



export const getLandlordTenancies = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    // ✅ Fetch all tenancies where landlordId = current user
    const tenancies = await ctx.db
      .query("tenancies")
      .withIndex("by_landlord", (q) => q.eq("landlordId", userId))
      .collect();

    return tenancies;
  },
});
