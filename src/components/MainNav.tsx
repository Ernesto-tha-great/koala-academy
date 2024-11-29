// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
// import { Button } from "@/components/ui/button";

// export function MainNav() {
//   const { user, isLoaded } = useUser();
//   const pathname = usePathname();

//   // Don't show nav on admin pages
//   if (pathname.startsWith("/admin")) return null;

//   return (
//     <nav className="border-b">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between h-16">
//           <Link href="/" className="text-xl font-bold">
//             Morph Blog
//           </Link>

//           <div className="flex items-center gap-6">
//             <Link 
//               href="/blog" 
//               className="text-sm font-medium hover:text-primary"
//             >
//               Articles
//             </Link>

//             {isLoaded && (
//               <div>
//                 {user ? (
//                   <div className="flex items-center gap-6">
//                     {user.publicMetadata.role === "admin" && (
//                       <Link 
//                         href="/admin"
//                         className="text-sm font-medium hover:text-primary"
//                       >
//                         Admin Dashboard
//                       </Link>
//                     )}
//                     <UserButton  />
//                   </div>
//                 ) : (
//                   <SignInButton mode="modal">
//                     <Button size="sm">Sign In</Button>
//                   </SignInButton>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// }

// components/MainNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { PenSquare } from "lucide-react";

export function MainNav() {
  const { user: clerkUser, isLoaded } = useUser();
  const isAdmin = useQuery(api.auth.isAdmin);
  const pathname = usePathname();

  // Don't show nav on admin pages
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold">
            Morph Academy
          </Link>

          <div className="flex items-center gap-6">
            <Link 
              href="/blog" 
              className="text-sm font-medium hover:text-primary"
            >
              Articles
            </Link>

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
        </div>
      </div>
    </nav>
  );
}