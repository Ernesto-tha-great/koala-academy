import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import Image from "next/image";
import remarkGfm from 'remark-gfm';
import { Doc } from "../../../convex/_generated/dataModel";
import { formatDate } from '@/lib/utils';

interface ContentPreviewProps {
  article: Doc<"articles"> & {
    author: {
      name: string;
    } | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
  
const ContentPreview = ({  article, open, onOpenChange }: ContentPreviewProps) => {
    if (!article) return null;
    console.log(article.content);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-y-auto">
      <DialogHeader className="px-6 py-4 sticky top-0 bg-white border-b">
        <DialogTitle>Preview</DialogTitle>
      </DialogHeader>
      
      <div className="overflow-y-auto px-6 pb-6">
        <article className="space-y-6">
          <header className="space-y-4 pt-4">
            <div className="flex flex-wrap gap-2">
              {article.tags?.map((tag) => (
                <span key={tag} className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            
            <h1 className="text-4xl font-bold">{article.title}</h1>
            
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <span>{article.author?.name || ''}</span>
                {article.publishedAt && (
                  <>
                    <span>•</span>
                    <time dateTime={new Date(article.publishedAt).toISOString()}>
                      {formatDate(article.publishedAt)}
                    </time>
                  </>
                )}
              </div>
              {article.readingTime && <span>{article.readingTime} min read</span>}
            </div>
          </header>

          {article.headerImage && (
              <div className="w-full aspect-video relative">
                <Image 
                  src={article.headerImage} 
                  alt={article.title} 
                  fill 
                  className="object-cover rounded-lg" 
                />
              </div>
            )}


<div className="prose prose-lg max-w-none">
        <ReactMarkdown
          rehypePlugins={[remarkGfm]}
          components={{
            h1: ({node, children, ...props}) => (
                <h1 className="text-4xl font-bold mt-8 mb-4" {...props}>{children}</h1>
              ),
              h2: ({node, children, ...props}) => (
                <h2 className="text-3xl font-bold mt-8 mb-4" {...props}>{children}</h2>
              ),
              h3: ({node, children, ...props}) => (
                <h3 className="text-2xl font-bold mt-6 mb-3" {...props}>{children}</h3>
              ),
              h4: ({node, children, ...props}) => (
                <h4 className="text-xl font-bold mt-6 mb-3" {...props}>{children}</h4>
              ),
              h5: ({node, children, ...props}) => (
                <h5 className="text-lg font-bold mt-4 mb-2" {...props}>{children}</h5>
              ),
              h6: ({node, children, ...props}) => (
                <h6 className="text-base font-bold mt-4 mb-2" {...props}>{children}</h6>
              ),
              p: ({node, children, ...props}) => (
                <p className="my-4" {...props}>{children}</p>
              ),
            img: ({node, src, alt, ...props}) => {
                return (
                  <div className="my-4">
                    <Image
                      src={src || ""}
                      alt={alt || "Article image"}
                      width={800}
                      height={400}
                      className="rounded-lg"
                    />
                  </div>
                );
              },
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return match ? (
                  <SyntaxHighlighter
                    language={match[1]}
                    style={vscDarkPlus}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className="bg-gray-100 text-red-500 px-1 py-0.5 rounded font-mono text-sm" {...props}>
                    {children}
                  </code>
                );
              },
          }}
        >
          {article.content}
        </ReactMarkdown>
      </div>
    </article>
    </div>
    </DialogContent>
    </Dialog>
  )
}

export default ContentPreview