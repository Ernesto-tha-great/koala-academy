"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Eye, ChevronRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function BlogPage() {
  const articles = useQuery(api.articles.list, {
    limit: 100,
  });
  
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  // Define content categories
  const contentCategories = [
    {
      title: "Technical Articles",
      description: "Deep technical content about Morph's infrastructure",
      icon: "📚",
      filter: "technical",
    },
    {
      title: "Tutorials",
      description: "Step-by-step guides for building on Morph",
      icon: "💡",
      filter: "tutorial",
    },
    {
      title: "Developer Updates",
      description: "Latest updates and changes to Morph's developer tools",
      icon: "🔄",
      filter: "updates",
    },
    {
      title: "Case Studies",
      description: "Real-world examples and implementations",
      icon: "📊",
      filter: "case-study",
    },
  ];

  // Get available levels from articles
  const availableLevels = useMemo(() => {
    if (!articles) return new Set<string>();
    
    const levels = new Set<string>();
    articles.forEach(article => {
      if (article.level) levels.add(article.level);
    });
    return levels;
  }, [articles]);

  // Filter articles based on selected category and level
  const filteredArticles = useMemo(() => {
    if (!articles) return [];
    
    return articles.filter(article => {
      const categoryMatch = selectedCategory === "all" || article.category === selectedCategory;
      const levelMatch = selectedLevel === "all" || article.level === selectedLevel;
      return categoryMatch && levelMatch;
    });
  }, [articles, selectedCategory, selectedLevel]);

  return (
    <div className="container mx-auto flex">
      <main className="flex-1 px-8 py-6">
        {/* Hero Section */}
        <section className="mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Build on Morph
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Technical guides, tutorials, and resources for building the future of Layer 2
          </p>

          {/* Content Categories */}
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            {contentCategories.map((category) => (
              <Card 
                key={category.filter}
                className={cn(
                  "h-full transition-colors cursor-pointer",
                  selectedCategory === category.filter 
                    ? "bg-accent" 
                    : "hover:bg-accent/50"
                )}
                onClick={() => setSelectedCategory(
                  selectedCategory === category.filter ? "all" : category.filter
                )}
              >
                <CardHeader>
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <CardTitle>{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Articles Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              {selectedCategory === "all" 
                ? "All Articles" 
                : `${contentCategories.find(c => c.filter === selectedCategory)?.title}`}
            </h2>
            
            {/* Only show tabs if there are levels available */}
            {availableLevels.size > 0 && (
              <Tabs
                defaultValue="all"
                value={selectedLevel}
                onValueChange={setSelectedLevel}
                className="w-auto"
              >
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  {Array.from(availableLevels).map(level => (
                    <TabsTrigger key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {filteredArticles.map((article) => (
              <Link key={article._id} href={`/blog/${article.slug}`}>
                <Card className="h-full hover:bg-accent/50 transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      {/* <Badge
                        variant="secondary"
                        className={cn(
                          "text-sm",
                          article.level === "beginner" && "bg-green-100 text-green-800",
                          article.level === "intermediate" && "bg-blue-100 text-blue-800",
                          article.level === "advanced" && "bg-purple-100 text-purple-800"
                        )}
                      >
                        {article.level}
                      </Badge> */}
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Eye className="h-4 w-4 mr-1" />
                        {article.views}
                      </div>
                    </div>
                    <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {article.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {article.readingTime} min read
                    </div>
                    <Button variant="ghost" className="ml-auto">
                      Read more <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}