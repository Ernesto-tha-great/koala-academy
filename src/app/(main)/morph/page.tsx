"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowUpRight,
  Sparkles,
  Zap,
  Scale,
  ArrowDown,
  Layers,
  Blocks,
  Network,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function MorphPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const articles = useQuery(api.articles.list, {
    limit: 10,
  });

  const morphArticles = useMemo(() => {
    if (!articles) return [];
    return articles.filter(
      (article) =>
        article.category === "morph" && article.status === "published"
    );
  }, [articles]);

  const featuredArticle = useMemo(() => {
    if (morphArticles.length === 0) return null;
    return [...morphArticles].sort(
      (a, b) => (b.views || 0) - (a.views || 0)
    )[0];
  }, [morphArticles]);

  const remainingArticles = useMemo(() => {
    if (!featuredArticle) return morphArticles;
    return morphArticles.filter(
      (article) => article._id !== featuredArticle._id
    );
  }, [morphArticles, featuredArticle]);

  const fundamentalConcepts = [
    {
      id: "modular",
      title: remainingArticles[0]?.title || "Modular Design",
      description:
        remainingArticles[0]?.excerpt?.split(".")[0] ||
        "Flexible architecture enabling seamless upgrades",
      icon: Scale,
      link: `/blog/${remainingArticles[0]?.slug || "modular-design"}`,
      color: "from-emerald-50",
    },
    {
      id: "zkevm",
      title: remainingArticles[1]?.title || "Optimistic zkEVM",
      description:
        remainingArticles[1]?.excerpt || "High-performance execution",
      icon: Zap,
      link: `/blog/${remainingArticles[1]?.slug || "zkevm"}`,
      color: "from-blue-50",
    },
    {
      id: "sequencer",
      title: remainingArticles[2]?.title || "Decentralized Sequencers",
      description:
        remainingArticles[2]?.excerpt || "Decentralized transaction ordering",
      icon: Sparkles,
      link: `/blog/${remainingArticles[2]?.slug || "sequencer"}`,
      color: "from-purple-50",
    },
  ];

  const protocolDesign = [
    {
      id: "rollups",
      title: remainingArticles[3]?.title || "Rollups Deep Dive",
      description:
        remainingArticles[3]?.excerpt || "Understanding rollup technology",
      icon: Layers,
      link: `/blog/${remainingArticles[3]?.slug || "rollups"}`,
      color: "from-orange-50",
    },
    {
      id: "ethereum",
      title: remainingArticles[4]?.title || "Morph & Ethereum",
      description: remainingArticles[4]?.excerpt || "Ethereum L1 interaction",
      icon: Network,
      link: `/blog/${remainingArticles[4]?.slug || "ethereum"}`,
      color: "from-pink-50",
    },
    {
      id: "lifecycle",
      title: remainingArticles[5]?.title || "Transaction Lifecycle",
      description:
        remainingArticles[5]?.excerpt || "Transaction flow through network",
      icon: Blocks,
      link: `/blog/${remainingArticles[5]?.slug || "transaction-lifecycle"}`,
      color: "from-violet-50",
    },
  ];

  if (!articles) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50/20 flex items-center justify-center">
        <div className="text-center space-y-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto"
          >
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full"></div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <h2 className="text-xl font-semibold text-emerald-900">
              Loading Protocol Design
            </h2>
            <p className="text-emerald-600">
              Fetching the latest Morph articles...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-white to-emerald-50/20"
      ref={containerRef}
    >
      {/* Hero Section */}
      <div className="relative h-[90vh] sm:h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          style={{ y, opacity }}
          className="absolute inset-0 bg-dot-pattern opacity-10"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-6xl md:text-8xl font-bold text-center mb-4 sm:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-emerald-900"
          >
            Protocol Design
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl text-center text-emerald-700 max-w-3xl mx-auto mb-12 sm:mb-20"
          >
            Explore the fundamental concepts powering Morph&apos;s
            next-generation Layer 2
          </motion.p>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2">
            <motion.div
              animate={{
                y: [0, 10, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative"
            >
              <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl animate-pulse" />
              <ArrowDown className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600 relative z-10" />
            </motion.div>
          </div>
        </div>
      </div>

      {featuredArticle && (
        <div className="py-12 sm:py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100"
            >
              <Link href={`/blog/${featuredArticle.slug}`} className="block">
                <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 p-6 sm:p-8">
                  <div className="lg:w-1/2 space-y-4 sm:space-y-6">
                    <div className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
                      Featured Article
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-900 group-hover:text-emerald-700 transition-colors">
                      {featuredArticle.title}
                    </h2>
                    <p className="text-base sm:text-lg text-emerald-700/80">
                      {featuredArticle.excerpt}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-emerald-600">
                        {featuredArticle.readingTime} min read
                      </div>
                    </div>
                  </div>
                  <div className="lg:w-1/2 relative aspect-[16/9] rounded-2xl overflow-hidden bg-emerald-50">
                    <Image
                      src={
                        featuredArticle.headerImage ||
                        "https://docs.morphl2.io/assets/images/dseq1-afce583c551d8ca96f458ddb7ed2eac3.jpg"
                      }
                      alt={featuredArticle.title}
                      fill
                      className="object-contain transition-transform group-hover:scale-105 rounded-lg"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      )}

      <section className="py-12 sm:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 text-emerald-900"
          >
            Fundamental Concepts
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {fundamentalConcepts.map((concept, index) => (
              <motion.div
                key={concept.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={concept.link}>
                  <div
                    className={cn(
                      "group relative h-[300px] p-6 rounded-2xl overflow-hidden",
                      "bg-gradient-to-br to-white border border-emerald-100",
                      "transition-all duration-500 hover:shadow-lg",
                      concept.color
                    )}
                  >
                    <div className="relative z-10 h-full flex flex-col">
                      <concept.icon className="h-8 w-8 text-emerald-600 mb-4" />
                      <h3 className="text-xl font-semibold text-emerald-900 mb-3 group-hover:text-emerald-700 line-clamp-2">
                        {concept.title}
                      </h3>
                      <p className="text-emerald-700/80 line-clamp-3">
                        {concept.description}
                      </p>
                      <motion.div
                        className="mt-auto self-end"
                        whileHover={{ x: 5, y: -5 }}
                      >
                        <ArrowUpRight className="h-6 w-6 text-emerald-500" />
                      </motion.div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Protocol Design Section */}
      <section className="py-12 sm:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 text-emerald-900"
          >
            Protocol Design
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {protocolDesign.map((design, index) => (
              <motion.div
                key={design.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={design.link} className="block">
                  <div
                    className={cn(
                      "group relative h-[300px] p-6 rounded-2xl overflow-hidden",
                      "bg-gradient-to-br to-white border border-emerald-100",
                      "transition-all duration-500 hover:shadow-lg",
                      design.color
                    )}
                  >
                    <div className="relative z-10 h-full flex flex-col">
                      <h3 className="text-xl font-semibold text-emerald-900 mb-3 group-hover:text-emerald-700">
                        {design.title}
                      </h3>
                      <p className="text-emerald-700/80">
                        {design.description}
                      </p>
                      <motion.div
                        className="mt-auto self-end"
                        whileHover={{ x: 5, y: -5 }}
                      >
                        <ArrowUpRight className="h-6 w-6 text-emerald-500" />
                      </motion.div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
