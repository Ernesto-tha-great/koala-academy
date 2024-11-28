import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const { user } = useUser();
  
  // if (!user) {
  //   redirect('/sign-in');
  // }

  // if (user.publicMetadata.role !== 'admin') {
  //   redirect('/');
  // }

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