"use client";

import { useParams } from "next/navigation";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { BackButton } from "@/components/BackButton";
import { Id } from "../../../../../../convex/_generated/dataModel";

export default function EditArticlePage() {
  const params = useParams();
  
  console.log("params.id", params.id);
  // Convert string ID to Convex ID type
  const articleId = params.id ? (params.id as Id<"articles">) : null;
  
  const article = useQuery(
    api.articles.getById, 
    articleId ? { id: articleId } : "skip"
  );

  if (!article) {
    return (
      <div className="p-8">
        <div className="h-8 bg-muted rounded w-1/4 animate-pulse" />
        <div className="mt-4 space-y-4">
          <div className="h-12 bg-muted rounded animate-pulse" />
          <div className="h-12 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      <BackButton />
      <h1 className="text-2xl font-bold">Edit Article: {article.title}</h1>
      <ArticleForm article={article} defaultValues={article} />
    </div>
  );
}