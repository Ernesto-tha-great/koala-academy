"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, TrendingUp, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function BlogPage() {
  const articles = useQuery(api.articles.list, {
    limit: 10,
  });
  
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  // Get available levels from articles
  const availableLevels = useMemo(() => {
    if (!articles) return new Set<string>();
    const levels = new Set<string>();
    articles.forEach(article => {
      if (article.level) levels.add(article.level);
    });
    return levels;
  }, [articles]);

  // Filter articles based on level
  const filteredArticles = useMemo(() => {
    if (!articles) return [];
    return articles.filter(article => 
      selectedLevel === "all" || article.level === selectedLevel
    );
  }, [articles, selectedLevel]);

  // Separate featured and regular articles
  const featuredArticle = filteredArticles[0];
  const trendingArticles = filteredArticles.slice(1, 4);
  const regularArticles = filteredArticles.slice(4);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="mb-16">
        <h1 className="text-4xl font-bold mb-4">
          Technical Articles
        </h1>
        <p className="text-xl text-muted-foreground">
          Deep dives into blockchain development, L2 scaling, and web3 architecture
        </p>
      </div>

      {/* Level Filter */}
      {availableLevels.size > 0 && (
        <Tabs
          defaultValue="all"
          value={selectedLevel}
          onValueChange={setSelectedLevel}
          className="mb-12"
        >
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all">All Levels</TabsTrigger>
            {Array.from(availableLevels).map(level => (
              <TabsTrigger key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Featured Article */}
      {featuredArticle && (
        <Link href={`/blog/${featuredArticle.slug}`}>
          <div className="group relative rounded-2xl overflow-hidden mb-16 aspect-[2/1]">
            <Image
              src={featuredArticle.headerImage || '/default-header.jpg'}
              alt={featuredArticle.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 p-8 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-4 h-4" />
                <span className="text-sm">Featured Article</span>
              </div>
              <h2 className="text-3xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">
                {featuredArticle.title}
              </h2>
              <p className="text-gray-300 line-clamp-2 mb-4">
                {featuredArticle.excerpt}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {featuredArticle.readingTime} min read
                </span>
                <span className="px-2 py-1 bg-white/10 rounded-full">
                  {featuredArticle.level}
                </span>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Trending Articles */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Trending Articles
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {trendingArticles.map(article => (
            <Link 
              key={article._id} 
              href={`/blog/${article.slug}`}
              className="group"
            >
              <div className="rounded-xl overflow-hidden bg-muted/50 h-full">
                <div className="relative aspect-[16/9]">
                  <Image
                    src={article.headerImage || '/default-header.jpg'}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs">
                      {article.level}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-emerald-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-1" />
                    {article.readingTime} min read
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Regular Articles */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
        <div className="grid gap-6">
          {regularArticles.map(article => (
            <Link 
              key={article._id} 
              href={`/blog/${article.slug}`}
              className="group"
            >
              <div className="flex gap-6 p-6 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <div className="relative w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={article.headerImage || '/default-header.jpg'}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs">
                      {article.level}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-emerald-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {article.readingTime} min read
                    </span>
                    <span className="flex items-center gap-1 group-hover:text-emerald-600 transition-colors">
                      Read more <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}