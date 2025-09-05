import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Resend } from "resend";

export enum TenancyStatus {
    INVITED = "invited",
    PENDING_TENANT_RESPONSE = "pending_tenant_response",
    PENDING_CONFIRMATION = "pending_confirmation",
    ACTIVE = "active",
    ENDED = "ended",
    DECLINED = "declined",
    TENANT_INITIATED = "tenant_initiated",
    LANDLORD_REVIEWING = "landlord_reviewing",
    DISPUTED = "disputed",
}

export const addTenancy = mutation({
    args: {
        propertyId: v.id("properties"),
        startDate: v.number(),
        endDate: v.optional(v.number()),
        name: v.string(),
        email: v.string(),
        mobile: v.optional(v.string()),
        landlordId: v.id("users"),
    },
    returns: v.object({
        success: v.boolean(),
        error: v.optional(v.string()),
        message: v.optional(v.string()),
        tenancyId: v.optional(v.id("tenancies")),
        inviteToken: v.optional(v.string()),
    }),
    handler: async (ctx, args) => {
        const { email, propertyId } = args;

        // 🔍 Step 1: Check if user is a landlord
        const existingUser = await ctx.db
            .query("users")
            .withIndex("email", (q) => q.eq("email", email))
            .first();

        if (existingUser && existingUser.roles === "landlord") {
            return {
                success: false,
                error:
                    "Unable to send tenancy invitation because this user is registered as a landlord",
            };
        }

        // 🔍 Step 2: Check if property already has INVITED or ACTIVE tenancy
        const propertyTenancy = await ctx.db
            .query("tenancies")
            .withIndex("property_tenancies", (q) => q.eq("propertyId", propertyId))
            .filter((q) =>
                q.or(
                    q.eq(q.field("status"), TenancyStatus.INVITED as string),
                    q.eq(q.field("status"), TenancyStatus.PENDING_TENANT_RESPONSE as string),
                    q.eq(q.field("status"), TenancyStatus.PENDING_CONFIRMATION as string),
                    q.eq(q.field("status"), TenancyStatus.ACTIVE as string),
                )
            )
            .first(); // single match or null

        if (propertyTenancy) {
            return {
                success: false,
                error:
                    "This property already has an active or invited tenancy. Please wait until it ends or is declined before creating a new one.",
            };
        }


        // 🔍 Step 3: Verify property belongs to landlord
        const property = await ctx.db.get(propertyId);
        if (!property) {
            return { success: false, error: "Property not found" };
        }

        if (property.landlordId !== args.landlordId) {
            return {
                success: false,
                error: "Unauthorized: Property does not belong to this landlord",
            };
        }

        // ✅ Step 4: Create tenancy record
        const inviteToken = crypto.randomUUID();
        const expires = Date.now() + 14 * 24 * 60 * 60 * 1000; // 14 days

        const tenancyId = await ctx.db.insert("tenancies", {
            propertyId,
            startDate: args.startDate,
            endDate: args.endDate,
            createdAt: Date.now(),
            status: TenancyStatus.INVITED,
            invitedTenantEmail: args.email,
            invitedTenantName: args.name,
            invitedTenantPhone: args.mobile,
            landlordId: args.landlordId,
            inviteToken,
            inviteTokenExpiry: expires,

            // defaults
            freeReviewEligible: false,
            landlordReviewable: true,
            mutualReviewAgreed: true,
            tenantVerified: false,
            landlordVerified: true,
            addressVerified: true,
            documentsVerified: false,
            requires2FA: true,
            resendCount: 0,
        });

        return {
            success: true,
            message: "Tenancy invitation created successfully",
            tenancyId,
            inviteToken,
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
    args: {
        email: v.string(),
        token: v.string(),
        phone: v.optional(v.string()),
        landlordName: v.optional(v.string()),
        propertyAddress: v.optional(v.string()),
        tenantName: v.optional(v.string()),
    },
    returns: v.object({
        success: v.boolean(),
        error: v.optional(v.string()),
    }),
    handler: async (
        _ctx,
        { email, token, phone, landlordName, propertyAddress, tenantName },
    ) => {
        try {
            const resend = new Resend(process.env.RESEND_API_KEY!);

            // Updated invite link to match new tenant acceptance flow
            const inviteLink = `http://localhost:5173/tenant/invite?token=${token}`;
            console.log("invite link", inviteLink);

            // Send Email
            await resend.emails.send({
                from: process.env.AUTH_EMAIL ?? "RentalCV <onboarding@resend.dev>",
                to: email,
                subject: "You've been invited to RentalCV by your landlord",
                html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: #ffffff;">
            <div style="background: #0369a1; color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">RentalCV Invitation</h1>
            </div>
            
            <div style="padding: 30px;">
              <h2 style="color: #0369a1; margin-top: 0;">Hello ${tenantName || "there"}!</h2>
              <p style="font-size: 16px; line-height: 1.5; color: #374151;">
                <strong>${landlordName || "Your landlord"}</strong> has invited you to join RentalCV and verify your tenancy details.
              </p>
              
              ${propertyAddress
                        ? `
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0369a1;">
                  <h3 style="color: #334155; margin-top: 0; font-size: 18px;">Property Details</h3>
                  <p style="margin: 5px 0; font-size: 16px;"><strong>Address:</strong> ${propertyAddress}</p>
                </div>
              `
                        : ""
                    }

              <div style="margin: 30px 0;">
                <h3 style="color: #334155; margin-bottom: 15px;">What happens next:</h3>
                <ol style="padding-left: 20px; color: #374151; line-height: 1.6;">
                  <li>Click the secure link below to accept this invitation</li>
                  <li>We'll detect your location for legal compliance</li>
                  <li>Review and accept our terms and disclaimer</li>
                  <li>Create your account or log in</li>
                  <li>Confirm your tenancy details</li>
                </ol>
              </div>

              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0369a1; margin-top: 0;">Benefits of RentalCV:</h3>
                <ul style="color: #374151; line-height: 1.6; margin-bottom: 0;">
                  <li>Build your verified rental history</li>
                  <li>Get professional landlord reviews</li>
                  <li>Create a trusted rental profile</li>
                  <li>Improve your chances with future landlords</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 40px 0;">
                <a href="${inviteLink}" 
                   style="background: #0369a1; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                  Accept Invitation
                </a>
              </div>

              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
                <p style="color: #9ca3af; font-size: 14px; margin-bottom: 5px;">
                  <strong>Important:</strong> This invitation expires in 14 days.
                </p>
                <p style="color: #9ca3af; font-size: 14px;">
                  If the button doesn't work, copy and paste this link: <br/>
                  <span style="word-break: break-all;">${inviteLink}</span>
                </p>
              </div>
            </div>
          </div>
        `,
            });

            // SMS notification (placeholder - focusing on email for now)
            if (phone) {
                try {
                    console.log(
                        `SMS notification logged for ${phone}: ${tenantName || "Tenant"}, you have a RentalCV invitation from ${landlordName}. Check your email at ${email}.`,
                    );
                    // TODO: Implement actual SMS sending when ready
                } catch (error) {
                    console.error("SMS notification error:", error);
                    // Don't fail email if SMS fails
                }
            }

            return { success: true };
        } catch (error) {
            console.error("Email sending error:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Failed to send email",
            };
        }
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

        if (tenancy.status !== TenancyStatus.INVITED) {
            return { success: false, error: "This invite is no longer valid." };
        }

        await ctx.db.patch(tenancy._id, {
            status: TenancyStatus.ACTIVE,
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
            v.literal(TenancyStatus.INVITED),
            v.literal(TenancyStatus.PENDING_TENANT_RESPONSE),
            v.literal(TenancyStatus.PENDING_CONFIRMATION),
            v.literal(TenancyStatus.ACTIVE),
            v.literal(TenancyStatus.ENDED),
            v.literal(TenancyStatus.DECLINED),
            v.literal(TenancyStatus.TENANT_INITIATED),
            v.literal(TenancyStatus.LANDLORD_REVIEWING),
            v.literal(TenancyStatus.DISPUTED),
        ),
        tenantCountry: v.optional(v.string()),
        tenantRegion: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const tenancy = await ctx.db.get(args.tenancyId);
        if (!tenancy) {
            return { success: false, error: "Tenancy not found" };
        }

        // Update tenancy fields
        await ctx.db.patch(args.tenancyId, {
            status: args.status,
            tenantCountry: args.tenantCountry ?? tenancy.tenantCountry,
            tenantRegion: args.tenantRegion ?? tenancy.tenantRegion,
            updatedAt: Date.now(),
        });

        return {
            success: true,
            message: `Tenancy status updated to '${args.status}' successfully`,
        };
    },
});

// Step 2A - Tenant-Initiated Request Functions

export const createTenantInitiatedRequest = mutation({
    args: {
        tenantId: v.id("users"),
        propertyAddress: v.string(),
        city: v.string(),
        postcode: v.string(),
        unitNumber: v.optional(v.string()),
        landlordName: v.string(),
        landlordEmail: v.string(),
        landlordPhone: v.optional(v.string()),
        tenancyStartDate: v.number(),
        tenancyEndDate: v.optional(v.number()),
        monthlyRent: v.optional(v.number()),
        depositAmount: v.optional(v.number()),
        tenantCountry: v.string(),
        disclaimerVersion: v.string(),
        ip: v.string(),
        device: v.string(),
    },
    returns: v.object({
        success: v.boolean(),
        message: v.optional(v.string()),
        error: v.optional(v.string()),
        tenancyId: v.optional(v.id("tenancies")),
    }),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId || userId !== args.tenantId) {
            return { success: false, error: "Unauthorized" };
        }

        // Check if tenant already has a request for this property
        const existingRequest = await ctx.db
            .query("tenancies")
            .withIndex("by_tenant_email", (q) => q.eq("invitedTenantEmail", ""))
            .filter((q) => q.eq(q.field("status"), "tenant_initiated"))
            .first();

        // Generate invite token for landlord
        const inviteToken = crypto.randomUUID();
        const tokenExpiry = Date.now() + 14 * 24 * 60 * 60 * 1000; // 14 days

        // First, create a placeholder property record (landlord will verify/edit this)
        const propertyId = await ctx.db.insert("properties", {
            landlordId: args.tenantId, // Temporary, will be updated when landlord accepts
            addressLine1: args.propertyAddress,
            city: args.city,
            postcode: args.postcode,
            county: "TBD", // Landlord will complete this
            propertyType: "other", // Landlord will specify
            bedrooms: 1, // Default values, landlord will update
            bathrooms: 1,
            livingRooms: 1,
            kitchens: 1,
            hasGarden: false,
            parkingType: "none",
            images: [],
            isActive: false, // Not active until landlord verifies
            createdAt: Date.now(),
        });

        // Create tenancy record with tenant-initiated status
        const tenancyId = await ctx.db.insert("tenancies", {
            propertyId,
            tenantId: args.tenantId, // Set the tenant who initiated this
            startDate: args.tenancyStartDate,
            endDate: args.tenancyEndDate,
            monthlyRent: args.monthlyRent,
            depositAmount: args.depositAmount,
            createdAt: Date.now(),
            status: TenancyStatus.TENANT_INITIATED,
            invitedTenantEmail: args.landlordEmail, // Landlord's email in this case
            invitedTenantName: args.landlordName,
            invitedTenantPhone: args.landlordPhone,
            landlordId: undefined, // Will be set when landlord accepts
            inviteToken,
            inviteTokenExpiry: tokenExpiry,
            tenantCountry: args.tenantCountry,
            // disclaimerVersionTenant: args.disclaimerVersion, // TODO: Update to use compliance log ID
            freeReviewEligible: true, // First review is free for tenant-initiated
            landlordReviewable: true, // Default for tenant-initiated
            mutualReviewAgreed: false, // Landlord can opt out
            tenantVerified: false,
            landlordVerified: false,
            addressVerified: false,
            documentsVerified: false,
            requires2FA: false,
            resendCount: 0,
        });

        // Automatically send invite email to landlord
        // TODO: Implement email sending

        // Schedule email to be sent separately
        // TODO: Implement email sending after landlord acceptance is complete
        // For now, the email will need to be triggered manually or via API call

        return {
            success: true,
            message: "Tenancy request created successfully",
            tenancyId,
            inviteToken, // Return token for testing purposes
        };
    },
});

export const sendLandlordInviteEmail = action({
    args: {
        email: v.string(),
        token: v.string(),
        tenantName: v.string(),
        propertyAddress: v.string(),
    },
    returns: v.object({ success: v.boolean() }),
    handler: async (_ctx, { email, token, tenantName, propertyAddress }) => {
        const resend = new Resend(process.env.RESEND_API_KEY!);

        const inviteLink = `http://localhost:5173/landlord-verification?token=${token}`;

        await resend.emails.send({
            from: process.env.AUTH_EMAIL ?? "My App <onboarding@resend.dev>",
            to: email,
            subject: `${tenantName} has invited you to verify their tenancy - First review FREE`,
            html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h2 style="color: #0369a1;">You've been invited to RentalCV!</h2>
          <p>Hello,</p>
          <p><strong>${tenantName}</strong> has invited you to verify their tenancy and leave a review for their RentalCV profile.</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #334155; margin-top: 0;">Property Details:</h3>
            <p style="margin: 5px 0;"><strong>Address:</strong> ${propertyAddress}</p>
            <p style="margin: 5px 0;"><strong>Tenant:</strong> ${tenantName}</p>
          </div>

          <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p style="margin: 0; color: #059669;"><strong>🎉 Special Offer:</strong> This first review is completely FREE for you!</p>
          </div>

          <p>By verifying this tenancy, you'll be able to:</p>
          <ul>
            <li>Leave a review for ${tenantName}'s RentalCV profile</li>
            <li>Choose whether you'd like to be reviewed in return (optional)</li>
            <li>Build your reputation as a landlord</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" 
               style="background: #0369a1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Tenancy & Leave Review
            </a>
          </div>

          <p style="color: #64748b; font-size: 14px;">This invitation expires in 14 days.</p>
          <p style="color: #64748b; font-size: 14px;">If you cannot click the button, copy and paste this link: ${inviteLink}</p>
        </div>
      `,
        });

        return { success: true };
    },
});

export const getTenantInitiatedRequests = query({
    args: {},
    returns: v.array(v.any()),
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("User must be authenticated");
        }

        const requests = await ctx.db
            .query("tenancies")
            .withIndex("by_tenant", (q) => q.eq("tenantId", userId))
            .filter((q) => q.eq(q.field("status"), TenancyStatus.TENANT_INITIATED))
            .collect();

        return requests;
    },
});

export const acceptLandlordInvite = mutation({
    args: {
        token: v.string(),
        landlordId: v.id("users"),
        landlordCountry: v.string(),
        disclaimerVersion: v.string(),
        ip: v.string(),
        device: v.string(),
        agreeToReview: v.boolean(),
        agreeToBeReviewed: v.boolean(),
    },
    returns: v.object({
        success: v.boolean(),
        error: v.optional(v.string()),
        tenancyId: v.optional(v.id("tenancies")),
    }),
    handler: async (ctx, args) => {
        const tenancy = await ctx.db
            .query("tenancies")
            .withIndex("by_invite_token", (q) => q.eq("inviteToken", args.token))
            .unique();

        if (!tenancy) {
            return { success: false, error: "Invalid invitation token" };
        }

        if (!tenancy.inviteTokenExpiry || tenancy.inviteTokenExpiry < Date.now()) {
            return { success: false, error: "⏰ This invitation has expired." };
        }

        if (tenancy.status !== TenancyStatus.TENANT_INITIATED) {
            return { success: false, error: "This invite is no longer valid." };
        }

        // Update property to be owned by the actual landlord
        await ctx.db.patch(tenancy.propertyId, {
            landlordId: args.landlordId,
            isActive: true,
        });

        // Update tenancy with landlord details
        await ctx.db.patch(tenancy._id, {
            status: TenancyStatus.ACTIVE,
            landlordId: args.landlordId,
            landlordCountry: args.landlordCountry,
            // disclaimerVersionLandlord: args.disclaimerVersion, // TODO: Update to use compliance log ID
            landlordReviewable: args.agreeToBeReviewed,
            updatedAt: Date.now(),
        });

        return {
            success: true,
            tenancyId: tenancy._id,
        };
    },
});

export const getLandlordInviteDetails = query({
    args: { token: v.string() },
    returns: v.union(
        v.object({
            success: v.boolean(),
            tenancy: v.any(),
            property: v.any(),
            tenant: v.any(),
        }),
        v.object({
            success: v.boolean(),
            error: v.string(),
        }),
    ),
    handler: async (ctx, args) => {
        const tenancy = await ctx.db
            .query("tenancies")
            .withIndex("by_invite_token", (q) => q.eq("inviteToken", args.token))
            .unique();

        if (!tenancy) {
            return { success: false, error: "Invalid invitation token" };
        }

        if (!tenancy.inviteTokenExpiry || tenancy.inviteTokenExpiry < Date.now()) {
            return { success: false, error: "This invitation has expired" };
        }

        const property = await ctx.db.get(tenancy.propertyId);
        if (!property) {
            return { success: false, error: "Property not found" };
        }

        // Get tenant details - note that for tenant-initiated requests,
        // the tenant is the creator, not in invitedTenantEmail
        const tenant = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), tenancy.invitedTenantEmail))
            .first();

        return {
            success: true,
            tenancy,
            property,
            tenant,
        };
    },
});

export const resendInvitation = mutation({
    args: {
        tenancyId: v.id("tenancies"),
    },
    returns: v.object({
        success: v.boolean(),
        error: v.optional(v.string()),
        message: v.optional(v.string()),
    }),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            return { success: false, error: "User must be authenticated" };
        }

        const tenancy = await ctx.db.get(args.tenancyId);
        if (!tenancy) {
            return { success: false, error: "Tenancy not found" };
        }

        // Check if user is authorized to resend (must be the landlord)
        if (tenancy.landlordId !== userId) {
            return {
                success: false,
                error: "Only the landlord can resend invitations",
            };
        }

        // Check if invitation is still pending
        if (
            tenancy.status !== TenancyStatus.INVITED &&
            tenancy.status !== TenancyStatus.TENANT_INITIATED
        ) {
            return {
                success: false,
                error: "Cannot resend invitation for this tenancy status",
            };
        }

        // Generate new token and expiry
        const newToken = crypto.randomUUID();
        const newExpiry = Date.now() + 14 * 24 * 60 * 60 * 1000; // 14 days

        // Update the tenancy with new token
        await ctx.db.patch(args.tenancyId, {
            inviteToken: newToken,
            inviteTokenExpiry: newExpiry,
            updatedAt: Date.now(),
        });

        // Get landlord info for email
        const landlord = await ctx.db.get(userId);
        const landlordName = landlord
            ? `${landlord.firstName} ${landlord.lastName}`
            : "Your Landlord";

        // Get property info
        const property = await ctx.db.get(tenancy.propertyId);
        const propertyAddress = property
            ? `${property.addressLine1}, ${property.city}`
            : "Your Property";

        // Schedule email to be sent (in a real implementation, you'd call the email action)
        // For now, we'll just log what would be sent
        console.log(
            `Resend invitation to ${tenancy.invitedTenantEmail} with token ${newToken}`,
        );

        return {
            success: true,
            message: "Invitation resent successfully",
        };
    },
});

export const getTenancyById = query({
    args: { tenancyId: v.id("tenancies") },
    returns: v.union(v.any(), v.null()),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("User must be authenticated");
        }

        const tenancy = await ctx.db.get(args.tenancyId);
        if (!tenancy) {
            return null;
        }

        // Check if user is authorized to view this tenancy
        if (tenancy.landlordId !== userId && tenancy.tenantId !== userId) {
            throw new Error("Unauthorized to view this tenancy");
        }

        return tenancy;
    },
});
