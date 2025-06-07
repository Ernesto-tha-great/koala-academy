"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  FileText,
  Eye,
  Edit,
  Calendar,
  Clock,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { Doc } from "../../../../convex/_generated/dataModel";
import ContentPreview from "@/components/ContentPreview";

export default function MyArticlesPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewArticle, setPreviewArticle] = useState<Doc<"articles"> | null>(
    null
  );

  const userArticles = useQuery(
    api.articles.getUserArticles,
    isSignedIn ? {} : "skip"
  );

  const userDrafts = useQuery(
    api.articles.getUserDrafts,
    isSignedIn ? undefined : "skip"
  );

  if (!isLoaded) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">My Articles</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            View and manage your submitted articles and drafts.
          </p>
        </div>

        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please sign in to view your articles and drafts.
          </p>
          <SignInButton mode="modal">
            <Button size="lg">Sign In</Button>
          </SignInButton>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string, submissionStatus?: string) => {
    if (status === "published" && submissionStatus === "approved") {
      return (
        <Badge variant="default" className="bg-emerald-100 text-emerald-800">
          Published
        </Badge>
      );
    }
    if (submissionStatus === "pending") {
      return (
        <Badge variant="default" className="bg-yellow-100 text-yellow-800">
          Under Review
        </Badge>
      );
    }
    if (submissionStatus === "needs_revision") {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800">
          Needs Revision
        </Badge>
      );
    }
    if (status === "draft") {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
          Draft
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-gray-50 text-gray-600">
        {status}
      </Badge>
    );
  };

  const getStatusActions = (article: Doc<"articles">) => {
    const { status, submissionStatus } = article;

    if (status === "published" && submissionStatus === "approved") {
      return (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/blog/${article.slug}`}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/my-articles/${article._id}/edit`}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </Button>
        </div>
      );
    }

    if (status === "draft" && !submissionStatus) {
      return (
        <Button variant="default" size="sm" asChild>
          <Link href={`/my-articles/${article._id}/edit`}>
            <Edit className="h-4 w-4 mr-1" />
            Continue Writing
          </Link>
        </Button>
      );
    }

    if (submissionStatus === "pending") {
      return (
        <Button variant="outline" size="sm" asChild>
          <Link href={`/my-articles/${article._id}/edit`}>
            <Edit className="h-4 w-4 mr-1" />
            Edit While Reviewing
          </Link>
        </Button>
      );
    }

    if (submissionStatus === "needs_revision") {
      return (
        <Button variant="default" size="sm" asChild>
          <Link href={`/my-articles/${article._id}/edit`}>
            <Edit className="h-4 w-4 mr-1" />
            Revise & Resubmit
          </Link>
        </Button>
      );
    }

    if (submissionStatus === "rejected") {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setPreviewArticle(article);
            setPreviewOpen(true);
          }}
        >
          <Eye className="h-4 w-4 mr-1" />
          Preview
        </Button>
      );
    }

    return (
      <Button variant="outline" size="sm" asChild>
        <Link href={`/my-articles/${article._id}/edit`}>
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Link>
      </Button>
    );
  };

  const ArticleCard = ({ article }: { article: Doc<"articles"> }) => {
    const isRejected = article.submissionStatus === "rejected";

    return (
      <Card
        className={`transition-all duration-200 ${
          isRejected
            ? "opacity-60 hover:opacity-80 bg-gray-50"
            : "hover:shadow-md"
        }`}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <CardTitle
                className={`text-lg line-clamp-2 ${
                  isRejected ? "text-gray-600" : ""
                }`}
              >
                {article.title}
              </CardTitle>
              <p
                className={`text-sm line-clamp-2 ${
                  isRejected ? "text-gray-500" : "text-gray-600"
                }`}
              >
                {article.excerpt}
              </p>
            </div>
            {getStatusBadge(article.status, article.submissionStatus)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(article.lastModified)}</span>
              </div>
              {article.readingTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{article.readingTime} min read</span>
                </div>
              )}
              {article.views !== undefined && (
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{article.views} views</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {article.tags?.slice(0, 3).map((tag: string) => (
                <span
                  key={tag}
                  className={`px-2 py-1 text-xs rounded-full ${
                    isRejected
                      ? "bg-gray-200 text-gray-600"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {tag}
                </span>
              ))}
              {article.tags?.length > 3 && (
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    isRejected
                      ? "bg-gray-200 text-gray-600"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  +{article.tags.length - 3} more
                </span>
              )}
            </div>

            {/* Status-specific messages */}
            {article.submissionStatus === "needs_revision" && (
              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-red-800">Revision Required</p>
                  <p className="text-red-700">
                    This article needs changes before it can be published.
                  </p>
                </div>
              </div>
            )}

            {article.submissionStatus === "pending" && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <Clock className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Under Review</p>
                  <p className="text-yellow-700">
                    Your article is being reviewed by our team.
                  </p>
                </div>
              </div>
            )}

            {article.submissionStatus === "rejected" && (
              <div className="flex items-start gap-2 p-3 bg-gray-100 rounded-lg border border-gray-300">
                <AlertCircle className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-gray-800">Not Accepted</p>
                  <p className="text-gray-700">
                    This article was not accepted for publication.
                  </p>
                </div>
              </div>
            )}

            {article.type === "external" && article.externalUrl && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                <ExternalLink className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">External Article</span>
              </div>
            )}

            <div className="flex justify-end">
              {!isRejected ? (
                getStatusActions(article)
              ) : (
                <div className="text-xs text-gray-500 italic">
                  No actions available
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const submissions =
    userArticles?.filter((article) => article.submissionStatus) || [];
  const published =
    userArticles?.filter(
      (article) =>
        article.status === "published" &&
        article.submissionStatus === "approved"
    ) || [];
  const drafts = userDrafts || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Articles</h1>
          <p className="text-gray-600 mt-2">
            Manage your articles, drafts, and submissions
          </p>
        </div>
        <Button asChild>
          <Link href="/submit">
            <FileText className="h-4 w-4 mr-2" />
            New Article
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            All ({userArticles?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="published">
            Published ({published.length})
          </TabsTrigger>
          <TabsTrigger value="submissions">
            Submissions ({submissions.length})
          </TabsTrigger>
          <TabsTrigger value="drafts">Drafts ({drafts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {userArticles && userArticles.length > 0 ? (
            <div className="grid gap-4">
              {userArticles.map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No articles yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start writing your first article to share your knowledge with
                the community.
              </p>
              <Button asChild>
                <Link href="/submit">Write Your First Article</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="published" className="space-y-6">
          {published.length > 0 ? (
            <div className="grid gap-4">
              {published.map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No published articles yet
              </h3>
              <p className="text-gray-500 mb-6">
                Submit your articles for review to get them published.
              </p>
              <Button asChild>
                <Link href="/submit">Submit an Article</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6">
          {submissions.length > 0 ? (
            <div className="grid gap-4">
              {submissions.map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No submissions yet
              </h3>
              <p className="text-gray-500 mb-6">
                Submit your first article for review.
              </p>
              <Button asChild>
                <Link href="/submit">Submit an Article</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="drafts" className="space-y-6">
          {drafts.length > 0 ? (
            <div className="grid gap-4">
              {drafts.map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No drafts yet
              </h3>
              <p className="text-gray-500 mb-6">
                Save articles as drafts to work on them later.
              </p>
              <Button asChild>
                <Link href="/submit">Start Writing</Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Preview Dialog for rejected articles */}
      {previewArticle && (
        <ContentPreview
          article={{ ...previewArticle, author: null }}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      )}
    </div>
  );
}
