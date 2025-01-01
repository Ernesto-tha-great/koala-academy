import BlogHeader from "@/components/BlogHeader";
import { ArticleList } from "@/components/ArticleList";
import { TagFilter } from "@/components/TagFilter";
import ArticleOfTheWeek from "@/components/ArticleOfTheWeek";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BlogHeader />
        <section>
        <div className="flex flex-col gap-6 my-8">
          <ArticleOfTheWeek />
        </div>
        </section>

        <section className="mt-16">
      
          <h1 className="text-2xl font-bold font-manrope my-6">Latest articles</h1>
          <TagFilter />
          <ArticleList />
        </section>
      </main>
    </div>
  );
}