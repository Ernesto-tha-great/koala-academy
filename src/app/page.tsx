import { BlogHeader } from "@/components/BlogHeader";
import { ArticleList } from "@/components/ArticleList";
import { TagFilter } from "@/components/TagFilter";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="space-y-6">
          <h1 className="text-4xl font-bold">Technical Tutorials</h1>
          <TagFilter />
          <ArticleList />
        </section>
      </main>
    </div>
  );
}