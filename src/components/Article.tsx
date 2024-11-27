import { formatDate } from "@/lib/utils";
import { Doc } from "../../convex/_generated/dataModel";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

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
            <span>{article.author.name}</span>
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
          components={{
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
            },
          }}
        >
          {article.content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
