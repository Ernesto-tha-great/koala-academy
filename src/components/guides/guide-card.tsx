import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Clock, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface GuideCardProps {
  guide: {
    _id: string;
    slug: string;
    title: string;
    excerpt: string;
    type: string;
    views: number;
    readingTime: number;
    tags: string[];
    level: string;
  };
}

export function GuideCard({ guide }: GuideCardProps) {
  return (
    <Link href={`/guides/${guide.slug}`}>
      <Card className="group h-full transition-all hover:shadow-lg hover:border-primary/20">
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <Badge
              variant="secondary"
              className={cn(
                "text-sm",
                guide.level === "beginner" && "bg-green-100 text-green-800",
                guide.level === "intermediate" && "bg-blue-100 text-blue-800",
                guide.level === "advanced" && "bg-purple-100 text-purple-800"
              )}
            >
              {guide.level}
            </Badge>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
            {guide.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground line-clamp-2 mb-4">
            {guide.excerpt}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {guide.readingTime} min
            </div>
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {guide.views}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}