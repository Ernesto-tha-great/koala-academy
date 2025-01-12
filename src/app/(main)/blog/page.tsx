"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, TrendingUp, Star, ArrowRight, Search, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Command, CommandInput, CommandList, CommandGroup, CommandItem } from "@/components/ui/command";

// Add this Skeleton component
function Skeleton({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn(
        "rounded-md bg-gradient-to-r from-slate-200 to-slate-100",
        className
      )}
      animate={{
        opacity: [0.5, 1, 0.5],
        background: [
          "linear-gradient(to right, rgb(241 245 249), rgb(248 250 252))",
          "linear-gradient(to right, rgb(248 250 252), rgb(241 245 249))",
          "linear-gradient(to right, rgb(241 245 249), rgb(248 250 252))",
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

// Add these categories
const CATEGORIES = [
  { name: "Oracles", icon: "🔮" },
  { name: "Subgraphs", icon: "📊" },
  { name: "Account Abstraction", icon: "🔐" },
  { name: "Smart Contracts", icon: "📝" },
  { name: "ZK Proofs", icon: "🔒" },
  { name: "MEV", icon: "⚡" },
];

export default function BlogPage() {
  const articles = useQuery(api.articles.list, {
    limit: 10,
  });
  
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

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

  // Add this handler
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Modify the clear search handler
  const handleClearSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchQuery("");
    // Optionally, also clear selected categories
    setSelectedCategories([]);
  };

  if (!articles) {
    return (
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section Skeleton */}
        <div className="mb-16">
          <Skeleton className="h-12 w-2/3 mb-4" />
          <Skeleton className="h-8 w-1/2" />
        </div>

        {/* Featured Article Skeleton */}
        <div className="relative rounded-2xl overflow-hidden mb-16 aspect-[2/1] bg-slate-100">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-200 to-transparent animate-pulse" />
          <div className="absolute bottom-0 p-8 w-full">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-10 w-3/4 mb-2" />
            <Skeleton className="h-16 w-2/3 mb-4" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>

        {/* Trending Articles Skeleton */}
        <div className="mb-16">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl overflow-hidden bg-slate-50">
                <Skeleton className="aspect-[16/9]" />
                <div className="p-6">
                  <Skeleton className="h-6 w-20 mb-3" />
                  <Skeleton className="h-8 w-full mb-2" />
                  <Skeleton className="h-16 w-full mb-4" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regular Articles Skeleton */}
        <div>
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-6 p-6 rounded-xl bg-slate-50">
                <Skeleton className="w-48 h-32 rounded-lg flex-shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-20 mb-2" />
                  <Skeleton className="h-8 w-3/4 mb-2" />
                  <Skeleton className="h-16 w-full mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white  bg-dot-pattern">
      {/* Hero Section with Animation */}
      <div className="relative overflow-hidden bg-gradient-to-b from-emerald-200 via-emerald-100 to-white pb-32">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-grid-pattern" 
        />
        <div className="container max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative pt-32"
          >
            <div className="max-w-3xl">
              <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-emerald-900">
                Technical Articles
              </h1>
              <p className="text-xl text-emerald-700 mb-8">
                Deep dives into blockchain development, L2 scaling, and web3 architecture
              </p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
               <div 
  className={cn(
    "relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm w-full cursor-pointer",
    "border border-emerald-100/50 transition-all duration-500",
    isSearchOpen ? "ring-2 ring-emerald-500 ring-opacity-50" : ""
  )}
  onClick={() => setIsSearchOpen(true)}
>
  <Command className="rounded-lg border-0 bg-transparent w-full [&_[cmdk-input-wrapper]]:block">
    <div className="flex items-center px-4 w-full">
      <Search className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
      <CommandInput 
        placeholder="Search articles..."
        onFocus={() => setIsSearchOpen(true)}
        value={searchQuery}
        onValueChange={setSearchQuery}
        className="py-6 w-full border-0 outline-none focus:ring-0 bg-transparent [&_input]:border-0 [&_input]:bg-transparent [&_input]:outline-none [&_input]:focus:ring-0 [&_input]:w-full [&_input]:p-0"
      />
      {searchQuery && (
        <X 
          className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-emerald-500 transition-colors flex-shrink-0"
          onClick={handleClearSearch}
        />
      )}
    </div>
    {isSearchOpen && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <CommandList>
          <CommandGroup heading="Categories">
            <div className="p-4 flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <motion.button
                  key={category.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCategory(category.name);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2",
                    "transition-all duration-200",
                    selectedCategories.includes(category.name)
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-700 hover:bg-emerald-50"
                  )}
                >
                  <span>{category.icon}</span>
                  {category.name}
                </motion.button>
              ))}
            </div>
          </CommandGroup>
          {searchQuery && (
            <CommandGroup heading="Results">
              {/* Add your search results here */}
            </CommandGroup>
          )}
        </CommandList>
      </motion.div>
    )}
  </Command>
</div>
              </motion.div>

              {/* Level Filter */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 inline-flex bg-white/50 backdrop-blur-sm rounded-full p-1"
              >
                <Tabs
                  defaultValue="all"
                  value={selectedLevel}
                  onValueChange={setSelectedLevel}
                  className="w-full"
                >
                  <TabsList className="bg-transparent w-full flex justify-start gap-2">
                    <TabsTrigger 
                      value="all"
                      className="rounded-full px-4 py-2 text-sm transition-all duration-500 ease-in-out"
                    >
                      All Levels
                    </TabsTrigger>
                    {Array.from(availableLevels).map(level => (
                      <TabsTrigger 
                        key={level} 
                        value={level}
                        className="rounded-full px-4 py-2 text-sm transition-all duration-500 ease-in-out"
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 -mt-24 ">
        {/* Featured Article */}
        {featuredArticle && (
          <motion.div
          className=" "
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
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
          </motion.div>
        )}

        {/* Trending Articles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Trending Articles
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {trendingArticles.map((article, index) => (
              <motion.div
                key={article._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Link 
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
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Regular Articles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
          <div className="grid gap-6">
            {regularArticles.map((article, index) => (
              <motion.div
                key={article._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <Link 
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
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Click outside handler */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 z-0"
          onClick={() => setIsSearchOpen(false)}
        />
      )}
    </div>
  );
}