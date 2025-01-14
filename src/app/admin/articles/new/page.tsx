import { ArticleForm } from "@/components/admin/ArticleForm";

export default function NewArticlePage() {
  const defaultValues = {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    status: "draft",
    category: "article",
    headerImage: "",
    readingTime: "5",
    tags: [],
    type: "article"
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      <h1 className="text-2xl font-bold">Create New Article</h1>
      <ArticleForm defaultValues={defaultValues} />
    </div>
  );
}