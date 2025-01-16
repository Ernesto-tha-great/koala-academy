/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

interface ArticleListProps {
  selectedTag?: string;
}

export function ArticleList({ selectedTag }: ArticleListProps) {
  const articles = useQuery(api.articles.list, { 
    limit: 20,
  });

  console.log("articles", articles);

  const filteredArticles = useMemo(() => {
    if (!articles) return [];
    return articles.filter(article => 
      article.category !== "guide" && 
      article.category !== "morph" && 
      article.status === "published"
    );
  }, [articles]);

  if (!articles) {
    return (
      <div className="grid gap-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-emerald-50 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      {filteredArticles.map((article, index) => {
        const encodedSlug = encodeURIComponent(article.slug)
          .toLowerCase()
          .replace(/%20/g, '-')
          .replace(/[&]/g, 'and')
          .replace(/[^a-z0-9-]/g, '');

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
                
                <div className="flex gap-8 p-6">
                  <div className="relative w-48 h-32 rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                      src={article.headerImage || '/default-header.jpg'}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent" />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
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
  );
}
