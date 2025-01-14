// // app/(main)/morph/[section]/[topic]/page.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { notFound } from "next/navigation";
// import { getMorphSection, getMorphTopic } from "@/lib/morph/content";
// import { ContentLayout } from "@/components/morph/content-layout";
// import { Button } from "@/components/ui/button";
// import {
//   ChevronLeft,
//   ChevronRight,
//   Copy,
//   CheckCheck,
//   ArrowLeft
// } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import Link from "next/link";
// import { cn } from "@/lib/utils";
// import { ScrollArea } from "@/components/ui/scroll-area";

// interface Props {
//   params: {
//     section: string;
//     topic: string;
//   };
// }

// interface TableOfContentsItem {
//   id: string;
//   title: string;
//   level: number;
// }

// export default function MorphTopicPage({ params }: Props) {
//   const [activeHeading, setActiveHeading] = useState("");
//   const [tableOfContents, setTableOfContents] = useState<TableOfContentsItem[]>([]);
//   const [copied, setCopied] = useState(false);

//   const section = getMorphSection(params.section);
//   const topic = section ? getMorphTopic(params.section, params.topic) : null;
  
//   if (!section || !topic) {
//     notFound();
//   }

//   // Find adjacent topics for navigation
//   const currentTopicIndex = section.topics.findIndex(t => t.slug === params.topic);
//   const previousTopic = currentTopicIndex > 0 ? section.topics[currentTopicIndex - 1] : null;
//   const nextTopic = currentTopicIndex < section.topics.length - 1 
//     ? section.topics[currentTopicIndex + 1] 
//     : null;

//   useEffect(() => {
//     // Generate table of contents from headings
//     const headings = document.querySelectorAll('h2, h3');
//     const items: TableOfContentsItem[] = Array.from(headings).map((heading) => ({
//       id: heading.id,
//       title: heading.textContent || '',
//       level: parseInt(heading.tagName.substring(1)),
//     }));
//     setTableOfContents(items);

//     // Set up intersection observer for active heading
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             setActiveHeading(entry.target.id);
//           }
//         });
//       },
//       { rootMargin: '-100px 0px -66% 0px' }
//     );

//     headings.forEach((heading) => observer.observe(heading));

//     return () => observer.disconnect();
//   }, []);

//   const copyCode = async () => {
//     await navigator.clipboard.writeText("YOUR_CODE_HERE");
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   return (
//     <div className="container max-w-7xl mx-auto py-12 px-4">
//       {/* Back to section */}
//       <Link
//         href={`/morph/${section.slug}`}
//         className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8"
//       >
//         <ArrowLeft className="mr-2 h-4 w-4" />
//         Back to {section.title}
//       </Link>

//       <div className="flex gap-12">
//         {/* Main Content */}
//         <div className="flex-1 max-w-3xl">
//           <div className="mb-8">
//             <Badge variant="outline" className="mb-4">
//               {section.title}
//             </Badge>
//             <h1 className="text-4xl font-bold mb-4">{topic.title}</h1>
//             <p className="text-xl text-muted-foreground">{topic.description}</p>
//           </div>

//           <ContentLayout>
//             <div className="prose prose-zinc dark:prose-invert">
//               <h2 id="overview">Overview</h2>
//               <p>Content for the overview section...</p>

//               <h2 id="implementation">Implementation Details</h2>
//               <p>Technical implementation details...</p>

//               {/* Code Example */}
//               <div className="relative">
//                 <div className="absolute right-4 top-4">
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     onClick={copyCode}
//                     className="h-6 w-6"
//                   >
//                     {copied ? (
//                       <CheckCheck className="h-4 w-4" />
//                     ) : (
//                       <Copy className="h-4 w-4" />
//                     )}
//                   </Button>
//                 </div>
//                 <pre className="language-typescript">
//                   <code>
//                     {`// Example code
// const example = "code";`}
//                   </code>
//                 </pre>
//               </div>

//               <h2 id="considerations">Key Considerations</h2>
//               <p>Important considerations and trade-offs...</p>

//               <h3 id="security">Security Implications</h3>
//               <p>Security-related considerations...</p>

//               <h2 id="examples">Examples</h2>
//               <p>Practical examples and use cases...</p>
//             </div>
//           </ContentLayout>

//           {/* Navigation Footer */}
//           <div className="mt-16 flex items-center justify-between pt-4 border-t">
//             {previousTopic ? (
//               <Link href={`/morph/${section.slug}/${previousTopic.slug}`}>
//                 <Button variant="ghost" className="h-auto p-0">
//                   <ChevronLeft className="mr-2 h-4 w-4" />
//                   {previousTopic.title}
//                 </Button>
//               </Link>
//             ) : (
//               <div />
//             )}
            
//             {nextTopic && (
//               <Link href={`/morph/${section.slug}/${nextTopic.slug}`}>
//                 <Button variant="ghost" className="h-auto p-0">
//                   {nextTopic.title}
//                   <ChevronRight className="ml-2 h-4 w-4" />
//                 </Button>
//               </Link>
//             )}
//           </div>
//         </div>

//         {/* Table of Contents Sidebar */}
//         <div className="w-64 hidden xl:block">
//           <div className="sticky top-16">
//             <h4 className="text-sm font-semibold mb-4">On this page</h4>
//             <ScrollArea className="h-[calc(100vh-200px)]">
//               <div className="space-y-1">
//                 {tableOfContents.map((item) => (
//                   <a
//                     key={item.id}
//                     href={`#${item.id}`}
//                     className={cn(
//                       "block text-sm py-1 text-muted-foreground hover:text-foreground transition-colors",
//                       item.level === 3 && "pl-4",
//                       activeHeading === item.id && "text-primary font-medium"
//                     )}
//                   >
//                     {item.title}
//                   </a>
//                 ))}
//               </div>
//             </ScrollArea>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }