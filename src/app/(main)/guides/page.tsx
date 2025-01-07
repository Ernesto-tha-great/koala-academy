"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { GuideCard } from "@/components/guides/guide-card";
import { guideCategories } from "@/lib/guide";
import { cn } from "@/lib/utils";

export default function GuidesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const articles = useQuery(api.articles.list, { status: "published" });

  // Debug logs for initial data
  console.log("All articles:", articles);
  
  // First filter for guides only
  const guides = articles?.filter(article => {
    console.log("Checking article category:",  article.category);
    return article.category === "guide";
  });
  
  console.log("Filtered guides:", guides);

  // Then filter by selected guide category tag
  const filteredGuides = guides?.filter(guide => {
    if (!selectedCategory) return true;
    return guide.tags?.some(tag => 
      tag.toLowerCase().replace(/\s+/g, '-') === selectedCategory.toLowerCase()
    );
  });

  const handleCategoryClick = (slug: string) => {
    console.log("Category clicked:", slug); // Debug log
    setSelectedCategory(selectedCategory === slug ? null : slug);
  };

  return (
    <div className="container max-w-7xl mx-auto py-12 px-4">
      {/* Hero Section */}
      <div className="relative mb-16 py-12 bg-gradient-to-br from-emerald-300 to-muted/50 rounded-3xl">
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Build on Morph
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Comprehensive guides and tutorials for building, deploying, and scaling on Morph L2
          </p>
          {/* <GuideSearch value={searchQuery} onChange={setSearchQuery} /> */}
        </div>
      </div>

      {/* Guide Categories as Filters */}
      <div className="space-y-6 mb-16">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Quick Start Guides</h2>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Clear filter
            </button>
          )}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guideCategories.map((category) => (
            <button
              key={category.slug}
              onClick={() => handleCategoryClick(category.slug)}
              className={cn(
                "group relative overflow-hidden rounded-lg p-6 text-left transition-all",
                "hover:shadow-md",
                selectedCategory === category.slug
                  ? "bg-emerald-50 shadow-sm ring-2 ring-emerald-500/20"
                  : "bg-gradient-to-br from-background to-muted hover:from-muted/50 hover:to-background"
              )}
            >
              <div className="relative z-10">
                <category.icon className={cn(
                  "h-8 w-8 mb-4",
                  selectedCategory === category.slug
                    ? "text-emerald-600"
                    : "text-primary"
                )} />
                <h3 className="font-semibold text-lg mb-2">
                  {category.name}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {category.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Guides Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-8">
          {selectedCategory 
            ? `${guideCategories.find(c => c.slug === selectedCategory)?.name}`
            : 'Developer Guides'
          }
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides?.map((guide) => (
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
                level: guide.level
              }} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}