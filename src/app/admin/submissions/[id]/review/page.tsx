"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { BackButton } from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import {
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  User,
  Mail,
  Calendar,
  Tag,
  ExternalLink,
} from "lucide-react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ReviewSubmissionPage() {
  const params = useParams();

  const articleId = params.id ? (params.id as Id<"articles">) : null;

  const article = useQuery(
    api.articles.getById,
    articleId ? { id: articleId } : "skip"
  );

  if (!article) {
    return (
      <div className="p-8">
        <div className="h-8 bg-muted rounded w-1/4 animate-pulse" />
        <div className="mt-4 space-y-4">
          <div className="h-12 bg-muted rounded animate-pulse" />
          <div className="h-12 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "needs_revision":
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "needs_revision":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const authorName = article.guestAuthorName || "Unknown";
  const authorEmail = article.guestAuthorEmail;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <BackButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Article Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(article.submissionStatus)}
                    <Badge className={getStatusColor(article.submissionStatus)}>
                      {article.submissionStatus?.replace("_", " ") || "pending"}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">{article.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">{article.excerpt}</p>

              <div className="flex flex-wrap gap-2">
                {article.tags?.map((tag: string) => (
                  <Badge key={tag} variant="outline">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>

              {article.headerImage && (
                <div className="mt-4">
                  <Image
                    src={article.headerImage}
                    alt={article.title || "Article image"}
                    width={800}
                    height={256}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Article Content</CardTitle>
            </CardHeader>
            <CardContent>
              {article.type === "external" && article.externalUrl ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
                    <ExternalLink className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      External Article
                    </span>
                  </div>
                  <a
                    href={article.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    {article.externalUrl}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  {article.content && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">
                        Additional Content:
                      </h4>
                      <div className="prose max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {article.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="prose max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {article.content}
                  </ReactMarkdown>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review History */}
          {article.reviewNotes && (
            <Card>
              <CardHeader>
                <CardTitle>Review Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">{article.reviewNotes}</p>
                  {article.reviewedAt && (
                    <p className="text-xs text-gray-500">
                      Reviewed on{" "}
                      {new Date(article.reviewedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Author Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Author Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{authorName}</p>
              </div>

              {authorEmail && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-3 w-3" />
                  {authorEmail}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Article Details */}
          <Card>
            <CardHeader>
              <CardTitle>Article Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Type</p>
                  <p className="font-medium capitalize">{article.type}</p>
                </div>
                <div>
                  <p className="text-gray-500">Category</p>
                  <p className="font-medium capitalize">{article.category}</p>
                </div>
                <div>
                  <p className="text-gray-500">Level</p>
                  <p className="font-medium capitalize">{article.level}</p>
                </div>
                <div>
                  <p className="text-gray-500">Reading Time</p>
                  <p className="font-medium">{article.readingTime} min</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-gray-500" />
                  <span className="text-gray-500">Submitted:</span>
                  <span>
                    {article.submittedAt
                      ? new Date(article.submittedAt).toLocaleDateString()
                      : "Unknown"}
                  </span>
                </div>

                {article.reviewedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-500">Reviewed:</span>
                    <span>
                      {new Date(article.reviewedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO Information */}
          {(article.seoTitle || article.seoDescription) && (
            <Card>
              <CardHeader>
                <CardTitle>SEO Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {article.seoTitle && (
                  <div>
                    <p className="text-sm text-gray-500">SEO Title</p>
                    <p className="text-sm">{article.seoTitle}</p>
                  </div>
                )}
                {article.seoDescription && (
                  <div>
                    <p className="text-sm text-gray-500">SEO Description</p>
                    <p className="text-sm">{article.seoDescription}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Remove ReviewDialog for now to fix type issues */}
    </div>
  );
}
