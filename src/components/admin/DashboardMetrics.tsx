"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  MessageSquare,
  Users,
  Eye,
  TrendingUp,
  ThumbsUp,
} from "lucide-react";

export function DashboardMetrics() {
  const stats = useQuery(api.admin.getStats);

  const metrics = [
    {
      title: "Total Articles",
      value: stats?.articles.total ?? 0,
      trend: stats?.articles.trend ?? 0,
      icon: FileText,
    },
    {
      title: "Total Views",
      value: stats?.views.total ?? 0,
      trend: stats?.views.trend ?? 0,
      icon: Eye,
    },
    {
      title: "Comments",
      value: stats?.comments.total ?? 0,
      trend: stats?.comments.trend ?? 0,
      icon: MessageSquare,
    },
    {
      title: "Active Users",
      value: stats?.users.total ?? 0,
      trend: stats?.users.trend ?? 0,
      icon: Users,
    },
    {
      title: "Engagement Rate",
      value: `${stats?.engagement ?? 0}%`,
      trend: stats?.engagementTrend ?? 0,
      icon: TrendingUp,
    },
    {
      title: "Total Reactions",
      value: stats?.reactions ?? 0,
      trend: stats?.reactionsTrend ?? 0,
      icon: ThumbsUp,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {metric.trend > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
              )}
              {Math.abs(metric.trend)}% from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}