"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { formatISO } from "date-fns";

export function TopArticles() {
  const topArticles = useQuery(api.articles.getTopArticles, {
    date: formatISO(new Date(), { representation: 'date' }),
    limit: 5
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Articles Today</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topArticles?.map((article) => (
            <div key={article._id} className="flex items-center justify-between">
              <div>
                <Link 
                  href={`/blog/${article.slug}`}
                  className="font-medium hover:underline"
                >
                  {article.title}
                </Link>
                <div className="text-sm text-muted-foreground">
                  {article.dailyViews} views today
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDistanceToNow(article.publishedAt!)} ago
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}