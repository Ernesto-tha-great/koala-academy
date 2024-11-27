import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireUser } from "./auth";

export const getStats = query({
  handler: async (ctx) => {
    await requireUser(ctx);
    
    const [articles, comments] = await Promise.all([
      ctx.db.query("articles").collect(),
      ctx.db.query("comments").collect(),
    ]);

    // Calculate total views
    const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0);

    return {
      totalArticles: articles.length,
      totalComments: comments.length,
      totalViews,
      publishedArticles: articles.filter(a => a.status === "published").length,
      draftArticles: articles.filter(a => a.status === "draft").length,
    };
  },
});

export const getRecentActivity = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    
    return await ctx.db
      .query("audit_logs")
      .order("desc")
      .take(args.limit ?? 10);
  },
});

