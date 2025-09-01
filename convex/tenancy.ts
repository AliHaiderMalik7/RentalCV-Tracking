import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Resend } from "resend";

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
        const expires = Date.now() + 14 * 24 * 60 * 60 * 1000; // 24 hours
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
            inviteTokenExpiry: expires,
            inviteToken: inviteToken
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


export const sendInviteEmail = action({
    args: { email: v.string(), token: v.string() },
    handler: async (_ctx, { email, token }) => {
      const resend = new Resend(process.env.RESEND_API_KEY!);

      console.log("email to be send is", email);
      
  
      const inviteLink = `http://localhost:5173/verify-invite?token=${token}`;
  
      await resend.emails.send({
        from: process.env.AUTH_EMAIL ?? "My App <onboarding@resend.dev>",
        to: email,
        subject: "You’ve been invited!",
        html: `<p>You’ve been invited. Click below to accept:</p>
               <a href="${inviteLink}">Accept Invitation</a>`,
      });
  
      return { success: true };
    },
  });
  

  export const acceptInvite = mutation({
    args: { token: v.string(), userId: v.id("users") },
    handler: async (ctx, args) => {
      const tenancy = await ctx.db
        .query("tenancies")
        .withIndex("by_invite_token", (q) => q.eq("inviteToken", args.token))
        .unique();
  
      if (!tenancy) throw new Error("Invalid invitation token");
  
      if (!tenancy.inviteTokenExpiry || tenancy.inviteTokenExpiry < Date.now()) {
        return { success: false, error: "⏰ This invitation has expired." };
      }
  
      if (tenancy.status !== "pending") {
        return { success: false, error: "This invite is no longer valid." };
      }
  
      await ctx.db.patch(tenancy._id, {
        // tenantId: args.userId,
        status: "active",
        // inviteToken: null,
        // inviteTokenExpiry: null,
      });
  
      return { success: true, tenancyId: tenancy._id };
    },
  });
  