"use client";

import Link from "next/link";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";

export function BlogHeader() {
  const { user, isLoaded } = useUser();

  return (
    <header className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold">
            Morph Blog
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link href="/blog" className="hover:text-gray-600">
              Articles
            </Link>
            {user?.publicMetadata?.role === "admin" && (
              <Link href="/admin" className="hover:text-gray-600">
                Admin
              </Link>
            )}
            {isLoaded && (
              <div>
                {user ? (
                  <UserButton afterSignOutUrl="/" />
                ) : (
                  <SignInButton mode="modal" />
                )}
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}