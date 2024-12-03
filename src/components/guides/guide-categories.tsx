import { cn } from "@/lib/utils";
import { guideCategories } from "@/lib/guide";
import Link from "next/link";

interface GuideCategoriesProps {
  className?: string;
}

export function GuideCategories({ className }: GuideCategoriesProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <h2 className="text-2xl font-semibold">Quick Start Guides</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guideCategories.map((category) => (
          <Link 
            key={category.slug}
            href={`/guides/category/${category.slug}`}
            className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-background to-muted p-6 shadow-sm transition-all hover:shadow-md hover:from-muted/50 hover:to-background"
          >
            <div className="relative z-10">
              <category.icon className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">
                {category.name}
              </h3>
              <p className="text-muted-foreground text-sm">
                {category.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
