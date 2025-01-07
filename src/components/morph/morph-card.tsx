"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { type MorphSection } from "@/lib/morph/content";

interface MorphCardProps {
  section: MorphSection;
}

export function MorphCard({ section }: MorphCardProps) {
  return (
    <div className="group">
      <Card className="h-full transition-all hover:shadow-lg hover:border-primary/20">
        <CardHeader>
          <Link href={`/morph/${section.slug}`} className="flex items-start justify-between">
            <div>
              <div className="p-2 w-fit rounded-lg bg-primary/5 mb-4">
                <section.icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="group-hover:text-primary transition-colors">
                {section.title}
              </CardTitle>
              <CardDescription className="mt-2">
                {section.description}
              </CardDescription>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          
          {/* Topic Links - Separate from main card link */}
          <div className="mt-4 space-y-1">
            {section.topics.map((topic) => (
              <div key={topic.slug} className="block text-sm">
                <Link 
                  href={`/morph/${section.slug}/${topic.slug}`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {topic.title}
                </Link>
              </div>
            ))}
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}