"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Sparkles, Zap, Shield, Scale, ArrowDown, Layers, Blocks, Network } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export default function MorphPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const fundamentalConcepts = [
    {
      id: "modular",
      title: "Modular Design",
      description: "Flexible architecture enabling seamless upgrades and optimizations",
      icon: Scale,
      link: "/morph/modular-design",
      color: "from-emerald-50"
    },
    {
      id: "zkevm",
      title: "Optimistic zkEVM",
      description: "High-performance execution with zero-knowledge proofs",
      icon: Zap,
      link: "/morph/zkevm",
      color: "from-blue-50"
    },
    {
      id: "sequencer",
      title: "Decentralized Sequencers",
      description: "Decentralized transaction ordering and execution",
      icon: Sparkles,
      link: "/morph/sequencer",
      color: "from-purple-50"
    }
  ];

  const protocolDesign = [
    {
      id: "rollups",
      title: "Rollups Deep Dive",
      description: "Understanding the core mechanics of rollup technology",
      icon: Layers,
      link: "/morph/rollups",
      color: "from-orange-50"
    },
    {
      id: "ethereum",
      title: "Morph & Ethereum",
      description: "How Morph interacts with Ethereum L1",
      icon: Network,
      link: "/morph/ethereum",
      color: "from-pink-50"
    },
    {
      id: "lifecycle",
      title: "Transaction Lifecycle",
      description: "Journey of a transaction through the Morph network",
      icon: Blocks,
      link: "/morph/transaction-lifecycle",
      color: "from-violet-50"
    }
  ];

  const spotlightArticle = {
    title: "Transaction Lifecycle on Morph",
    description: "A comprehensive guide to understanding how transactions flow through the Morph network, from submission to finality.",
    image: "/transaction-lifecycle.jpg",
    link: "/morph/transaction-lifecycle",
    readingTime: "15 min read",
    author: {
      name: "Alex Rivera",
      role: "Protocol Engineer"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50/20" ref={containerRef}>
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ y, opacity }}
          className="absolute inset-0 bg-dot-pattern opacity-10"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-8xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-emerald-900"
          >
            Protocol Design
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl text-center text-emerald-700 max-w-3xl mx-auto mb-16"
          >
            Explore the fundamental concepts powering Morph's next-generation Layer 2
          </motion.p>

          {/* Animated Scroll Indicator */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
            <motion.div
              animate={{ 
                y: [0, 10, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl animate-pulse" />
              <ArrowDown className="h-8 w-8 text-emerald-600 relative z-10" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Spotlight Article */}
      <div className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100"
          >
            <Link href={spotlightArticle.link} className="block">
              <div className="flex flex-col lg:flex-row gap-8 p-8">
                <div className="lg:w-1/2 space-y-6">
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
                    Featured Article
                  </div>
                  <h2 className="text-4xl font-bold text-emerald-900 group-hover:text-emerald-700 transition-colors">
                    {spotlightArticle.title}
                  </h2>
                  <p className="text-lg text-emerald-700/80">
                    {spotlightArticle.description}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="font-medium">{spotlightArticle.author.name}</span>
                      <span className="text-sm text-emerald-600">{spotlightArticle.author.role}</span>
                    </div>
                    <div className="text-sm text-emerald-600">
                      {spotlightArticle.readingTime}
                    </div>
                  </div>
                </div>
                <div className="lg:w-1/2 relative aspect-[16/9] rounded-2xl overflow-hidden">
                  <Image
                    src={spotlightArticle.image}
                    alt={spotlightArticle.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Fundamental Concepts */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold mb-12 text-emerald-900"
          >
            Fundamental Concepts
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {fundamentalConcepts.map((concept, index) => (
              <motion.div
                key={concept.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={concept.link}>
                  <div className={cn(
                    "group relative h-[300px] p-6 rounded-2xl overflow-hidden",
                    "bg-gradient-to-br to-white border border-emerald-100",
                    "transition-all duration-500 hover:shadow-lg",
                    concept.color
                  )}>
                    <div className="relative z-10 h-full flex flex-col">
                      <concept.icon className="h-8 w-8 text-emerald-600 mb-4" />
                      <h3 className="text-xl font-semibold text-emerald-900 mb-3 group-hover:text-emerald-700">
                        {concept.title}
                      </h3>
                      <p className="text-emerald-700/80">
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

      {/* Protocol Design */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold mb-12 text-emerald-900"
          >
            Protocol Design
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {protocolDesign.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={article.link}>
                  <div className={cn(
                    "group relative h-[300px] p-6 rounded-2xl overflow-hidden",
                    "bg-gradient-to-br to-white border border-emerald-100",
                    "transition-all duration-500 hover:shadow-lg",
                    article.color
                  )}>
                    <div className="relative z-10 h-full flex flex-col">
                      <article.icon className="h-8 w-8 text-emerald-600 mb-4" />
                      <h3 className="text-xl font-semibold text-emerald-900 mb-3 group-hover:text-emerald-700">
                        {article.title}
                      </h3>
                      <p className="text-emerald-700/80">
                        {article.description}
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