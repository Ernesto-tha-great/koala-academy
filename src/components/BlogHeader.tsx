"use client";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";


export default function BlogHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  
  // Get search results as user types (for potential autocomplete)
  const searchResults = useQuery(api.articles.search, {
    query: searchQuery,
    limit: 5, // Limit for autocomplete suggestions
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page
      router.push(`/blog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div 
      className="relative bg-cover bg-center rounded-xl font-manrope"
      style={{
        backgroundImage: 'url("/koalaStreet.svg")'
      }}
    >
      <div className="relative w-[1200px] h-[600px]">
        <div className="absolute bottom-12 left-12 max-w-xl text-white">
          <h1 className="text-5xl font-bold mb-3">
            Learn to build for the consumer
          </h1>
          <p className="text-sm text-gray-300 mb-6">
            Join Morph Academy and learn from the best. Our platform is designed to help you learn the technical skills you need to succeed in your career.
          </p>
          
          <form onSubmit={handleSubmit} className="relative z-50">
            <div className="flex w-full max-w-md relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What do you want to learn?"
                className="w-full px-4 py-5 rounded-lg text-gray-900 focus:outline-none text-sm pr-[100px]"
              />
              <Button 
                type="submit"
                disabled={searchQuery.length < 3}
                className="bg-green-500 hover:bg-green-600 rounded-lg absolute right-2 top-1/2 -translate-y-1/2"
              >
                Search
              </Button>
            </div>

            {/* Optional: Show autocomplete results */}
            {searchQuery && searchResults && searchResults.length > 0 && (
              <div className="absolute w-full mt-2 bg-white rounded-lg shadow-lg z-50 max-h-[300px] overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={result._id}
                    onClick={(e) => {
                      e.preventDefault(); // Prevent form submission
                      e.stopPropagation(); // Stop event bubbling
                      const encodedSlug = encodeURIComponent(result.title)
                        .toLowerCase()
                        .replace(/%20/g, '-')
                        .replace(/[&]/g, 'and')
                        .replace(/[^a-z0-9-]/g, '');
                      router.push(`/blog/${encodedSlug}`);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-gray-900"
                  >
                    <div className="font-medium">{result.title}</div>
                    <div className="text-xs text-gray-500">
                      {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}