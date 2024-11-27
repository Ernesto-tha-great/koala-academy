// convex/comments.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser, auditLog } from "./auth";
import { ConvexError } from "convex/values";

export const list = query({
  args: {
    articleId: v.id("articles"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_article")
      .filter((q) => 
        q.and(
          q.eq(q.field("articleId"), args.articleId),
          q.eq(q.field("status"), "visible")
        )
      )
      .order("desc")
      .take(args.limit ?? 20);

    // Get users info for comments
    const userIds = [...new Set(comments.map(comment => comment.authorId))];
    const users = await Promise.all(
      userIds.map(id => 
        ctx.db
          .query("users")
          .filter(q => q.eq(q.field("userId"), id))
          .first()
      )
    );

    const usersMap = Object.fromEntries(
      users.map(user => [user!.userId, user])
    );

    return comments.map(comment => ({
      ...comment,
      author: usersMap[comment.authorId],
    }));
  },
});

export const create = mutation({
  args: {
    articleId: v.id("articles"),
    content: v.string(),
    parentCommentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    // Validate article exists
    const article = await ctx.db.get(args.articleId);
    if (!article) {
      throw new ConvexError("Article not found");
    }

    // Validate parent comment if provided
    if (args.parentCommentId) {
      const parentComment = await ctx.db.get(args.parentCommentId);
      if (!parentComment || parentComment.articleId !== args.articleId) {
        throw new ConvexError("Invalid parent comment");
      }
    }

    const comment = await ctx.db.insert("comments", {
      articleId: args.articleId,
      content: args.content,
      authorId: user.user.userId,
      authorName: user.user.name,
      parentCommentId: args.parentCommentId,
      status: "visible",
      createdAt: Date.now(),
    });

    await auditLog(
      ctx,
      "comment_created",
      user.user.userId,
      "comments",
      comment,
      JSON.stringify({ articleId: args.articleId })
    );

    return comment;
  },
});

export const update = mutation({
  args: {
    id: v.id("comments"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const comment = await ctx.db.get(args.id);

    if (!comment) {
      throw new ConvexError("Comment not found");
    }

    if (comment.authorId !== user.user.userId && user.user.role !== "admin") {
      throw new ConvexError("Not authorized to update this comment");
    }

    const updatedComment = await ctx.db.patch(args.id, {
      content: args.content,
      updatedAt: Date.now(),
    });

    await auditLog(
      ctx,
      "comment_updated",
      user.user.userId,
      "comments",
      args.id,
      JSON.stringify({ content: args.content })
    );

    return updatedComment;
  },
});

export const moderate = mutation({
  args: {
    id: v.id("comments"),
    status: v.union(v.literal("visible"), v.literal("hidden"), v.literal("deleted")),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    
    if (user.user.role !== "admin") {
      throw new ConvexError("Not authorized to moderate comments");
    }

    const comment = await ctx.db.patch(args.id, {
      status: args.status,
    });

    await auditLog(
      ctx,
      "comment_moderated",
      user.user.userId,
      "comments",
      args.id,
      JSON.stringify({ status: args.status })
    );

    return comment;
  },
});

export const getModeration = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(v.union(v.literal("visible"), v.literal("hidden"), v.literal("deleted"))),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    
    if (user.user.role !== "admin") {
      throw new ConvexError("Not authorized to view moderation queue");
    }

    let query = ctx.db.query("comments");
    
    if (args.status) {
      query = query.filter(q => q.eq(q.field("status"), args.status));
    }

    const comments = await query
      .order("desc")
      .take(args.limit ?? 50);

    return comments;
  },
});