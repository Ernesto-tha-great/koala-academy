"use client";

import { useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient, useMutation } from "convex/react";
import { useEffect } from "react";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function InitUser({ children }: { children: React.ReactNode }) {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const createOrUpdateUser = useMutation(api.users.createOrUpdate);

  useEffect(() => {
    if (isLoaded && user) {
      createOrUpdateUser({
        userId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        name: user.fullName || "Anonymous",
        admin: true,
      }).catch(console.error);
    }
  }, [isLoaded, user, createOrUpdateUser]);

  return children;
}

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <InitUser>{children}</InitUser>
    </ConvexProviderWithClerk>
  );
}