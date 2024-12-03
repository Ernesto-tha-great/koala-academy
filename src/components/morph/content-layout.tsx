import { cn } from "@/lib/utils";

interface ContentLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function ContentLayout({ children, className }: ContentLayoutProps) {
  return (
    <div className={cn("prose prose-zinc dark:prose-invert max-w-none", className)}>
      {children}
    </div>
  );
}