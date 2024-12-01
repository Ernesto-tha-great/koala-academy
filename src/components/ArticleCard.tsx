import Link from "next/link";
import { Doc } from "../../convex/_generated/dataModel";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface ArticleCardProps {
  article: Doc<"articles">;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link 
      href={`/blog/${article.slug}`}
      className="group flex items-start gap-8 p-6 shadow-lime-200 shadow hover:bg-green-50/50 transition-all rounded-lg border-l-2 border-transparent hover:border-green-500"
    >
      {/* Content Section */}
      <div className="flex-1 space-y-3">
        {/* Tags & Meta Info */}
        <div className="flex items-center gap-2 text-sm text-emerald-700">
          {article.type === "external" && (
            <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full font-medium">
              External
            </span>
          )}
          {article.type === "video" && (
            <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full font-medium">
              Video
            </span>
          )}
          <span className="text-emerald-600">{formatDate(article.publishedAt!)}</span>
          <span className="text-emerald-300">•</span>
          <span className="text-emerald-600">{article.readingTime} min read</span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-800 group-hover:text-emerald-700 font-manrope transition-colors">
          {article.title}
        </h2>

        {/* Tags */}
        <div className="flex gap-2">
          {article.tags.map((tag) => (
            <span 
              key={tag}
              className="px-2 py-1 bg-green-100/50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-100"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Read More Link */}
        <div className="pt-2">
          <span className="inline-flex items-center gap-2 text-sm text-emerald-600 font-medium group-hover:text-emerald-700 group-hover:gap-3 transition-all">
            Read more
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>

      {/* Image Section */}
      {article.headerImage && (
        <div className="relative w-64 h-48 rounded-lg overflow-hidden flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent z-10" />
          <Image 
            src={article.headerImage} 
            alt={article.title} 
            fill 
            className="object-cover rounded-lg transform group-hover:scale-105 transition-transform duration-300" 
          />
        </div>
      )}
    </Link>
  );
}