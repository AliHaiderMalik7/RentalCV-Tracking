import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";import { getAuthUserId } from "@convex-dev/auth/server";
import { Resend } from "resend";

export const addTenancy = mutation({
    args: {
        propertyId: v.id("properties"),
        startDate: v.number(),
        endDate: v.optional(v.number()),
        name: v.string(),
        email: v.string(),
        mobile: v.optional(v.string()),
        inviteToken: v.optional(v.string()),
        landlordId: v.id("users"),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        const { email, propertyId, inviteToken } = args;
        const expires = Date.now() + 14 * 24 * 60 * 60 * 1000; // 24 hours
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



        if (existingTenancy) {
            return {
                success: false,
                error:
                    "An active or pending invitation already exists for this tenant at this property",
            };
        }

        // 3. Create the tenancy record
        const tenancyId = await ctx.db.insert("tenancies", {
            propertyId: args.propertyId,
            startDate: args.startDate,
            endDate: args.endDate,
            createdAt: Date.now(),
            status: "invited",
            invitedTenantEmail: args.email,
            invitedTenantName: args.name,
            invitedTenantPhone: args.mobile,
            landlordId: args.landlordId,
            inviteTokenExpiry: expires,
            inviteToken: inviteToken
        });


        return {
            success: true,
            message: "Tenancy created successfully",
            tenancyId,
        };


    },
});


export const getLandlordTenancies = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("User must be authenticated");
        }
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


        const inviteLink = `http://localhost:5173/verify-invite?token=${token}&email=${email}`;

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
            status: "active",
        });

        return { success: true, tenancyId: tenancy._id };
    },
});


export const getTenancyDetailsByEmail = query({
    args: { email: v.string() }, // expect tenant's email
    handler: async (ctx, { email }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("User must be authenticated");
        }

        const tenancy = await ctx.db
            .query("tenancies")
            .withIndex("by_tenant_email", (q) => q.eq("invitedTenantEmail", email))
            .first(); // get one tenancy for this email

        if (!tenancy) {
            throw new Error("No tenancy found for this email");
        }

        return tenancy;
    },
});

export const updateTenancyStatus = mutation({
    args: {
      tenancyId: v.id("tenancies"),
      status: v.union(
        v.literal("invited"),
        v.literal("pending"),
        v.literal("active"),
        v.literal("ended"),
        v.literal("declined")
      ),
      tenantCountry: v.optional(v.union(v.string(), v.null())),
      tenantRegion: v.optional(v.union(v.string(), v.null())),
    },
    handler: async (ctx, args) => {
      const tenancy = await ctx.db.get(args.tenancyId);
      if (!tenancy) {
        return { success: false, error: "Tenancy not found" };
      }
  
      // Update tenancy fields
      await ctx.db.patch(args.tenancyId, {
        status: args.status,
        tenantCountry: args.tenantCountry ?? tenancy.tenantCountry ?? null,
        tenantRegion: args.tenantRegion ?? tenancy.tenantRegion ?? null,
        updatedAt: Date.now(),
      });
  
      return {
        success: true,
        message: `Tenancy status updated to '${args.status}' successfully`,
      };
    },
  });
  