"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { FileText, Eye, Edit, Calendar, Clock } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { Doc } from "../../../../convex/_generated/dataModel";

export default function MyArticlesPage() {
  const { isSignedIn, isLoaded } = useUser();

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
    if (submissionStatus) {
      switch (submissionStatus) {
        case "pending":
          return (
            <Badge
              variant="outline"
              className="text-yellow-600 border-yellow-600"
            >
              Under Review
            </Badge>
          );
        case "approved":
          return (
            <Badge
              variant="outline"
              className="text-green-600 border-green-600"
            >
              Published
            </Badge>
          );
        case "rejected":
          return (
            <Badge variant="outline" className="text-red-600 border-red-600">
              Rejected
            </Badge>
          );
        case "needs_revision":
          return (
            <Badge
              variant="outline"
              className="text-orange-600 border-orange-600"
            >
              Needs Revision
            </Badge>
          );
        default:
          return <Badge variant="outline">{submissionStatus}</Badge>;
      }
    }

    switch (status) {
      case "published":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            Published
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="outline" className="text-gray-600 border-gray-600">
            Draft
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const ArticleCard = ({ article }: { article: Doc<"articles"> }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-lg line-clamp-2">
              {article.title}
            </CardTitle>
            <p className="text-gray-600 text-sm line-clamp-2">
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
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
              >
                {tag}
              </span>
            ))}
            {article.tags?.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                +{article.tags.length - 3} more
              </span>
            )}
          </div>

          <div className="flex gap-2">
            {article.status === "published" &&
              article.submissionStatus === "approved" && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/blog/${article.slug}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Link>
                </Button>
              )}
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
    </div>
  );
}
