"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileEdit } from "lucide-react";

export function RecentArticles() {
  const articles = useQuery(api.articles.list, { limit: 5 });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Articles</CardTitle>
        <Link href="/admin/articles">
          <Button variant="ghost" size="sm">View all</Button>
        </Link>
      </CardHeader>
      <CardContent>
        {articles === undefined ? (
          // Loading state
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-muted rounded w-1/4 animate-pulse" />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          // Empty state
          <div className="text-center py-6 text-muted-foreground">
            No articles yet
          </div>
        ) : (
          // Articles list
          <div className="space-y-4">
            {articles.map((article) => (
              <div
                key={article._id}
                className="flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/blog/${article.slug}`}
                      className="text-sm font-medium hover:underline line-clamp-1"
                    >
                      {article.title}
                    </Link>
                    {/* <Badge variant={getStatusVariant(article.status)}>
                      {article.status}
                    </Badge> */}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{article.author?.name}</span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(article.lastModified, { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/admin/articles/${article._id}/edit`}>
                    <Button size="icon" variant="ghost">
                      <FileEdit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/blog/${article.slug}`} target="_blank">
                    <Button size="icon" variant="ghost">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
