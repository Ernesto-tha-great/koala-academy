import { MDXRemote } from 'next-mdx-remote';
import { compileMDX } from 'next-mdx-remote/rsc';
import { cn } from "@/lib/utils";

interface GuideContentProps {
  content: string;
  className?: string;
}

export async function GuideContent({ content, className }: GuideContentProps) {
    const { content: mdxContent } = await compileMDX({
      source: content,
      options: { parseFrontmatter: false }
    });
    
    return (
      <div className={cn("prose prose-zinc dark:prose-invert max-w-none", className)}>
        {mdxContent}
      </div>
    );
  }