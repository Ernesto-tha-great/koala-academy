"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  MessageSquare,
  Tags,
  Settings,
  PenTool,
} from "lucide-react";

const navigation = [
  {
    name: "Articles",
    href: "/admin",
    icon: FileText,
  },
  {
    name: "Guides",
    href: "/admin/editor/new",
    icon: PenTool,
  },
  {
    name: "Morph",
    href: "/admin/comments",
    icon: MessageSquare,
  },
//   {
//     name: "Users",
//     href: "/admin/users",
//     icon: Users,
//   },
//   {
//     name: "Tags",
//     href: "/admin/tags",
//     icon: Tags,
//   },
//   {
//     name: "Settings",
//     href: "/admin/settings",
//     icon: Settings,
//   },
];

export function BlogSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:flex h-screen w-64 flex-col fixed left-0 top-0 border-r bg-background">
      <div className="p-6">
        <Link href="/">
        <h1 className="text-2xl font-bold">Koala Academy</h1>
</Link>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}