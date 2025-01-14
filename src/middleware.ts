import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { ADMIN_EMAILS } from "./lib/adminEmails";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes and non-protected routes
  if (!req.url.includes('/admin') && !req.url.includes('/write')) {
    return NextResponse.next();
    }

    const { userId, sessionClaims } = await auth();
    
    // No user, redirect to sign-in
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    try {
      // First check if user's email is in admin list
   
      const {isAdmin, email} = await convex.query(api.users.isAdminById, {userId: sessionClaims.sub as string});
         console.log('Checking admin access for:', email);
      
      if (email && ADMIN_EMAILS.includes(email)) {
        console.log('User is admin by email');
        return NextResponse.next();
      }

      console.log('Convex admin check result:', email);

      if (isAdmin) {
        return NextResponse.next();
      }

      // If neither check passes, redirect to home
      console.log('User is not admin, redirecting to home');
      return NextResponse.redirect(new URL('/', req.url));
      
    } catch (error) {
      console.error('Admin check failed:', error);
      return NextResponse.redirect(new URL('/', req.url));
  }
});

export const config = {
  matcher: [
    "/((?!static|.*\\..*|_next|favicon.ico).*)",
    "/",
  ],
};