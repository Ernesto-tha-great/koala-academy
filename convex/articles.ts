// convex/articles.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const list = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const articles = await ctx.db
      .query("articles")
      .order("desc")
      .take(limit);
    
    return articles;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    type: v.union(v.literal("markdown"), v.literal("external"), v.literal("video")),
    externalUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const article = await ctx.db.insert("articles", {
      ...args,
      slug: args.title.toLowerCase().replace(/\s+/g, "-"),
      authorId: identity.subject,
      publishedAt: Date.now().toString(),
      likes: 0,
      readTime: Math.ceil(args.content.split(" ").length / 200), // Rough estimate
    });

    return article;
  },
});