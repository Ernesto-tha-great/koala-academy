import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./auth";

export const list = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    
    const users = await ctx.db
      .query("users")
      .collect();

    return users.map(user => ({
      ...user,
      // Ensure sensitive data isn't exposed
      _id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }));
  },
});

export const createOrUpdate = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
    name: v.string(),
    admin: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("userId"), args.userId))
      .first();

    const timestamp = Date.now();

    if (existingUser) {
      // Update existing user
      return await ctx.db.patch(existingUser._id, {
        name: args.name,
        email: args.email,
        updatedAt: timestamp,
        role: args.admin ? "admin" : "user"
      });
    }
    // Create new user
    return await ctx.db.insert("users", {
      userId: args.userId,
      email: args.email,
      name: args.name,
      role: "user", // Default role
      createdAt: timestamp,
      updatedAt: timestamp
    });
  },
});

export const updateRole = mutation({
  args: {
    userId: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const user = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("userId"), args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    return await ctx.db.patch(user._id, {
      role: args.role,
      updatedAt: Date.now()
    });
  },
});

export const getUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("userId"), args.userId))
      .first();
  },
});

export const isAdmin = query(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;
  
  const user = await ctx.db
    .query("users")
    .filter(q => q.eq(q.field("userId"), identity.subject))
    .unique();
    
  return user?.role === "admin";
});