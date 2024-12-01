"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ArticleCard } from "./ArticleCard";

interface ArticleListProps {
    selectedTag?: string;
  }

export function ArticleList({ selectedTag }: ArticleListProps) {

  const articles = useQuery(api.articles.list, { status: "published",
    tag: selectedTag,});

  if (!articles) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {articles.map((article) => (
        <ArticleCard key={article._id} article={article} />
      ))}
    </div>
  );
}
