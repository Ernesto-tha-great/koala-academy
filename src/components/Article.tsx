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
    <article className="space-y-8">
      <header className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <h1 className="text-4xl font-bold">{article.title}</h1>
        
        <div className="flex items-center gap-4 text-gray-600">
          <div className="flex items-center gap-2">
            <span>
                {article.author.name}</span>
            <span>•</span>
            <time dateTime={article.publishedAt ? new Date(article.publishedAt).toISOString() : ''}>
              {article.publishedAt ? formatDate(article.publishedAt) : ''}
            </time>
          </div>
          <span>{article.readingTime} min read</span>
        </div>
      </header>


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
              return  match ? (
                <SyntaxHighlighter
                  language={match[1]}
                  style={vscDarkPlus}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
          }}
        >
          {article.content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
