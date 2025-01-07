"use client";

import { useState } from "react";
import { morphSections } from "@/lib/morph/content";
import { MorphCard } from "@/components/morph/morph-card";
import { MorphSearch } from "@/components/morph/morph-search";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function MorphPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSections = morphSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.topics.some(topic => 
      topic.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
 
  return (
    <div className="container max-w-7xl mx-auto py-12 px-4">
      {/* Hero Section */}
      <div className="relative mb-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Morph Documentation
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Technical documentation and architecture deep dives for developers building on Morph L2
          </p>
          <MorphSearch value={searchQuery} onChange={setSearchQuery} />
        </div>
      </div>

      {/* Documentation Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSections.map((section) => (
          <MorphCard key={section.slug} section={section} />
        ))}
      </div>

      {/* Getting Started CTA */}
      <div className="mt-16 text-center">
        <div className="p-8 rounded-2xl bg-gradient-to-r from-background to-muted">
          <h2 className="text-2xl font-semibold mb-4">
            Ready to start building?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Check out our quick start guide to begin building your first application on Morph L2
          </p>
          <Button size="lg" asChild>
            <Link href="/guides/getting-started">
              Get Started
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}