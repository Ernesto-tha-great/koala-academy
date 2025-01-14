"use client";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Image from "next/image";
import { motion } from "framer-motion";


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
    <div className="relative h-screen w-full flex items-center overflow-hidden">
      <div className="absolute top-0 left-0 right-0 bottom-0 -mx-8">
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-transparent z-10" />
        <Image
          src="/koalaStreet.svg"
          alt="Hero background"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <h1 className="text-7xl font-bold mb-6 text-white font-manrope tracking-tight">
            Learn to build for the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
              consumer
            </span>
          </h1>
          <p className="text-xl text-zinc-400 mb-12 leading-relaxed bg-opacity-10 backdrop-blur-sm">
            Join Morph Academy and learn from the best. Our platform is designed to help you learn the technical skills you need to succeed.
          </p>
          
          <form onSubmit={handleSubmit} className="relative z-50">
            <div className="flex w-full max-w-2xl relative">
              <div className="relative w-full group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What do you want to learn?"
                  className="w-full px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <Button 
                type="submit"
                disabled={searchQuery.length < 3}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6"
              >
                Search
              </Button>
            </div>

            {/* Autocomplete Results */}
            {searchQuery && searchResults && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute w-full mt-2 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg overflow-hidden"
              >
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
                    className="w-full px-6 py-4 text-left hover:bg-white/5 transition-colors text-white"
                  >
                    <div className="font-medium">{result.title}</div>
                    <div className="text-sm text-zinc-400">
                      {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
}