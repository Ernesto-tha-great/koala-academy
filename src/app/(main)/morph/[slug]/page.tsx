import { notFound } from "next/navigation";
import { getMorphSection } from "@/lib/morph/content";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

interface Props {
  params: {
    slug: string;
  };
}

export default function MorphSectionPage({ params }: Props) {
  const section = getMorphSection(params.slug);
  
  if (!section) {
    notFound();
  }

  return (
    <div className="container max-w-7xl mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">{section.title}</h1>
        <p className="text-xl text-muted-foreground mb-12">{section.description}</p>
        
        <div className="grid gap-6">
          {section.topics.map((topic) => (
            <Link 
              key={topic.slug}
              href={`/morph/${section.slug}/${topic.slug}`}
            >
              <Card className="transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{topic.title}</CardTitle>
                      <CardDescription>{topic.description}</CardDescription>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}