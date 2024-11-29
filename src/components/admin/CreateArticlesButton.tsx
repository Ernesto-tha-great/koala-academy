"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function CreateArticleButton() {
  return (
    <Link href="/admin/articles/new">
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        New Article
      </Button>
    </Link>
  );
}