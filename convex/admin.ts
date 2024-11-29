// convex/admin.ts
import { query } from "./_generated/server";
import { requireAdmin } from "./auth";

export const getStats = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    
    const [articles, comments] = await Promise.all([
      ctx.db.query("articles").collect(),
      ctx.db.query("comments").collect(),
    ]);

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