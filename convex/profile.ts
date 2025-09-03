import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const updateProfile = mutation({
    args: {
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      phone: v.optional(v.string()),
      address: v.optional(v.string()),
      state: v.optional(v.string()),
      city: v.optional(v.string()),
      postalCode: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
      const userId = await getAuthUserId(ctx);
      if (!userId) {
        throw new Error("Not authenticated");
      }
  
      // filter out undefined values
      const updateData = Object.fromEntries(
        Object.entries(args).filter(([_, value]) => value !== undefined)
      );
  
      if (Object.keys(updateData).length === 0) {
        throw new Error("No fields provided to update");
      }
  
      await ctx.db.patch(userId, updateData);
      return userId;
    },
  });
  