"use client";

import { useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient, useMutation } from "convex/react";
import { useEffect } from "react";
import { api } from "../../../convex/_generated/api";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function InitUser({ children }: { children: React.ReactNode }) {
  const { isLoaded, userId } = useAuth();
  const createUser = useMutation(api.auth.createOrGetUser);

  useEffect(() => {
    if (isLoaded && userId) {
      createUser()
        .catch(console.error);
    }
  }, [isLoaded, userId, createUser]);

  return children;
}

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <InitUser>{children}</InitUser>``
    </ConvexProviderWithClerk>
  );
}