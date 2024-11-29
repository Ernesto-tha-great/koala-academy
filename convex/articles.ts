import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireUser } from "./auth";
import { ConvexError } from "convex/values";

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    headerImage: v.optional(v.string()),
    excerpt: v.string(),
    type: v.union(v.literal("markdown"), v.literal("external"), v.literal("video")),
    status: v.union(v.literal("draft"), v.literal("published")),
    externalUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    tags: v.array(v.string()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const slug = args.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const article = await ctx.db.insert("articles", {
      ...args,
      slug,
      authorId: user.userId,
      publishedAt: args.status === "published" ? Date.now() : undefined,
      views: 0,
      likes: 0,
      readingTime: Math.ceil(args.content.split(/\s+/).length / 200),
      lastModified: Date.now(),
      // Use provided SEO fields or fallback to title/excerpt
      seoTitle: args.seoTitle || args.title,
      seoDescription: args.seoDescription || args.excerpt
    });

    return article;
  },
});

export const update = mutation({
  args: {
    id: v.id("articles"),
    title: v.string(),
    content: v.string(),
    headerImage: v.optional(v.string()),
    excerpt: v.string(),
    type: v.union(v.literal("markdown"), v.literal("external"), v.literal("video")),
    status: v.union(v.literal("draft"), v.literal("published")),
    externalUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    tags: v.array(v.string()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const { id, ...data } = args;

    const existingArticle = await ctx.db.get(id);
    if (!existingArticle) {
      throw new ConvexError("Article not found");
    }

    // Only allow admins or the original author to update
    if (user.role !== "admin" && existingArticle.authorId !== user.userId) {
      throw new ConvexError("Not authorized to update this article");
    }

    // Generate new slug if title changed
    const slug = data.title !== existingArticle.title
      ? data.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      : existingArticle.slug;

    return await ctx.db.patch(id, {
      ...data,
      slug,
      publishedAt: data.status === "published" && !existingArticle.publishedAt 
        ? Date.now() 
        : existingArticle.publishedAt,
      readingTime: Math.ceil(data.content.split(/\s+/).length / 200),
      lastModified: Date.now(),
      seoTitle: data.seoTitle || data.title,
      seoDescription: data.seoDescription || data.excerpt,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("articles") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const article = await ctx.db.get(args.id);

    if (!article) {
      throw new ConvexError("Article not found");
    }

    // Only allow admins or the original author to delete
    if (user.role !== "admin" && article.authorId !== user.userId) {
      throw new ConvexError("Not authorized to delete this article");
    }

    await ctx.db.delete(args.id);
  },
});

export const list = query({
  args: {
    limit: v.optional(v.number()),
    tag: v.optional(v.string()),
    status: v.optional(v.union(v.literal("published"), v.literal("draft"))),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("articles");
    
    if (args.status) {
      query = query.filter(q => q.eq(q.field("status"), args.status));
    } else {
      // If no status specified, only show published articles
      query = query.filter(q => q.eq(q.field("status"), "published"));
    }
    
    // if (args.tag) {
    //   query = query.filter(q => q.contains(q.field("tags"), args.tag));
    // }

    const articles = await query
      .order("desc")
      .take(args.limit ?? 10);

    // Get authors info
    const authorIds = [...new Set(articles.map(article => article.authorId))];
    const users = await Promise.all(
      authorIds.map(id =>
        ctx.db
          .query("users")
          .filter(q => q.eq(q.field("userId"), id))
          .first()
      )
    );

    const userMap = new Map(users.map(user => [user?.userId, user]));

    return articles.map(article => ({
      ...article,
      author: userMap.get(article.authorId),
    }));
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const article = await ctx.db
      .query("articles")
      .filter(q => q.eq(q.field("slug"), args.slug))
      .first();

    if (!article) return null;

    const author = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("userId"), article.authorId))
      .first();

    return { ...article, author };
  },
});

export const getRelated = query({
  args: {
    articleId: v.id("articles"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articleId);
    if (!article) return [];

    const related = await ctx.db
      .query("articles")
      .filter(q => 
        q.and(
          q.neq(q.field("_id"), args.articleId),
          q.eq(q.field("status"), "published")
        )
      )
      .order("desc")
      .take(args.limit ?? 3);

    return related;
  },
});

export const incrementViews = mutation({
  args: { id: v.id("articles") },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.id);
    if (!article) {
      throw new ConvexError("Article not found");
    }

    await ctx.db.patch(args.id, {
      views: (article.views ?? 0) + 1,
    });
  },
});