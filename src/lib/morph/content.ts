/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
    Network, 
    Layers, 
    Shield, 
    Cpu, 
    Blocks,
    Code2,
    Zap,
    Scale
  } from "lucide-react";
  
  export type MorphSection = {
    title: string;
    description: string;
    icon: any;
    slug: string;
    topics: Array<{
      title: string;
      slug: string;
      description: string;
    }>;
  };
  
  export const morphSections: MorphSection[] = [
    {
      title: "Architecture",
      description: "Deep dive into Morph's L2 architecture and technical design",
      icon: Layers,
      slug: "architecture",
      topics: [
        {
          title: "Overview",
          slug: "overview",
          description: "High-level overview of Morph's architecture"
        },
        {
          title: "Network Components",
          slug: "components",
          description: "Core components of the Morph network"
        },
        {
          title: "Consensus Mechanism",
          slug: "consensus",
          description: "Understanding Morph's consensus model"
        }
      ]
    },
    {
      title: "Rollup Design",
      description: "Technical details of Morph's optimistic rollup implementation",
      icon: Scale,
      slug: "rollup",
      topics: [
        {
          title: "State Management",
          slug: "state",
          description: "How Morph manages and transitions state"
        },
        {
          title: "Batch Processing",
          slug: "batch-processing",
          description: "Transaction batching and processing"
        },
        {
          title: "Data Availability",
          slug: "data-availability",
          description: "Data availability solutions"
        }
      ]
    },
    {
      title: "Security",
      description: "Understanding Morph's security features and validations",
      icon: Shield,
      slug: "security",
      topics: [
        {
          title: "Security Model",
          slug: "model",
          description: "Overview of security architecture"
        },
        {
          title: "Fraud Proofs",
          slug: "fraud-proofs",
          description: "How fraud proofs work"
        },
        {
          title: "Bridge Security",
          slug: "bridge",
          description: "Security measures for asset bridging"
        }
      ]
    },
    {
      title: "Performance",
      description: "Performance characteristics and optimizations",
      icon: Zap,
      slug: "performance",
      topics: [
        {
          title: "Throughput",
          slug: "throughput",
          description: "Transaction throughput and scalability"
        },
        {
          title: "Latency",
          slug: "latency",
          description: "Understanding transaction finality"
        },
        {
          title: "Optimizations",
          slug: "optimizations",
          description: "Technical optimizations in Morph"
        }
      ]
    }
  ];
  
  export function getMorphSection(slug: string) {
    return morphSections.find(section => section.slug === slug);
  }
  
  export function getMorphTopic(sectionSlug: string, topicSlug: string) {
    const section = getMorphSection(sectionSlug);
    return section?.topics.find(topic => topic.slug === topicSlug);
  }