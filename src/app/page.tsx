"use client";

import BlogHeader from "@/components/BlogHeader";
import { ArticleList } from "@/components/ArticleList";
import { TagFilter } from "@/components/TagFilter";
import ArticleOfTheWeek from "@/components/ArticleOfTheWeek";
import { motion } from "framer-motion";
import { Suspense } from "react";

export default function Home() { 
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="relative min-h-screen bg-white">
        <div className="absolute inset-0 bg-dot-pattern opacity-[0.05]" />
        
        <main className="relative w-full">
          <BlogHeader />
          
          {/* Featured Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            <section className="py-24">
              <Suspense fallback={<div>Loading article of the week...</div>}>
                <ArticleOfTheWeek />
              </Suspense>
            </section>

            {/* Latest Articles Section */}
            <section className="py-24">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="flex items-center justify-between mb-12"
              >
                <h2 className="text-4xl font-bold text-emerald-900 font-manrope">
                  Latest Articles
                </h2>
                <div className="flex items-center gap-4">
                  <Suspense fallback={<div>Loading filters...</div>}>
                    <TagFilter />
                  </Suspense>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Suspense fallback={<div>Loading articles...</div>}>
                  <ArticleList />
                </Suspense>
              </motion.div>
            </section>
          </motion.div>
        </main>
      </div>
    </Suspense>
  );
}