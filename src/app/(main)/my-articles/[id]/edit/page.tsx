"use client";

import { useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { EditArticleForm } from "@/components/EditArticleForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const articleId = params.id as Id<"articles">;

  const article = useQuery(
    api.articles.getById,
    articleId ? { id: articleId } : "skip"
  );

  if (!isLoaded) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Authentication Required
          </h2>
          <p className="text-gray-600">
            You need to be signed in to edit articles.
          </p>
          <Button onClick={() => router.push("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  if (article === null) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Article Not Found
          </h2>
          <p className="text-gray-600">
            The article you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Button asChild>
            <Link href="/my-articles">Back to My Articles</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-gray-600">Loading article...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/my-articles">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Articles
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Article</h1>
            <p className="text-gray-600">Make changes to your article</p>
          </div>
        </div>
      </div>

      <EditArticleForm article={article} />
    </div>
  );
}
