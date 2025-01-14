
export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {


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