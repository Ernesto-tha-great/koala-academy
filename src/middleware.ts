import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const isProtectedRoute = createRouteMatcher(['/locker(.*)'])

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    return auth().then(async ({ userId }) => {
      if (!userId) {
        return NextResponse.redirect(new URL('/sign-in', req.url));
      }
      
      try {
        const isAdmin = await convex.query(api.users.isAdmin);
        if (!isAdmin) {
          return NextResponse.redirect(new URL('/', req.url));
        }
      } catch (error) {
        console.error('Admin check failed:', error);
        return NextResponse.redirect(new URL('/', req.url));
      }
    });
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};