
// import { action, query } from "../../_generated/server";
// import { v } from "convex/values";

// export const checkUserExists = query({
//     args: { email: v.string() },
//     handler: async (ctx, args) => {
//       const tokenIdentifier = `password|${args.email}`;
  
//       const allAccounts = await ctx.db.query("authAccounts").collect();
//       const user = allAccounts.find((account) => {
//         const token = (account as any).tokenIdentifier;
//         return token === tokenIdentifier;
//       });
  
//       return { exists: !!user };
//     },
//   });
  