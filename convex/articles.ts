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
    type: v.union(
      v.literal("markdown"),
      v.literal("external"),
      v.literal("video")
    ),
    status: v.union(v.literal("draft"), v.literal("published")),
    externalUrl: v.optional(v.string()),
    tags: v.array(v.string()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    category: v.union(
      v.literal("article"),
      v.literal("guide"),
      v.literal("morph")
    ),
    level: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced")
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const slug = args.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    let submissionStatus: "pending" | "approved" = "pending";
    let status: "draft" | "published" = "draft";

    if (user.role === "admin") {
      submissionStatus = "approved";
      status = args.status;
    }

    const article = await ctx.db.insert("articles", {
      ...args,
      slug,
      authorId: user.userId,
      submissionStatus,
      status,
      publishedAt: status === "published" ? Date.now() : undefined,
      views: 0,
      likes: 0,
      readingTime: Math.ceil(args.content.split(/\s+/).length / 200),
      lastModified: Date.now(),
      submittedAt: Date.now(),
      category: args.category,
      level: args.level,
      seoTitle: args.seoTitle || args.title,
      seoDescription: args.seoDescription || args.excerpt,
    });

    return article;
  },
});

export const getPendingSubmissions = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const articles = await ctx.db
      .query("articles")
      .filter((q) => q.eq(q.field("submissionStatus"), "pending"))
      .order("desc")
      .collect();

    const authorIds = articles
      .filter((article) => article.authorId)
      .map((article) => article.authorId!);

    const users = await Promise.all(
      authorIds.map((id) =>
        ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("userId"), id))
          .first()
      )
    );

    const userMap = new Map(users.map((user) => [user?.userId, user]));

    return articles.map((article) => ({
      ...article,
      author: article.authorId ? userMap.get(article.authorId) : null,
    }));
  },
});

export const getAllSubmissions = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("needs_revision")
      )
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    let query = ctx.db.query("articles");

    if (args.status) {
      query = query.filter((q) =>
        q.eq(q.field("submissionStatus"), args.status)
      );
    } else {
      query = query.filter((q) =>
        q.neq(q.field("submissionStatus"), undefined)
      );
    }

    const articles = await query.order("desc").collect();

    const authorIds = articles
      .filter((article) => article.authorId)
      .map((article) => article.authorId!);

    const users = await Promise.all(
      authorIds.map((id) =>
        ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("userId"), id))
          .first()
      )
    );

    const userMap = new Map(users.map((user) => [user?.userId, user]));

    const filteredArticles = articles.filter((article) => {
      const author = article.authorId ? userMap.get(article.authorId) : null;
      return !(
        article.submissionStatus === "approved" && author?.role === "admin"
      );
    });

    return filteredArticles.map((article) => ({
      ...article,
      author: article.authorId ? userMap.get(article.authorId) : null,
    }));
  },
});

export const reviewSubmission = mutation({
  args: {
    id: v.id("articles"),
    action: v.union(
      v.literal("approve"),
      v.literal("reject"),
      v.literal("request_revision")
    ),
    reviewNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    if (!admin) return;

    const article = await ctx.db.get(args.id);
    if (!article) {
      throw new ConvexError("Article not found");
    }

    let submissionStatus: "approved" | "rejected" | "needs_revision";
    let status: "draft" | "published" | "archived" = article.status;
    let publishedAt = article.publishedAt;

    switch (args.action) {
      case "approve":
        submissionStatus = "approved";
        status = "published";
        publishedAt = Date.now();
        break;
      case "reject":
        submissionStatus = "rejected";
        status = "archived";
        break;
      case "request_revision":
        submissionStatus = "needs_revision";
        status = "draft";
        break;
    }

    await ctx.db.patch(args.id, {
      submissionStatus,
      status,
      publishedAt,
      reviewedBy: admin.userId,
      reviewedAt: Date.now(),
      reviewNotes: args.reviewNotes,
      lastModified: Date.now(),
    });

    return await ctx.db.get(args.id);
  },
});

export const editSubmission = mutation({
  args: {
    id: v.id("articles"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    headerImage: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    type: v.optional(
      v.union(v.literal("markdown"), v.literal("external"), v.literal("video"))
    ),
    category: v.optional(
      v.union(v.literal("article"), v.literal("guide"), v.literal("morph"))
    ),
    level: v.optional(
      v.union(
        v.literal("beginner"),
        v.literal("intermediate"),
        v.literal("advanced")
      )
    ),
    externalUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const user = await requireUser(ctx);

    const { id, ...updates } = args;

    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error(`Article with ID ${id} not found`);
    }

    if (!admin && existing.authorId !== user.id) {
      return new ConvexError("You cannot edit this submission");
    }

    const cleanUpdates: Record<string, any> = {};

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    });

    if (typeof cleanUpdates.title === "string") {
      cleanUpdates.slug = cleanUpdates.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }

    if (typeof cleanUpdates.content === "string") {
      cleanUpdates.readingTime = Math.ceil(
        cleanUpdates.content.split(/\s+/).length / 200
      );
    }

    cleanUpdates.lastModified = Date.now();

    await ctx.db.patch(id, cleanUpdates);

    const updated = await ctx.db.get(id);
    if (!updated) {
      throw new Error("Failed to update article");
    }

    return updated;
  },
});

export const update = mutation({
  args: {
    id: v.id("articles"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    headerImage: v.optional(v.string()),
    excerpt: v.string(),
    type: v.union(
      v.literal("markdown"),
      v.literal("external"),
      v.literal("video")
    ),
    status: v.optional(v.string()),
    category: v.union(
      v.literal("article"),
      v.literal("guide"),
      v.literal("morph")
    ),
    level: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced")
    ),
    externalUrl: v.optional(v.string()),
    tags: v.array(v.string()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const { id, ...updates } = args;

    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error(`Article with ID ${id} not found`);
    }

    if (user.role !== "admin" && existing.authorId !== user.userId) {
      throw new ConvexError("Not authorized to edit this article");
    }

    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(id, cleanUpdates);

    const updated = await ctx.db.get(id);
    if (!updated) {
      throw new Error("Failed to update article");
    }

    return updated;
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
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    } else {
      query = query.filter((q) => q.eq(q.field("status"), "published"));
    }

    // if (args.tag) {
    //   query = query.filter(q => q.contains(q.field("tags"), args.tag));
    // }

    const articles = await query.order("desc").take(args.limit ?? 10);

    const authorIds = [...new Set(articles.map((article) => article.authorId))];
    const users = await Promise.all(
      authorIds.map((id) =>
        ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("userId"), id))
          .first()
      )
    );

    const userMap = new Map(users.map((user) => [user?.userId, user]));

    return articles.map((article) => ({
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
      .filter((q) =>
        q.and(
          q.eq(q.field("slug"), args.slug),
          q.eq(q.field("status"), "published")
        )
      )
      .first();

    if (!article) return null;

    const author = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), article.authorId))
      .first();

    return { ...article, author };
  },
});

export const getById = query({
  args: { id: v.id("articles") },
  handler: async (ctx, { id }) => {
    const article = await ctx.db.get(id);

    if (!article) return null;

    return { ...article };
  },
});

export const getRelated = query({
  args: {
    articleId: v.id("articles"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const article = await ctx.db
      .query("articles")
      .filter((q) =>
        q.and(
          q.eq(q.field("_id"), args.articleId),
          q.eq(q.field("status"), "published")
        )
      )
      .first();
    if (!article) return [];

    const filteredArticles = await ctx.db
      .query("articles")
      .filter((q) =>
        q.and(
          q.neq(q.field("_id"), args.articleId),
          q.eq(q.field("status"), "published")
        )
      )
      .collect();

    const related = filteredArticles.filter((relatedArticle) => {
      const commonTags = relatedArticle.tags.filter((tag) =>
        article.tags.includes(tag)
      );
      return commonTags.length >= 2;
    });

    return args.limit ? related.slice(0, args.limit) : related;
  },
});

export const trending = query({
  handler: async (ctx) => {
    const articles = await ctx.db
      .query("articles")
      .filter((q) => q.eq(q.field("status"), "published"))
      .collect();

    articles.sort((a, b) => b.views - a.views);

    return articles.slice(0, 5);
  },
});

export const recordView = mutation({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const timestamp = Date.now();
    const date = formatISO(timestamp, { representation: "date" });

    const recentView = await ctx.db
      .query("articleViews")
      .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
      .filter((q) => {
        const userCheck = identity?.subject
          ? q.eq(q.field("userId"), identity.subject)
          : q.eq(q.field("userId"), undefined);
        return q.and(userCheck, q.gt(q.field("viewedAt"), timestamp - 300000));
      })
      .first();

    if (recentView) {
      return; // Skip if recent view exists
    }

    await ctx.db.insert("articleViews", {
      articleId: args.articleId,
      userId: identity?.subject,
      viewedAt: timestamp,
      date,
    });

    const article = await ctx.db.get(args.articleId);
    await ctx.db.patch(args.articleId, {
      views: (article?.views ?? 0) + 1,
    });
  },
});

export const getTopArticles = query({
  args: {
    date: v.optional(v.string()), // YYYY-MM-DD format
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const date = args.date || formatISO(new Date(), { representation: "date" });
    const limit = args.limit || 5;

    const views = await ctx.db
      .query("articleViews")
      .withIndex("by_date", (q) => q.eq("date", date))
      .collect();

    const viewCounts = views.reduce(
      (acc, view) => {
        acc[view.articleId] = (acc[view.articleId] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

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

export const getArticleStats = query({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    const views = await ctx.db
      .query("articleViews")
      .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
      .collect();

    const dailyViews = views.reduce(
      (acc, view) => {
        acc[view.date] = (acc[view.date] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalViews: views.length,
      dailyViews,
    };
  },
});

export const search = query({
  args: {
    query: v.string(),
    type: v.optional(
      v.union(v.literal("article"), v.literal("guide"), v.literal("morph"))
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const searchQuery = args.query.toLowerCase();
    const limit = args.limit ?? 10;

    let query = ctx.db
      .query("articles")
      .filter((q) => q.eq(q.field("status"), "published"));

    if (args.type) {
      query = query.filter((q) => q.eq(q.field("category"), args.type));
    }

    const results = await query.collect();

    const filtered = results.filter(
      (article) =>
        article.title.toLowerCase().includes(searchQuery) ||
        article.excerpt.toLowerCase().includes(searchQuery) ||
        article.content.toLowerCase().includes(searchQuery) ||
        article.tags.some((tag) => tag.toLowerCase().includes(searchQuery))
    );

    return filtered.slice(0, limit);
  },
});

export const listRaw = query({
  handler: async (ctx) => {
    const articles = await ctx.db.query("articles").collect();

    return articles;
  },
});
