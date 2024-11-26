// convex/articles.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireAuthorOrAdmin, requireUser, auditLog } from "./auth";
import { ConvexError } from "convex/values";
import { Id } from "./_generated/dataModel";
import { generateSlug, validateUrl, calculateReadingTime } from "./utils";

// List articles with filtering and pagination
export const list = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.id("articles")),
    tag: v.optional(v.string()),
    status: v.optional(v.union(v.literal("published"), v.literal("draft"), v.literal("archived"))),
    authorId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("articles").withIndex("by_status_and_date");
    
    const identity = await ctx.auth.getUserIdentity();
    
    // Filter by status
    if (!identity) {
      // Non-authenticated users only see published articles
      query = query.filter(q => q.eq(q.field("status"), "published"));
    } else if (args.status) {
      query = query.filter(q => q.eq(q.field("status"), args.status));
    }

    // Filter by tag if provided
    // if (args.tag) {
    //   query = query.filter(q => q.contains(q.field("tags"), args.tag));
    // }

    // Filter by author if provided
    if (args.authorId) {
      query = query.filter(q => q.eq(q.field("authorId"), args.authorId));
    }

    // Handle pagination
    if (args.cursor) {
      query = query.filter(q => q.gt(q.field("_id"), args.cursor!));
    }

    const articles = await query
      .order("desc")
      .take(args.limit ?? 10);

    // Fetch authors info
    const authorIds = [...new Set(articles.map(article => article.authorId))];
    const authors = await Promise.all(
      authorIds.map(id => 
        ctx.db
          .query("users")
          .filter(q => q.eq(q.field("userId"), id))
          .first()
      )
    );

    const authorsMap = Object.fromEntries(
      authors.map(author => [author!.userId, author])
    );

    return articles.map(article => ({
      ...article,
      author: authorsMap[article.authorId],
    }));
  },
});

// Get a single article by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    const article = await ctx.db
      .query("articles")
      .withIndex("by_slug")
      .filter(q => q.eq(q.field("slug"), args.slug))
      .first();

    if (!article) return null;

    // Check visibility
    if (article.status !== "published") {
      if (!identity) return null;
      const user = await ctx.db
        .query("users")
        .filter(q => q.eq(q.field("userId"), identity.subject))
        .first();
      
      if (!user || (user.role !== "admin" && article.authorId !== identity.subject)) {
        return null;
      }
    }


    // Get author info
    const author = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("userId"), article.authorId))
      .first();

    return { ...article, author };
  },
});

// increment views. remember to call both in the frontend
export const incrementViews = mutation({
    args: { articleId: v.id("articles") },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();
      const article = await ctx.db.get(args.articleId);
      
      if (!article) return;
      
      // Only increment views if the viewer is not the author
      if (identity?.subject !== article.authorId) {
        await ctx.db.patch(args.articleId, {
          views: article.views + 1,
        });
      }
    },
  });

// Create new article
export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
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
    const user = await requireAuthorOrAdmin(ctx);

    // Validate URLs if provided
    if (args.externalUrl && !validateUrl(args.externalUrl)) {
      throw new ConvexError("Invalid external URL");
    }
    if (args.videoUrl && !validateUrl(args.videoUrl)) {
      throw new ConvexError("Invalid video URL");
    }

    // Generate unique slug
    const slug = await generateSlug(ctx.db, args.title);
    const timestamp = Date.now();

    const article = await ctx.db.insert("articles", {
      ...args,
      slug,
      authorId: user.userId,
      publishedAt: args.status === "published" ? timestamp : undefined,
      likes: 0,
      views: 0,
      readingTime: calculateReadingTime(args.content),
      lastModified: timestamp,
    });

    // Update tag counts and create new tags if needed
    for (const tag of args.tags) {
      await ctx.db
        .query("tags")
        .filter(q => q.eq(q.field("name"), tag))
        .first()
        .then(async existingTag => {
          if (existingTag) {
            await ctx.db.patch(existingTag._id, {
              articleCount: existingTag.articleCount + 1,
            });
          } else {
            await ctx.db.insert("tags", {
              name: tag,
              slug: tag.toLowerCase().replace(/\s+/g, "-"),
              articleCount: 1,
            });
          }
        });
    }

    await auditLog(
      ctx,
      "article_created",
      user.userId,
      "articles",
      article,
      JSON.stringify({ title: args.title, status: args.status })
    );

    return article;
  },
});

// Update existing article
export const update = mutation({
  args: {
    id: v.id("articles"),
    title: v.string(),
    content: v.string(),
    excerpt: v.string(),
    type: v.union(v.literal("markdown"), v.literal("external"), v.literal("video")),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
    externalUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    tags: v.array(v.string()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const existing = await ctx.db.get(args.id);
    
    if (!existing) {
      throw new ConvexError("Article not found");
    }
    // Check permissions
    if (user.user.role !== "admin" && existing.authorId !== user.user.userId) {
      throw new ConvexError("Not authorized to update this article");
    }

    // Validate URLs if provided
    if (args.externalUrl && !validateUrl(args.externalUrl)) {
      throw new ConvexError("Invalid external URL");
    }
    if (args.videoUrl && !validateUrl(args.videoUrl)) {
      throw new ConvexError("Invalid video URL");
    }

    // Generate new slug if title changed
    const slug = args.title !== existing.title 
      ? await generateSlug(ctx.db, args.title, existing._id)
      : existing.slug;

    // Handle publishing status change
    let publishedAt = existing.publishedAt;
    if (args.status === "published" && !existing.publishedAt) {
      publishedAt = Date.now();
    }

    // Update tag counts
    const removedTags = existing.tags.filter(tag => !args.tags.includes(tag));
    const addedTags = args.tags.filter(tag => !existing.tags.includes(tag));

    // Decrease count for removed tags
    for (const tag of removedTags) {
      const existingTag = await ctx.db
        .query("tags")
        .filter(q => q.eq(q.field("name"), tag))
        .first();
      
      if (existingTag) {
        const newCount = existingTag.articleCount - 1;
        if (newCount === 0) {
          await ctx.db.delete(existingTag._id);
        } else {
          await ctx.db.patch(existingTag._id, {
            articleCount: newCount,
          });
        }
      }
    }

    // Increase count for added tags
    for (const tag of addedTags) {
      const existingTag = await ctx.db
        .query("tags")
        .filter(q => q.eq(q.field("name"), tag))
        .first();
      
      if (existingTag) {
        await ctx.db.patch(existingTag._id, {
          articleCount: existingTag.articleCount + 1,
        });
      } else {
        await ctx.db.insert("tags", {
          name: tag,
          slug: tag.toLowerCase().replace(/\s+/g, "-"),
          articleCount: 1,
        });
      }
    }

    const article = await ctx.db.patch(args.id, {
      ...args,
      slug,
      publishedAt,
      readingTime: calculateReadingTime(args.content),
      lastModified: Date.now(),
    });

    await auditLog(
      ctx,
      "article_updated",
      user.user.userId,
      "articles", 
      args.id,
      JSON.stringify({ title: args.title, status: args.status })
    );

    return article;
  },
});

// Delete article
export const remove = mutation({
  args: { id: v.id("articles") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const article = await ctx.db.get(args.id);
    
    if (!article) {
      throw new ConvexError("Article not found");
    }
    // Check permissions
    if (user.user.role !== "admin" && article.authorId !== user.user.userId) {
      throw new ConvexError("Not authorized to delete this article");
    }

    // Update tag counts
    for (const tag of article.tags) {
      const existingTag = await ctx.db
        .query("tags")
        .filter(q => q.eq(q.field("name"), tag))
        .first();
      
      if (existingTag) {
        const newCount = existingTag.articleCount - 1;
        if (newCount === 0) {
          await ctx.db.delete(existingTag._id);
        } else {
          await ctx.db.patch(existingTag._id, {
            articleCount: newCount,
          });
        }
      }
    }

    await ctx.db.delete(args.id);

    await auditLog(
      ctx,
      "article_deleted",
      user.user.userId,
      "articles", 
      args.id,
      JSON.stringify({ title: article.title })
    );
  },
});

// Get related articles
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
        q.eq(q.field("status"), "published"),
        // q.or(...article.tags.map(tag => q.contains(q.field("tags"), tag)))
      )
    )
      .order("desc")
      .take(args.limit ?? 3);

    return related;
  },
});

// Search articles
export const search = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    let searchQuery = ctx.db
      .query("articles")
      .withSearchIndex("search", q => q.search("title", args.query));

    if (!identity) {
      searchQuery = searchQuery.filter(q => q.eq(q.field("status"), "published"));
    }

    return await searchQuery
    //   .order("desc")
      .take(args.limit ?? 10);
  },
});