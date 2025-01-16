"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Menu, PenSquare, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function MainNav() {
  const { user: clerkUser, isLoaded } = useUser();
  const isAdmin = useQuery(api.auth.isAdmin);
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Don't show nav on admin pages
  if (pathname.startsWith("/admin")) return null;

  const NavLinks = () => (
    <>
      <Link 
        href="/blog" 
        className="text-sm font-medium font-parkinsans hover:text-primary"
        onClick={() => setIsMenuOpen(false)}
      >
        Articles
      </Link>
      <Link 
        href="/guides" 
        className="text-sm font-medium font-parkinsans hover:text-primary"
        onClick={() => setIsMenuOpen(false)}
      >
        Guides
      </Link>
      <Link 
        href="/morph" 
        className="text-sm font-medium font-parkinsans hover:text-primary"
        onClick={() => setIsMenuOpen(false)}
      >
        Morph
      </Link>
    </>
  );

  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2">
            <Image src="/morphLogo.svg" alt="bookkoala" width={18} height={18} />
            <Link href="/" className="text-xl font-semibold font-manrope">
              Koala Academy
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 font-parkinsans">
            <NavLinks />

            {isLoaded && (
              <div className="flex items-center gap-4">
                {clerkUser ? (
                  <>
                    {isAdmin && (
                      <>
                        <Link href="/admin/articles/new">
                          <Button size="sm" variant="ghost" className="gap-2">
                            <PenSquare className="h-4 w-4" />
                            Write
                          </Button>
                        </Link>
                        <Link 
                          href="/admin"
                          className="text-sm font-medium hover:text-primary"
                        >
                          Dashboard
                        </Link>
                      </>
                    )}
                    <UserButton afterSignOutUrl="/" />
                  </>
                ) : (
                  <SignInButton mode="modal">
                    <Button size="sm">Sign In</Button>
                  </SignInButton>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "md:hidden fixed inset-x-0 top-16 bg-white border-b z-50 transition-all duration-300 ease-in-out",
            isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
          )}
        >
          <div className="flex flex-col gap-4 p-4">
            <NavLinks />
            
            {isLoaded && (
              <div className="flex flex-col gap-4 pt-4 border-t">
                {clerkUser ? (
                  <>
                    {isAdmin && (
                      <>
                        <Link href="/admin/articles/new">
                          <Button size="sm" variant="ghost" className="w-full gap-2 justify-start">
                            <PenSquare className="h-4 w-4" />
                            Write
                          </Button>
                        </Link>
                        <Link 
                          href="/admin"
                          className="text-sm font-medium hover:text-primary px-2"
                        >
                          Dashboard
                        </Link>
                      </>
                    )}
                    <div className="px-2">
                      <UserButton afterSignOutUrl="/" />
                    </div>
                  </>
                ) : (
                  <SignInButton mode="modal">
                    <Button size="sm" className="w-full">Sign In</Button>
                  </SignInButton>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}