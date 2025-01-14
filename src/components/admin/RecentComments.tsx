/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, MessageSquare } from "lucide-react";



export function RecentComments() {


  const comments = useQuery(api.comments.list, {
    limit: 5,
    articleId: "skip" as any // TODO: Fix this properly
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Recent Comments
        </CardTitle>
        <Link href="/admin/comments">
          <Button variant="ghost" size="sm">View all</Button>
        </Link>
      </CardHeader>
      <CardContent>
        {comments === undefined ? (
          // Loading state
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
                <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          // Empty state
          <div className="text-center py-6 text-muted-foreground">
            No comments yet
          </div>
        ) : (
          // Comments list
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment._id} className="group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{comment.authorName}</span>
                    <span className="text-muted-foreground">
                      {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                  <Link href={`/blog/${comment.articleId}#comment-${comment._id}`}>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {comment.content}
                </p>
                <Link
                  href={`/blog/${comment.articleId}`}
                  className="text-xs text-muted-foreground hover:underline mt-2 block"
                >
                  {/* @ts-expect-error - article title might be undefined but we know it exists */}
                  on: {comment.article.title}
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}