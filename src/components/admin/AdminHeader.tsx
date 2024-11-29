"use client";

import { UserButton } from "@clerk/nextjs";
// import { ModeToggle } from "@/components/ModeToggle";
import { usePathname } from "next/navigation";

export function AdminHeader() {
  const pathname = usePathname();
  const title = pathname.split("/").pop() || "Dashboard";

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-6">
      <h1 className="text-xl font-bold capitalize">
        {title}
      </h1>
      <div className="flex items-center gap-4">
        {/* <ModeToggle /> */}
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}