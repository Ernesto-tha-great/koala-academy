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
      <AdminSidebar />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}