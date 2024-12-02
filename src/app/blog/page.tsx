"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
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
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  const learningPaths = [
    {
      title: "Getting Started with Morph",
      description: "Learn the fundamentals of building on Morph L2",
      icon: "🚀",
      path: "/blog/getting-started",
      level: "beginner"
    },
    {
      title: "Smart Contract Development",
      description: "Deep dive into writing efficient smart contracts on Morph",
      icon: "📝",
      path: "/blog/smart-contracts",
      level: "intermediate"
    },
    {
      title: "Advanced Protocols",
      description: "Build complex DeFi protocols and advanced applications",
      icon: "⚡",
      path: "/blog/advanced-protocols",
      level: "advanced"
    },
    {
      title: "Integration Guides",
      description: "Connect your dApp with Morph's infrastructure",
      icon: "🔗",
      path: "/blog/integration",
      level: "intermediate"
    }
  ];

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

          {/* Learning Paths */}
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            {learningPaths.map((path) => (
              <Link key={path.title} href={path.path}>
                <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="text-2xl mb-2">{path.icon}</div>
                    <CardTitle>{path.title}</CardTitle>
                    <CardDescription>{path.description}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="ghost" className="ml-auto">
                      Explore <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Articles Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Latest Articles</h2>
            <Tabs
              defaultValue="all"
              value={selectedLevel}
              onValueChange={setSelectedLevel}
              className="w-auto"
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="beginner">Beginner</TabsTrigger>
                <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {articles?.map((article) => (
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