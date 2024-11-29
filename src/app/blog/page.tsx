import { Suspense } from "react";
import { ArticleList } from "../../components/ArticleList";
import { TagFilter } from "../../components/TagFilter";
import { BlogHeader } from "../../components/BlogHeader";
import { ArticleListSkeleton } from "@/components/ArticleListSkeleton";

export default function BlogPage({
  searchParams,
}: {
  searchParams: { tag?: string };
}) {
  return (
    <div className="min-h-screen bg-background">
      <BlogHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <h1 className="text-4xl font-bold">Blog Articles</h1>
          <TagFilter selectedTag={searchParams.tag} />
          <Suspense fallback={<ArticleListSkeleton />}>
            <ArticleList selectedTag={searchParams.tag} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}