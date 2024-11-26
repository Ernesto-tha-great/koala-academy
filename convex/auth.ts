// convex/auth.ts
import { QueryCtx, MutationCtx, DatabaseReader } from "./_generated/server";
import { ConvexError } from "convex/values";

export type UserRole = "admin" | "author" | "user";

export async function getUser(ctx: QueryCtx | MutationCtx, userId: string) {
  return await ctx.db
    .query("users")
    .filter((q) => q.eq(q.field("userId"), userId))
    .first();
}

export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Unauthenticated");
  }

  const user = await getUser(ctx, identity.subject);
  if (!user) {
    throw new ConvexError("User not found");
  }

  return { identity, user };
}

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const { user } = await requireUser(ctx);
  if (user.role !== "admin") {
    throw new ConvexError("Unauthorized: Admin access required");
  }
  return user;
}

export async function requireAuthorOrAdmin(ctx: QueryCtx | MutationCtx) {
  const { user } = await requireUser(ctx);
  if (user.role !== "admin" && user.role !== "author") {
    throw new ConvexError("Unauthorized: Author or admin access required");
  }
  return user;
}

// Helper to check resource ownership
export async function canModifyResource(
  db: DatabaseReader,
  userId: string,
  resourceType: string,
  resourceId: string
) {
  const user = await db
    .query("users")
    .filter((q) => q.eq(q.field("userId"), userId))
    .first();

  if (user?.role === "admin") return true;

  switch (resourceType) {
    case "articles":
      const article = await db.query("articles").filter((q) => q.eq(q.field("_id"), resourceId)).first();
      return article?.authorId === userId;
    case "comments":
      const comment = await db.query("comments").filter((q) => q.eq(q.field("_id"), resourceId)).first();
      return comment?.authorId === userId;
    default:
      return false;
  }
}

export async function auditLog(
  ctx: MutationCtx,
  action: string,
  userId: string,
  resourceType: string,
  resourceId: string,
  details: string
) {
  await ctx.db.insert("audit_logs", {
    action,
    userId,
    resourceType,
    resourceId,
    timestamp: Date.now(),
    details,
  });
}