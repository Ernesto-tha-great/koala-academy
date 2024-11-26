"use client";


import { useRouter, useSearchParams } from "next/navigation";

export function TagFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTag = searchParams.get("tag");
  
  const tags = ["All", "React", "Next.js", "TypeScript", "Backend"]; // You might want to fetch these dynamically

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => {
            if (tag === "All") {
              router.push("/blog");
            } else {
              router.push(`/blog?tag=${tag.toLowerCase()}`);
            }
          }}
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
            (tag === "All" && !currentTag) || 
            tag.toLowerCase() === currentTag
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}