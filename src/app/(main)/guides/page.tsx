// app/(main)/guides/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { GuideCard } from "@/components/guides/guide-card";
import { GuideCategories } from "@/components/guides/guide-categories";
import { GuideSearch } from "@/components/guides/guides-search";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GuidesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const articles = useQuery(api.articles.list, { status: "published" });

  const guides = articles?.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container max-w-7xl mx-auto py-12 px-4">
      {/* Hero Section */}
      <div className="relative mb-16 py-12 bg-gradient-to-br from-emerald-200 to-muted/50 rounded-3xl">
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Build on Morph
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Comprehensive guides and tutorials for building, deploying, and scaling on Morph L2
          </p>
          <GuideSearch value={searchQuery} onChange={setSearchQuery} />
        </div>
      </div>

      {/* Categories */}
      {!searchQuery && <GuideCategories className="mb-16" />}

      {/* Guides Section */}
      <div>
        <Tabs defaultValue="latest" className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold">Developer Guides</h2>
            <TabsList className="bg-muted/50">
              <TabsTrigger value="latest">Latest</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="beginner">Beginner</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="latest" className="min-h-[200px]">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guides?.sort((a, b) => b.publishedAt! - a.publishedAt!)
                .map((guide) => (
                  <GuideCard 
                    key={guide._id} 
                    guide={{
                      _id: guide._id,
                      slug: guide.slug,
                      title: guide.title,
                      excerpt: guide.excerpt,
                      type: guide.type,
                      views: guide.views,
                      readingTime: guide.readingTime,
                      tags: guide.tags,
                      level: guide.type // Using type as level since it's required
                    }} 
                  />
                ))
              }
            </div>
          </TabsContent>

          <TabsContent value="popular" className="min-h-[200px]">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guides?.sort((a, b) => b.views - a.views)
                .map((guide) => (
                  <GuideCard 
                    key={guide._id} 
                    guide={{
                      _id: guide._id,
                      slug: guide.slug,
                      title: guide.title,
                      excerpt: guide.excerpt,
                      type: guide.type,
                      views: guide.views,
                      readingTime: guide.readingTime,
                      tags: guide.tags,
                      level: guide.type // Using type as level since it's required
                    }}
                  />
                ))
              }
            </div>
          </TabsContent>

          {/* Similar structure for other tabs */}
        </Tabs>
      </div>
    </div>
  );
}