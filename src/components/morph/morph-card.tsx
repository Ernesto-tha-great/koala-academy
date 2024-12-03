import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { type MorphSection } from "@/lib/morph/content";

interface MorphCardProps {
  section: MorphSection;
}

export function MorphCard({ section }: MorphCardProps) {
  return (
    <Link href={`/morph/${section.slug}`} className="group">
      <Card className="h-full transition-all hover:shadow-lg hover:border-primary/20">
        <CardHeader>
          <div className="flex items-start justify-between">
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
          </div>
          
          {/* Topic Links */}
          <div className="mt-4 space-y-1">
            {section.topics.map((topic) => (
              <Link 
                key={topic.slug}
                href={`/morph/${section.slug}/${topic.slug}`}
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {topic.title}
              </Link>
            ))}
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}