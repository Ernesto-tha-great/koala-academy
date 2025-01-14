import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./auth";
import { ADMIN_EMAILS } from "../src/lib/adminEmails";

export const list = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    
    const users = await ctx.db
      .query("users")
      .collect();

    return users.map(user => ({
      ...user,
      _id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }));
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user exists by email
    const existingUser = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("email"), args.email))
      .first();

    if (existingUser) {
      return existingUser;
    }

    const timestamp = Date.now();
    
    return await ctx.db.insert("users", {
      userId: args.userId,
      email: args.email,
      name: args.name,
      role: "user", 
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

export const isAdminEmail = (email: string) => {
  return ADMIN_EMAILS.includes(email);
};

export const isAdminById = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("userId"), args.userId))
      .first();
    return { isAdmin: user?.role === "admin", email: user?.email };
  },
});

export const isAdminByEmail = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;
    
    // Log the email and ADMIN_EMAILS for debugging
    console.log("User email:", identity.email);
    console.log("Admin emails:", ADMIN_EMAILS);
    
    // Check both tokenIdentifier and email
    const user = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("userId"), identity.subject))
      .first();
      
    // Return true if either condition is met
    return (
      (user && user.role === "admin") || 
      (identity.email && ADMIN_EMAILS.includes(identity.email))
    );
  },
});