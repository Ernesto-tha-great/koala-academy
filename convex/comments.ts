// convex/comments.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
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

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await ctx.db
          .query("comments")
          .withIndex("by_parent")
          .filter((q) => q.eq(q.field("parentCommentId"), comment._id))
          .order("asc")
          .collect();

        return {
          ...comment,
          author: usersMap[comment.authorId],
          replies: await Promise.all(
            replies.map(async (reply) => ({
              ...reply,
              author: usersMap[reply.authorId],
            }))
          ),
        };
      })
    );

    return commentsWithReplies;
  },
});

export const create = mutation({
  args: {
    articleId: v.id("articles"),
    content: v.string(),
    parentCommentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new ConvexError("You must be logged in to comment");
    }

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

    // Get user info
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId")
      .filter(q => q.eq(q.field("userId"), identity.subject))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    const comment = await ctx.db.insert("comments", {
      articleId: args.articleId,
      content: args.content,
      authorId: identity.subject,
      authorName: user.name,
      parentCommentId: args.parentCommentId,
      status: "visible",
      createdAt: Date.now(),
    });

    return {
      _id: comment,
      articleId: args.articleId,
      content: args.content,
      authorId: identity.subject,
      authorName: user.name,
      parentCommentId: args.parentCommentId,
      status: "visible",
      createdAt: Date.now(),
      author: {
        userId: user.userId,
        name: user.name,
      }
    };
  },
});

export const update = mutation({
  args: {
    id: v.id("comments"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new ConvexError("You must be logged in to update a comment");
    }

    const comment = await ctx.db.get(args.id);
    if (!comment) {
      throw new ConvexError("Comment not found");
    }

    // Check if user is the author
    if (comment.authorId !== identity.subject) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_userId")
        .filter(q => q.eq(q.field("userId"), identity.subject))
        .first();

      if (!user || user.role !== "admin") {
        throw new ConvexError("Not authorized to update this comment");
      }
    }

    const updatedComment = await ctx.db.patch(args.id, {
      content: args.content,
      updatedAt: Date.now(),
    });

    return updatedComment;
  },
});

export const remove = mutation({
  args: {
    id: v.id("comments"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new ConvexError("You must be logged in to delete a comment");
    }

    const comment = await ctx.db.get(args.id);
    if (!comment) {
      throw new ConvexError("Comment not found");
    }

    // Check if user is the author
    if (comment.authorId !== identity.subject) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_userId")
        .filter(q => q.eq(q.field("userId"), identity.subject))
        .first();

      if (!user || user.role !== "admin") {
        throw new ConvexError("Not authorized to delete this comment");
      }
    }

    // Soft delete by updating status
    await ctx.db.patch(args.id, {
      status: "deleted",
      deletedAt: Date.now(),
    });

    return { success: true };
  },
});

export const moderate = mutation({
  args: {
    id: v.id("comments"),
    status: v.union(v.literal("visible"), v.literal("hidden"), v.literal("deleted")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new ConvexError("You must be logged in to moderate comments");
    }

    // Verify admin status
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId")
      .filter(q => q.eq(q.field("userId"), identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new ConvexError("Not authorized to moderate comments");
    }

    const comment = await ctx.db.patch(args.id, {
      status: args.status,
      moderatedAt: Date.now(),
      moderatedBy: identity.subject,
    });

    return comment;
  },
});

// Get replies for a specific comment
export const getReplies = query({
  args: {
    commentId: v.id("comments"),
  },
  handler: async (ctx, args) => {
    const replies = await ctx.db
      .query("comments")
      .withIndex("by_parent")
      .filter((q) => q.eq(q.field("parentCommentId"), args.commentId))
      .order("asc")
      .collect();

    // Get users info for replies
    const userIds = [...new Set(replies.map(reply => reply.authorId))];
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

    return replies.map(reply => ({
      ...reply,
      author: usersMap[reply.authorId],
    }));
  },
});