import { ArrowUpRight, Clock, Eye } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GuideCardProps {
  guide: {
    _id: string;
    slug: string;
    title: string;
    excerpt: string;
    type: string;
    views: number;
    readingTime: number;
    tags: string[];
    level: string;
  };
}

export function GuideCard({ guide }: GuideCardProps) {
  const levelColors = {
    beginner: {
      background: "bg-gradient-to-r from-emerald-50 to-emerald-100/50",
      text: "text-emerald-700",
      border: "border-emerald-200/50"
    },
    intermediate: {
      background: "bg-gradient-to-r from-blue-50 to-blue-100/50",
      text: "text-blue-700",
      border: "border-blue-200/50"
    },
    advanced: {
      background: "bg-gradient-to-r from-purple-50 to-purple-100/50",
      text: "text-purple-700",
      border: "border-purple-200/50"
    }
  };

  const levelStyle = levelColors[guide.level as keyof typeof levelColors];

  return (
    <Link href={`/guides/${guide.slug}`}>
      <motion.div 
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "group relative overflow-hidden rounded-2xl bg-white p-6",
          "border border-slate-200/50",
          "transition-all duration-300",
          "hover:shadow-lg hover:shadow-emerald-100/50",
          "hover:border-emerald-200/50"
        )}
      >
        {/* Level Badge */}
        <div className="flex justify-between items-start mb-6">
          <div className={cn(
            "px-3 py-1 rounded-full text-sm font-medium",
            levelStyle.background,
            levelStyle.text,
            "border",
            levelStyle.border
          )}>
            {guide.level.charAt(0).toUpperCase() + guide.level.slice(1)}
          </div>
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            whileHover={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowUpRight className="h-5 w-5 text-emerald-500" />
          </motion.div>
        </div>

        {/* Title & Excerpt */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-slate-900 group-hover:text-emerald-700 transition-colors duration-300 line-clamp-2">
            {guide.title}
          </h3>
          <p className="text-slate-600 line-clamp-2 text-sm leading-relaxed">
            {guide.excerpt}
          </p>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{guide.readingTime} min read</span>
          </div>
          <div className="h-1 w-1 rounded-full bg-slate-300" />
          <div className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" />
            <span>{new Intl.NumberFormat().format(guide.views)} views</span>
          </div>
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/0 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </motion.div>
    </Link>
  );
}