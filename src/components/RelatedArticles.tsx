"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import Link from "next/link";

interface RelatedArticlesProps {
  currentArticleId: Id<"articles">;
  tags: string[];
}

export function RelatedArticles({ currentArticleId, tags }: RelatedArticlesProps) {
  const relatedArticles = useQuery(api.articles.getRelated, {
    articleId: currentArticleId,
    limit: 3,
  });

  if (!relatedArticles?.length) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
      {relatedArticles.map((article) => (
        <Link
          key={article._id}
          href={`/blog/${article.slug}`}
          className="block group"
        >
          <article className="bg-gray-50 p-6 rounded-lg h-full hover:bg-gray-100 transition">
            <h3 className="font-semibold mb-2 group-hover:text-emerald-600">
              {article.title}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2 my-2">
              {article.excerpt}
            </p>
          </article>
        </Link>
      ))}
    </div>
  );
}