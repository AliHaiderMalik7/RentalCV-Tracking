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

    // Get all users with tenant role
    const tenants = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("roles", "tenant"))
      .collect();

    return tenants;
  },
});




export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) return null;

    // Return only safe fields
    return {
      _id: user._id,
      name: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim(),
      email: user.email,
    };
  },
});
