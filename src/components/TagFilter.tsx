"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TagFilterProps {
  selectedTag?: string;
}

export function TagFilter({ selectedTag }: TagFilterProps) {
  const router = useRouter();
  const tags = useQuery(api.tags.list);

  if (!tags?.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selectedTag ? "outline" : "default"}
        size="sm"
        onClick={() => router.push("/blog")}
      >
        All
      </Button>
      {tags.map((tag) => (
        <Button
          key={tag.name}
          variant={selectedTag === tag.name ? "default" : "outline"}
          size="sm"
          onClick={() => router.push(`/blog?tag=${tag.name}`)}
        >
          {tag.name}
        </Button>
      ))}
    </div>
  );
}