/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import Image from "next/image";
import remarkGfm from "remark-gfm";
import { Doc } from "../../convex/_generated/dataModel";

interface ContentPreviewProps {
  article: Doc<"articles"> & {
    author: {
      name: string;
    } | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ContentPreview = ({
  article,
  open,
  onOpenChange,
}: ContentPreviewProps) => {
  if (!article) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-y-auto">
        <DialogHeader className="px-6 py-4 sticky top-0 bg-white border-b z-10">
          <DialogTitle>Article Preview</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto px-6 pb-6">
          <article className="space-y-6">
            <header className="space-y-4 pt-4">
              <div className="flex flex-wrap gap-2">
                {article.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-sm bg-emerald-100 text-emerald-800 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-4xl font-bold">{article.title}</h1>

              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <span>{article.author?.name || "Your Article"}</span>
                  <span>•</span>
                  <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    {article.submissionStatus || "Draft Preview"}
                  </span>
                </div>
                {article.readingTime && (
                  <span>{article.readingTime} min read</span>
                )}
              </div>

              {article.excerpt && (
                <p className="text-lg text-gray-600 italic border-l-4 border-emerald-200 pl-4">
                  {article.excerpt}
                </p>
              )}
            </header>

            {article.headerImage && (
              <div className="w-full aspect-video relative rounded-lg overflow-hidden">
                <Image
                  src={article.headerImage}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, children, ...props }) => (
                    <h1 className="text-4xl font-bold mt-8 mb-4" {...props}>
                      {children}
                    </h1>
                  ),
                  h2: ({ node, children, ...props }) => (
                    <h2 className="text-3xl font-bold mt-8 mb-4" {...props}>
                      {children}
                    </h2>
                  ),
                  h3: ({ node, children, ...props }) => (
                    <h3 className="text-2xl font-bold mt-6 mb-3" {...props}>
                      {children}
                    </h3>
                  ),
                  h4: ({ node, children, ...props }) => (
                    <h4 className="text-xl font-bold mt-6 mb-3" {...props}>
                      {children}
                    </h4>
                  ),
                  h5: ({ node, children, ...props }) => (
                    <h5 className="text-lg font-bold mt-4 mb-2" {...props}>
                      {children}
                    </h5>
                  ),
                  h6: ({ node, children, ...props }) => (
                    <h6 className="text-base font-bold mt-4 mb-2" {...props}>
                      {children}
                    </h6>
                  ),
                  p: ({ node, children, ...props }) => (
                    <p className="my-4 leading-relaxed" {...props}>
                      {children}
                    </p>
                  ),
                  img: ({ node, src, alt, ...props }) => {
                    return (
                      <div className="my-6">
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
                  code: (props: any) => {
                    const { node, inline, className, children, ...rest } =
                      props;
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus as any}
                        language={match[1]}
                        PreTag="div"
                        {...rest}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code
                        className="bg-gray-100 px-1 py-0.5 rounded text-sm"
                        {...rest}
                      >
                        {children}
                      </code>
                    );
                  },
                  blockquote: (props: any) => (
                    <blockquote
                      className="border-l-4 border-emerald-200 pl-4 py-2 my-4 italic text-gray-700"
                      {...props}
                    >
                      {props.children}
                    </blockquote>
                  ),
                  ul: (props: any) => (
                    <ul
                      className="list-disc list-inside my-4 space-y-2"
                      {...props}
                    >
                      {props.children}
                    </ul>
                  ),
                  ol: (props: any) => (
                    <ol
                      className="list-decimal list-inside my-4 space-y-2"
                      {...props}
                    >
                      {props.children}
                    </ol>
                  ),
                  li: (props: any) => (
                    <li className="ml-4" {...props}>
                      {props.children}
                    </li>
                  ),
                  a: (props: any) => (
                    <a
                      href={props.href}
                      className="text-emerald-600 hover:text-emerald-800 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    >
                      {props.children}
                    </a>
                  ),
                  table: (props: any) => (
                    <div className="overflow-x-auto my-6">
                      <table
                        className="min-w-full border border-gray-300"
                        {...props}
                      >
                        {props.children}
                      </table>
                    </div>
                  ),
                  th: (props: any) => (
                    <th
                      className="border border-gray-300 px-4 py-2 bg-gray-50 font-semibold"
                      {...props}
                    >
                      {props.children}
                    </th>
                  ),
                  td: (props: any) => (
                    <td className="border border-gray-300 px-4 py-2" {...props}>
                      {props.children}
                    </td>
                  ),
                }}
              >
                {article.content}
              </ReactMarkdown>
            </div>
          </article>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContentPreview;
