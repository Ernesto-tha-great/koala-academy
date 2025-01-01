import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireUser } from "./auth";
import { ConvexError } from "convex/values";
import { formatISO } from "date-fns";
import { Id } from "./_generated/dataModel";

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
    category: v.union(v.literal("article"), v.literal("guide"), v.literal("morph")),
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
      category: args.category, // Add required category field
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

export const getById = query({
    args: { id: v.id("articles") },
    handler: async (ctx, args) => {
        const article = await ctx.db
        .query("articles")
        .filter(q => q.eq(q.field("_id"), args.id))
        .first();

        if (!article) return null;

        const author = await ctx.db
        .query("users")
        .filter(q => q.eq(q.field("userId"), article.authorId))
        .first();

        return { ...article, author };
    }
})

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




export const trending = query({
    handler: async (ctx) => {
      const articles = await ctx.db
        .query("articles")
        .filter((q) => q.eq(q.field("status"), "published"))
        .collect(); // Collect all published articles
  
      // Sort articles by views in descending order
      articles.sort((a, b) => b.views - a.views);
  
      // Take the top 5 articles
      return articles.slice(0, 5);
    },
  });


  export const recordView = mutation({
    args: { articleId: v.id("articles") },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();
      const timestamp = Date.now();
      const date = formatISO(timestamp, { representation: 'date' });
  
      // Single query to check for recent views from this user
      const recentView = await ctx.db
        .query("articleViews")
        .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
        .filter((q) => {
          const userCheck = identity?.subject 
            ? q.eq(q.field("userId"), identity.subject)
            : q.eq(q.field("userId"), undefined);
          return q.and(
            userCheck,
            q.gt(q.field("viewedAt"), timestamp - 300000)
          );
        })
        .first();
  
      if (recentView) {
        return; // Skip if recent view exists
      }
  
      // Record new view and increment article counter in one transaction
      await ctx.db.insert("articleViews", {
        articleId: args.articleId,
        userId: identity?.subject,
        viewedAt: timestamp,
        date,
      });
  
      // Use atomic increment for article views
      const article = await ctx.db.get(args.articleId);
      await ctx.db.patch(args.articleId, {
        views: (article?.views ?? 0) + 1
      });
    },
  });
  // Get top articles by views for a specific date
  export const getTopArticles = query({
    args: {
      date: v.optional(v.string()), // YYYY-MM-DD format
      limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
      const date = args.date || formatISO(new Date(), { representation: 'date' });
      const limit = args.limit || 5;
  
      // Get view counts for the date
      const views = await ctx.db
        .query("articleViews")
        .withIndex("by_date", (q) => q.eq("date", date))
        .collect();
  
      // Count views per article
      const viewCounts = views.reduce((acc, view) => {
        acc[view.articleId] = (acc[view.articleId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
  
      // Get article details and sort by views
      const articles = await Promise.all(
        Object.entries(viewCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, limit)
          .map(async ([articleId]) => {
            const article = await ctx.db.get(articleId as Id<"articles">);
            return {
              ...article,
              dailyViews: viewCounts[articleId],
            };
          })
      );
  
      return articles.filter(Boolean);
    },
  });
  
  // Get view stats for a specific article
  export const getArticleStats = query({
    args: { articleId: v.id("articles") },
    handler: async (ctx, args) => {
      const views = await ctx.db
        .query("articleViews")
        .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
        .collect();
  
      // Group views by date
      const dailyViews = views.reduce((acc, view) => {
        acc[view.date] = (acc[view.date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
  
      return {
        totalViews: views.length,
        dailyViews,
      };
    },
  });

  export const search = query({
    args: {
      query: v.string(),
      type: v.optional(v.union(v.literal("article"), v.literal("guide"), v.literal("morph"))),
      limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
      const searchQuery = args.query.toLowerCase();
      const limit = args.limit ?? 10;

      let query = ctx.db
        .query("articles")
        .filter((q) => 
          q.eq(q.field("status"), "published")
        );

      // Add type filter if specified
      if (args.type) {
        query = query.filter((q) => 
          q.eq(q.field("category"), args.type)
        );
      }

      const results = await query.collect();

      // Filter by search terms
      const filtered = results.filter(article => 
        article.title.toLowerCase().includes(searchQuery) ||
        article.excerpt.toLowerCase().includes(searchQuery) ||
        article.content.toLowerCase().includes(searchQuery) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery))
      );

      return filtered.slice(0, limit);
    },
  });
