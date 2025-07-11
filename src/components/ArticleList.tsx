/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";

interface ArticleListProps {
  selectedTag?: string;
  showCategoryFilter?: boolean;
  category?: "article" | "guide" | "morph";
}

export function ArticleList({ selectedTag }: ArticleListProps) {
  const [displayLimit, setDisplayLimit] = useState(6);
  const batchSize = 24;

  const articles = useQuery(api.articles.listForHomepage, {
    limit: Math.max(displayLimit + 6, batchSize),
  });

  console.log("articles", articles);

  const filteredArticles = useMemo(() => {
    if (!articles) return [];
    return articles
      .filter(
        (article) =>
          article.category !== "guide" && article.category !== "morph"
      )
      .slice(0, displayLimit)
      .map((article) => ({
        ...article,
        displayImage:
          article.headerImage ||
          article.firstContentImage ||
          "/default-header.jpg",
      }));
  }, [articles, displayLimit]);

  if (!articles) {
    return (
      <div className="grid gap-8">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-48 bg-emerald-50 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  const hasMore = articles && articles.length > displayLimit;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:gap-8">
        {filteredArticles.map((article, index) => {
          const encodedSlug = encodeURIComponent(article.slug)
            .toLowerCase()
            .replace(/%20/g, "-")
            .replace(/[&]/g, "and")
            .replace(/[^a-z0-9-]/g, "");

          return (
            <motion.div
              key={article._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/blog/${encodedSlug}`}>
                <div className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 p-4 sm:p-6">
                    <div className="relative w-full sm:w-48 h-48 sm:h-32 rounded-xl overflow-hidden">
                      <Image
                        src={article.displayImage}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent" />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-full">
                            {article.level}
                          </span>
                          <span className="flex items-center text-sm text-emerald-600">
                            <Clock className="w-4 h-4 mr-1" />
                            {article.readingTime} min read
                          </span>
                        </div>

                        <h3 className="text-xl font-semibold text-emerald-900 mb-2 group-hover:text-emerald-600 transition-colors">
                          {article.title}
                        </h3>

                        <p className="text-emerald-600/80 line-clamp-2">
                          {article.excerpt}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-emerald-600 flex items-center gap-2 group-hover:text-emerald-500 transition-colors">
                          Read article
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setDisplayLimit((prev) => prev + 6)}
            className="bg-white"
          >
            Load More Articles
          </Button>
        </div>
      )}
    </div>
  );
}
