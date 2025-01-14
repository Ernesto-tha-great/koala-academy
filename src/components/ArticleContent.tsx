/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useQuery } from "convex/react";

import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
// import { LikeButton } from "./LikeButton";
import ReactMarkdown from "react-markdown";

interface ArticleContentProps {
  slug: string;
}

export function ArticleContent({ slug }: ArticleContentProps) {
  const article = useQuery(api.articles.getBySlug, { slug });
  const { user } = useUser();

  if (!article) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-100 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-1/4" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-100 rounded" />
          <div className="h-4 bg-gray-100 rounded" />
          <div className="h-4 bg-gray-100 rounded w-2/3" />
        </div>
      </div>
    );
  }

  return (
    <article className="prose prose-lg max-w-none">
      <h1>{article.title}</h1>
      
      <div className="flex items-center justify-between not-prose border-y py-4 my-8">
        <div className="flex items-center gap-4">
          <span>{article.readingTime} min read</span>
          {/* <LikeButton articleId={article._id} likes={article.likes} /> */}
        </div>
        
        {article.type === "external" && (
          <a
            href={article.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            Read on original site →
          </a>
        )}
      </div>

      {article.type === "video" && article.videoUrl && (
        <div className="aspect-w-16 aspect-h-9 mb-8">
          <iframe
            src={article.videoUrl}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      <ReactMarkdown>{article.content}</ReactMarkdown>
    </article>
  );
}