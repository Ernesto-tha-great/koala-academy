import Link from "next/link";
import { Doc } from "../../convex/_generated/dataModel";
import { formatDate } from "@/lib/utils";

interface ArticleCardProps {
  article: Doc<"articles">;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link 
      href={`/blog/${article.slug}`}
      className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          {article.type === "external" && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
              External
    
    
            </span>
          )}
          {article.type === "video" && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
              Video
            </span>
          )}
          <span>
            {formatDate(article.publishedAt!)}
          </span>
        </div>
        
        <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600">
          {article.title}
        </h2>
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{article.readingTime} min read</span>
          <span>{article.likes} likes</span>
        </div>

        <div className="mt-4 flex gap-2">
          {article.tags.map((tag) => (
            <span 
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}