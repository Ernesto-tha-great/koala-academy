import { query } from "./_generated/server";
import { requireAdmin } from "./auth";

export const getStats = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    
    const [articles, comments, articleViews] = await Promise.all([
      ctx.db.query("articles").collect(),
      ctx.db.query("comments").collect(),
      ctx.db.query("articleViews").collect(),
    ]);

    const totalViews = articleViews.length;

    const viewsByArticle = articleViews.reduce((acc, view) => {
      acc[view.articleId] = (acc[view.articleId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalArticles: articles.length,
      totalComments: comments.length,
      totalViews,
      uniqueArticleViews: Object.keys(viewsByArticle).length,
      publishedArticles: articles.filter(a => a.status === "published").length,
      draftArticles: articles.filter(a => a.status === "draft").length,
    };
  },
});