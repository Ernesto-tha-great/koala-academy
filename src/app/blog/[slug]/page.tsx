import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getBySlug } from "@/lib/articles";
import { Article } from "@/components/Article";
import { CommentSection } from "@/components/CommentSection";
import { RelatedArticles } from "@/components/RelatedArticles";

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const article = await getBySlug(params.slug);
  if (!article) return {};

  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt,
    openGraph: {
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.excerpt,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getBySlug(params.slug);
  if (!article) notFound();

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Article article={{
          ...article,
          author: article.author ? { name: article.author.name } : { name: '' }
        }} />
        
        <Suspense fallback={<div>Loading comments...</div>}>
          <CommentSection articleId={article._id} />
        </Suspense>
        
        <Suspense fallback={<div>Loading related articles...</div>}>
          <RelatedArticles 
            currentArticleId={article._id}
            tags={article.tags}
          />
        </Suspense>
      </main>
    </div>
  );
}
