"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export function TopArticles() {

const topArticles = useQuery(api.articles.trending);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Articles Today</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topArticles?.map((article) => (
            <div key={article._id} className="flex items-start justify-between">
              <div>
                <Link 
                  href={`/blog/${article.slug}`}
                  className="font-medium hover:underline"
                >
                  {article.title}
                </Link>
                <div className="text-sm text-muted-foreground">
                  {article.views} views today
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {article.publishedAt ? formatDate(article.publishedAt) : ''} ago
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}