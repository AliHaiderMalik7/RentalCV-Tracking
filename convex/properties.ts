import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
    args: {
        addressLine1: v.string(),
        addressLine2: v.optional(v.string()),
        city: v.string(),
        county: v.string(),
        postcode: v.string(),
        propertyType: v.union(
            v.literal("flat"),
            v.literal("house"),
            v.literal("bungalow"),
            v.literal("other")
        ),
        bedrooms: v.number(),
        bathrooms: v.number(),
        livingRooms: v.number(),
        kitchens: v.number(),
        hasGarden: v.boolean(),
        parkingType: v.union(
            v.literal("street"),
            v.literal("driveway"),
            v.literal("garage"),
            v.literal("none")
        ),
        occupancyStatus: v.optional(
            v.union(
                v.literal("vacant"),
                v.literal("occupied"),
                v.literal("maintenance"),
                v.literal("unavailable")
            )
        ),
        rent: v.optional(v.number()),
        epcRating: v.optional(v.union(
            v.literal("A"),
            v.literal("B"),
            v.literal("C"),
            v.literal("D"),
            v.literal("E"),
            v.literal("F"),
            v.literal("G")
        )),
        description: v.optional(v.string()),
        images: v.array(v.id("_storage")),
        documents: v.optional(v.array(v.id("_storage"))),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const normalizedAddress = args.addressLine1.trim().toLowerCase();
        const normalizedPostcode = args.postcode.trim().toLowerCase();

        console.log("adddresss", normalizedAddress, normalizedPostcode);
        
        if (!userId) {
            return { success: false, error: "❌ User must be authenticated" };
          }
        // Check if property exists with same address + postcode
        const existing = await ctx.db
        .query("properties")
        .withIndex("by_postcode_address", (q) =>
          q.eq("postcode", args.postcode ).eq("addressLine1", args.addressLine1)
        )
        .first();

        console.log("existing", existing);
        


            if (existing) {
                return { success: false, error: "⚠️ A property already exists at this address." };
              }


        const propertyId = await ctx.db.insert("properties", {
            landlordId: userId,
            addressLine1: args.addressLine1,
            addressLine2: args.addressLine2,
            city: args.city,
            county: args.county,
            postcode: args.postcode,
            propertyType: args.propertyType,
            bedrooms: args.bedrooms,
            bathrooms: args.bathrooms,
            livingRooms: args.livingRooms,
            kitchens: args.kitchens,
            hasGarden: args.hasGarden,
            parkingType: args.parkingType,
            epcRating: args.epcRating,
            images: args.images,
            documents: args.documents,
            description: args.description,
            createdAt: Date.now(),
            isActive: true,
            rent: args.rent,
            occupancyStatus: args.occupancyStatus,
        });

        return {
            success: true,
            message: "Property created successfully!",
            propertyId,
          };
    },
});

export const getByLandlord = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            return [];
        }

        const properties = await ctx.db
            .query("properties")
            .withIndex("landlord_properties", (q) => q.eq("landlordId", userId))
            .collect();

        // Get image URLs for each property
        const propertiesWithImages = await Promise.all(
            properties.map(async (property) => {
                const imageUrls = await Promise.all(
                    property.images.map(async (imageId) => {
                        const url = await ctx.storage.getUrl(imageId);
                        return url;
                    })
                );

                return {
                    ...property,
                    imageUrls: imageUrls.filter(Boolean), // Remove null URLs
                };
            })
        );

        return propertiesWithImages;
    },
});

export const generateUploadUrl = mutation({
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("User must be authenticated to upload files");
        }

        return await ctx.storage.generateUploadUrl();
    },
});

export const generateUrl = mutation({
    handler: async (ctx) => {
        // Allow uploads without authentication
        return await ctx.storage.generateUploadUrl();
    },
});

export const generateFileUrl = query({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.storageId);
    },
});


export const getById = query({
    args: { propertyId: v.id("properties") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("User must be authenticated");
        }

        const property = await ctx.db.get(args.propertyId);
        if (!property) {
            return null;
        }

        // Check if the user owns this property
        if (property.landlordId !== userId) {
            throw new Error("Unauthorized to view this property");
        }

        // Get image URLs
        const imageUrls = await Promise.all(
            property.images.map(async (imageId) => {
                const url = await ctx.storage.getUrl(imageId);
                return url;
            })
        );

        return {
            ...property,
            imageUrls: imageUrls.filter(Boolean),
        };
    },
});

export const update = mutation({
    args: {
        propertyId: v.id("properties"),
        addressLine1: v.optional(v.string()),
        addressLine2: v.optional(v.string()),
        city: v.optional(v.string()),
        county: v.optional(v.string()),
        postcode: v.optional(v.string()),
        propertyType: v.optional(v.union(
            v.literal("flat"),
            v.literal("house"),
            v.literal("bungalow"),
            v.literal("other")
        )),
        bedrooms: v.optional(v.number()),
        bathrooms: v.optional(v.number()),
        livingRooms: v.optional(v.number()),
        kitchens: v.optional(v.number()),
        hasGarden: v.optional(v.boolean()),
        parkingType: v.optional(v.union(
            v.literal("street"),
            v.literal("driveway"),
            v.literal("garage"),
            v.literal("none")
        )),
        epcRating: v.optional(v.union(
            v.literal("A"),
            v.literal("B"),
            v.literal("C"),
            v.literal("D"),
            v.literal("E"),
            v.literal("F"),
            v.literal("G")
        )),
        images: v.optional(v.array(v.id("_storage"))),
        documents: v.optional(v.array(v.id("_storage"))),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("User must be authenticated");
        }

        const property = await ctx.db.get(args.propertyId);
        if (!property) {
            throw new Error("Property not found");
        }

        if (property.landlordId !== userId) {
            throw new Error("Unauthorized to update this property");
        }

        const { propertyId, ...updateData } = args;
        await ctx.db.patch(propertyId, updateData);

        return propertyId;
    },
});

export const deleteProperty = mutation({
    args: { propertyId: v.id("properties") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("User must be authenticated");
        }

        const property = await ctx.db.get(args.propertyId);
        if (!property) {
            throw new Error("Property not found");
        }

        console.log("property and lanlord", property.landlordId, userId, property, args.propertyId);
        

        if (property.landlordId !== userId) {
            throw new Error("Unauthorized to delete this property");
        }

        await ctx.db.delete(args.propertyId);
        return args.propertyId;
    },
});
