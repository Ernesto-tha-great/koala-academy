
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { api } from "../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { Suspense } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminLayoutContent children={children} />
    </Suspense>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  // const isAdmin = useQuery(api.users.isAdmin) ?? false;
  // if (!isAdmin) redirect('/');
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden md:flex h-full w-64 flex-col fixed inset-y-0 z-50">
        <AdminSidebar />
      </div>
      <main className="md:pl-64 h-full w-full">
        {children}
      </main>
    </div>
  );
}