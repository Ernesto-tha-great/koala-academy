import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function BlogHeader() {
  return (
    <header className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <nav className="flex items-center gap-6">
          <Link href="/blog" className="font-medium hover:text-primary">
            Latest
          </Link>
          <Link href="/blog?sort=popular" className="font-medium hover:text-primary">
            Popular
          </Link>
        </nav>
        <Button variant="ghost" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}