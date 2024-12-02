import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { MainNav } from "@/components/MainNav";
import { Main } from "next/document";

export default async function BlogLayout({
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
     <div className="">
        {/* <MainNav /> */}
      </div>
      <main className="h-full w-full">
        {children}
      </main>
    </div>
  );
}