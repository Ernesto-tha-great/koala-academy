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
    
    console.log("Article tags:", article.tags);
    
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

      {article.headerImage && (
        <div className="w-full h-96 relative">
          <Image  src={article.headerImage} alt={article.title} fill className="object-cover" />
        </div>
      )}


      <div className="article-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
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
              if (!src) return null;
              
              // Clean up the URL if it contains width/height parameters
              const cleanSrc = src.replace(/\/width=\d+,height=\d+,/, '/');
            
              
              return (
                <div className="my-4">
                  <Image
                    src={cleanSrc}
                    alt={alt || "Article image"}
                    width={800}
                    height={400}
                    className="rounded-lg"
                    loading="lazy"
                  />
                </div>
              );
            },
            ul: ({children}) => (
              <ul className="list-disc list-inside space-y-2 my-4">
                {children}
              </ul>
            ),
            ol: ({children}) => (
              <ol className="list-inside list-decimal space-y-2 my-4">
                {children}
              </ol>
            ),
            li: ({children}) => (
              <li className="ml-4">
                {children}
              </li>
            ),
            code({ node, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              return match ? (
                <SyntaxHighlighter
                  language={match[1]}
                      // @ts-expect-error - style prop type mismatch with SyntaxHighlighter
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
            a: ({href, children}) => (
              <a 
                href={href}
                className="text-blue-500 hover:text-blue-700 underline font-medium"
                style={{
                  color: '#3b82f6',
                  textDecoration: 'underline',
                  fontWeight: 500
                }}
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
            table: ({children}) => (
              <div className="overflow-x-auto my-8">
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  border: '2px solid #e5e7eb',
                }}>
                  {children}
                </table>
              </div>
            ),
            thead: ({children}) => (
              <thead style={{ backgroundColor: '#f9fafb' }}>
                {children}
              </thead>
            ),
            tbody: ({children}) => (
              <tbody style={{ backgroundColor: 'white' }}>
                {children}
              </tbody>
            ),
            tr: ({children}) => (
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                {children}
              </tr>
            ),
            th: ({children}) => (
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontWeight: '600',
                borderRight: '1px solid #e5e7eb'
              }}>
                {children}
              </th>
            ),
            td: ({children}) => (
              <td style={{
                padding: '12px 16px',
                borderRight: '1px solid #e5e7eb'
              }}>
                {children}
              </td>
            ),
          }}
        >
          {article.content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
