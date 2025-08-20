// users.ts
import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getTenants = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    // First verify the requesting user is a landlord or admin
    // const currentUser = await ctx.db
    //   .query("users")
    //   .withIndex("by_userId", (q) => q.eq("userId", userId))
    //   .unique();

    // if (!currentUser) {
    //   throw new Error("User not found");
    // }

    // if (currentUser.role !== "landlord" && currentUser.role !== "admin") {
    //   throw new Error("Unauthorized - only landlords and admins can view tenants");
    // }

    // Get all users with tenant role
    const tenants = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("roles", "tenant"))
      .collect();

    return tenants;
  },
});

// export const getTenantById = query({
//   args: { tenantId: v.id("users") },
//   handler: async (ctx, args) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) {
//       throw new Error("User must be authenticated");
//     }

//     // Verify requesting user is landlord or admin
//     const currentUser = await ctx.db
//       .query("users")
//       .withIndex("by_userId", (q) => q.eq("userId", userId))
//       .unique();

//     if (!currentUser) {
//       throw new Error("User not found");
//     }

//     if (currentUser.role !== "landlord" && currentUser.role !== "admin") {
//       throw new Error("Unauthorized - only landlords and admins can view tenant details");
//     }

//     // Get the tenant
//     const tenant = await ctx.db.get(args.tenantId);
//     if (!tenant) {
//       throw new Error("Tenant not found");
//     }

//     if (tenant.role !== "tenant") {
//       throw new Error("User is not a tenant");
//     }

//     return {
//       id: tenant._id,
//       userId: tenant.userId,
//       name: tenant.name,
//       email: tenant.email,
//       phone: tenant.phone,
//       createdAt: tenant.createdAt,
//     };
//   },
// });