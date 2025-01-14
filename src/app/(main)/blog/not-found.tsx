import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Article Not Found</h2>
        <p className="text-muted-foreground">
          The article you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/blog">Back to Articles</Link>
        </Button>
      </div>
    </div>
  );
}