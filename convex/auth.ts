// convex/auth.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";
import { ADMIN_EMAILS } from "../src/lib/adminEmails";

export async function getUser(ctx: { auth: any; db: any }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  return await ctx.db
    .query("users")
    .filter((q: any) => q.eq(q.field("userId"), identity.subject))
    .first();
}

export async function requireUser(ctx: { auth: any; db: any }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .filter((q: any) => q.eq(q.field("userId"), identity.subject))
    .first();

  if (!user) {
    throw new ConvexError("User not found");
  }

  return user;
}

export async function requireAdmin(ctx: { auth: any; db: any }) {
  const user = await requireUser(ctx);
  if (user.role !== "admin") {
    throw new ConvexError("Not authorized: Admin access required");
  }
  return user;
}

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    return user?.role === "admin" || false;
  },
});

export const createOrGetUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q: any) => q.eq(q.field("userId"), identity.subject))
      .first();

    if (existingUser) {
      return existingUser;
    }
    // Create new user if doesn't exist
    return await ctx.db.insert("users", {
      userId: identity.subject,
      email: identity.email!,
      name: identity.name || "Anonymous",
      role: ADMIN_EMAILS.includes(identity.email!) ? "admin" : "user",
      lastLogin: Date.now(), // Add required lastLogin field
    });
  },
});