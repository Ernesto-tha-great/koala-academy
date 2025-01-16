"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../../../convex/_generated/api";
import { GuideCard } from "@/components/guides/guide-card";
import { guideCategories } from "@/lib/guide";
import { cn } from "@/lib/utils";

export default function GuidesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const articles = useQuery(api.articles.list, { status: "published" });
  
  const guides = articles?.filter(article => article.category === "guide");
  const filteredGuides = guides?.filter(guide => {
    if (!selectedCategory) return true;
    return guide.tags?.some(tag => 
      tag.toLowerCase().replace(/\s+/g, '-') === selectedCategory.toLowerCase()
    );
  });

  return (
    <div className="min-h-screen bg-white bg-dot-pattern">
      <div className="relative overflow-hidden bg-gradient-to-b from-emerald-200 via-emerald-100 to-white pb-16 sm:pb-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.05]" />
        <div className="container max-w-7xl mx-auto px-4">
          <div className="relative pt-16 sm:pt-32 pb-12 sm:pb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <h1 className="text-4xl sm:text-6xl font-bold mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-emerald-900">
                Developer Guides
              </h1>
              <p className="text-lg sm:text-xl text-emerald-700">
                Comprehensive guides and tutorials for building, deploying, and scaling on Morph L2
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 -mt-12 sm:-mt-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg shadow-emerald-100/50 p-6 sm:p-12 mb-8 sm:mb-16 border border-emerald-50"
        >
          <div className="flex flex-nowrap overflow-x-auto gap-3 sm:flex-wrap sm:gap-4 pb-2 sm:pb-0">
            {guideCategories.map((category) => (
              <motion.button
                key={category.slug}
                onClick={() => setSelectedCategory(
                  selectedCategory === category.slug ? null : category.slug
                )}
                onHoverStart={() => setHoveredCategory(category.slug)}
                onHoverEnd={() => setHoveredCategory(null)}
                className={cn(
                  "group relative overflow-hidden rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-left transition-all duration-300",
                  "hover:shadow-lg flex items-center gap-2 sm:gap-3 flex-shrink-0",
                  selectedCategory === category.slug
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-200/50"
                    : "bg-gradient-to-r from-gray-50 to-white hover:from-emerald-50/50 hover:to-white text-emerald-900"
                )}
              >
                <category.icon className={cn(
                  "h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-300",
                  selectedCategory === category.slug
                    ? "text-white"
                    : "text-emerald-500 group-hover:text-emerald-600"
                )} />
                <span className={cn(
                  "font-medium transition-colors duration-300 whitespace-nowrap",
                  selectedCategory === category.slug
                    ? "text-white"
                    : "text-emerald-900"
                )}>
                  {category.name}
                </span>
                <AnimatePresence>
                  {hoveredCategory === category.slug && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="absolute inset-0 bg-emerald-100/10"
                    />
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Guides Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pb-12 sm:pb-20"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredGuides?.map((guide, index) => (
              <motion.div
                key={guide._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex justify-center"
              >
                <div className="w-full sm:w-[400px]">
                  <GuideCard guide={guide} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}