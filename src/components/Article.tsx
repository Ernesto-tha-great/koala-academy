/* eslint-disable @typescript-eslint/no-unused-vars */
import { formatDate } from "@/lib/utils";
import { Doc } from "../../convex/_generated/dataModel";
import ReactMarkdown from "react-markdown";
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import Image from "next/image";

interface ArticleProps {
  article: Doc<"articles"> & {
    author: {
      name: string;
    };
  };
}

export function Article({ article }: ArticleProps) {
  return (
    <article className="space-y-6 md:space-y-8">
      <header className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-blue-100 text-blue-800 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">{article.title}</h1>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-gray-600 text-sm sm:text-base">
          <div className="flex items-center gap-2">
            <span>{article.author.name}</span>
            <span className="hidden sm:inline">•</span>
          </div>
          <div className="flex items-center gap-2">
            <time dateTime={article.publishedAt ? new Date(article.publishedAt).toISOString() : ''}>
              {article.publishedAt ? formatDate(article.publishedAt) : ''}
            </time>
            <span>•</span>
            <span>{article.readingTime} min read</span>
          </div>
        </div>
      </header>

      {article.headerImage && (
        <div className="w-full h-48 sm:h-64 md:h-96 relative rounded-lg overflow-hidden">
          <Image src={article.headerImage} alt={article.title} fill className="object-cover" />
        </div>
      )}

      <div className="article-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            h1: ({node, children, ...props}) => (
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-6 sm:mt-8 mb-3 sm:mb-4" {...props}>{children}</h1>
            ),
            h2: ({node, children, ...props}) => (
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mt-6 sm:mt-8 mb-3 sm:mb-4" {...props}>{children}</h2>
            ),
            h3: ({node, children, ...props}) => (
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mt-5 sm:mt-6 mb-2 sm:mb-3" {...props}>{children}</h3>
            ),
            h4: ({node, children, ...props}) => (
              <h4 className="text-base sm:text-lg md:text-xl font-bold mt-5 sm:mt-6 mb-2 sm:mb-3" {...props}>{children}</h4>
            ),
            h5: ({node, children, ...props}) => (
              <h5 className="text-sm sm:text-base md:text-lg font-bold mt-4 mb-2" {...props}>{children}</h5>
            ),
            h6: ({node, children, ...props}) => (
              <h6 className="text-xs sm:text-sm md:text-base font-bold mt-4 mb-2" {...props}>{children}</h6>
            ),
            p: ({node, children, ...props}) => (
              <p className="my-3 sm:my-4 text-sm sm:text-base" {...props}>{children}</p>
            ),
            img: ({node, src, alt, ...props}) => {
              if (!src) return null;
              const cleanSrc = src.replace(/\/width=\d+,height=\d+,/, '/');
              
              return (
                <div className="my-4 sm:my-6">
                  <div className="relative w-full h-48 sm:h-64 md:h-[400px]">
                    <Image
                      src={cleanSrc}
                      alt={alt || "Article image"}
                      fill
                      className="rounded-lg object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              );
            },
            ul: ({children}) => (
              <ul className="list-disc list-inside space-y-1 sm:space-y-2 my-3 sm:my-4 text-sm sm:text-base">
                {children}
              </ul>
            ),
            ol: ({children}) => (
              <ol className="list-decimal list-inside space-y-1 sm:space-y-2 my-3 sm:my-4 text-sm sm:text-base">
                {children}
              </ol>
            ),
            li: ({children}) => (
              <li className="ml-2 sm:ml-4">
                {children}
              </li>
            ),
            code({node, className, children, ...props}) {
              const match = /language-(\w+)/.exec(className || "");
              return match ? (
                <div className="my-4 sm:my-6 text-sm sm:text-base overflow-x-auto">
                  <SyntaxHighlighter
                    language={match[1]}
                   /* @ts-expect-error - highlight.js types are not compatible with react-syntax-highlighter */
                    style={vscDarkPlus}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <code className="bg-gray-100 text-red-500 px-1 py-0.5 rounded font-mono text-xs sm:text-sm" {...props}>
                  {children}
                </code>
              );
            },
            table: ({children}) => (
              <div className="overflow-x-auto my-4 sm:my-8 -mx-4 sm:mx-0">
                <div className="min-w-full inline-block align-middle">
                  <table className="min-w-full divide-y divide-gray-200">
                    {children}
                  </table>
                </div>
              </div>
            ),
            blockquote: ({children}) => {
              const isQuote = children && 
                Array.isArray(children) &&
                children[0]?.props?.children &&
                Array.isArray(children[0].props.children) &&
                typeof children[0].props.children[0] === 'string' &&
                children[0].props.children[0].startsWith('> ');

              const content = isQuote
                ? children[0].props.children[0].substring(2)
                : children;

              return (
                <div className="my-4 sm:my-6">
                  <blockquote className="relative overflow-hidden rounded-lg bg-emerald-50 p-4 sm:p-6 border-l-4 border-emerald-500">
                    <div className="relative z-10">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="flex-shrink-0 pt-1">
                          <svg 
                            className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm sm:text-base text-emerald-800 leading-relaxed">
                            {content}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-emerald-50 opacity-50" />
                  </blockquote>
                </div>
              );
            },
          }}
        >
          {article.content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
