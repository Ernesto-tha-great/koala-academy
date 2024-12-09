import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
const { HTMLElement } = new JSDOM().window;

export interface ScrapedArticle {
  title: string;
  content: string;
  excerpt: string;
  headerImage?: string;
  tags: string[];
  canonicalUrl: string;
  author?: string;
  seoTitle?: string;
  seoDescription?: string;
  platform: string;
}

interface CodeBlockContext {
  precedingText: string;
  content: string;
  classNames: string[];
  parentContent?: string;
}

type LanguageConfig = {
  patterns: RegExp[];
  fileExtensions: string[];
  contextPatterns?: RegExp[];
};

export class ArticleParser {
  private turndownService: TurndownService;
  
  private languagePatterns: Record<string, LanguageConfig> = {
    solidity: {
      patterns: [
        /pragma solidity/,
        /contract\s+\w+/,
        /^\s*\/\/\s*SPDX-License-Identifier:/m,
        /interface\s+\w+\s*{/,
        /library\s+\w+/,
        /mapping\s*\(/
      ],
      fileExtensions: ['.sol'],
      contextPatterns: [
        /solidity|smart contract|ethereum|web3/i
      ]
    },
    typescript: {
      patterns: [
        /^import.*from/m,
        /interface\s+\w+/,
        /type\s+\w+\s*=/,
        /const\s+\w+:\s*\w+/,
        /class\s+\w+\s*(?:implements|extends)/,
        /async\s+function/
      ],
      fileExtensions: ['.ts', '.tsx'],
      contextPatterns: [
        /typescript|tsx?|type-safe/i
      ]
    },
    javascript: {
      patterns: [
        /^const\s+\w+\s*=/m,
        /function\s+\w+\s*\(/,
        /=>\s*{/,
        /new Promise/,
        /await\s+/,
        /\.then\(/
      ],
      fileExtensions: ['.js', '.jsx'],
      contextPatterns: [
        /javascript|js|node|react/i
      ]
    },
    bash: {
      patterns: [
        /^\s*(npm|yarn|pnpm|npx)\s+/m,
        /^\s*forge\s+/m,
        /^\s*\$\s*/m,
        /^\s*git\s+/m,
        /^\s*curl\s+/m,
        /^\s*wget\s+/m
      ],
      fileExtensions: ['.sh', '.bash'],
      contextPatterns: [
        /terminal|command line|shell|bash/i
      ]
    },
    html: {
      patterns: [
        /^<!DOCTYPE html>/i,
        /<html\b/,
        /<\/\w+>/,
        /<div\b/
      ],
      fileExtensions: ['.html', '.htm'],
      contextPatterns: [
        /html|markup|template/i
      ]
    },
    css: {
      patterns: [
        /^\s*\./m,
        /{\s*[\w-]+:/,
        /@media\s+/,
        /@keyframes\s+/
      ],
      fileExtensions: ['.css', '.scss', '.sass', '.less'],
      contextPatterns: [
        /css|style|scss|sass/i
      ]
    },
    json: {
      patterns: [
        /^{\s*"[\w-]+"\s*:/m,
        /^\[\s*{\s*"[\w-]+"\s*:/m
      ],
      fileExtensions: ['.json'],
      contextPatterns: [
        /json|configuration|config/i
      ]
    },
    yaml: {
      patterns: [
        /^[\w-]+:\s*/m,
        /^\s*-\s+[\w-]+:\s*/m
      ],
      fileExtensions: ['.yml', '.yaml'],
      contextPatterns: [
        /yaml|configuration|config/i
      ]
    },
    plaintext: {
      patterns: [
        /^[\w-]+$/,
        /^[A-Z_]+=/,
        /^[\w\/.-]+$/
      ],
      fileExtensions: ['.txt'],
      contextPatterns: [
        /plain text|text file|output/i
      ]
    }
  };

  constructor() {
    this.turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      hr: '---',
      bulletListMarker: '-'
    });

    this.setupTurndownRules();
  }

  private setupTurndownRules() {
    // Preserve line breaks in code blocks
    this.turndownService.addRule('preserveLineBreaks', {
      filter: 'pre',
      replacement: function(content) {
        return content.replace(/\n/g, '  \n');
      }
    });

    // Enhanced code block handling
    this.turndownService.addRule('fencedCodeBlock', {
      filter: (node, options) => {
        return (
          node.nodeName === 'PRE' ||
          (node.nodeName === 'CODE' && node.parentNode?.nodeName !== 'PRE')
        );
      },
      replacement: (content, node, options) => {
        const context: CodeBlockContext = {
          precedingText: this.getPrecedingText(node),
          content: this.cleanCodeContent(content),
          classNames: Array.from((node as any).classList || []),
          parentContent: node.parentNode?.textContent || ''
        };

        const language = this.detectLanguage(context);
        return `\n\`\`\`${language}\n${context.content}\n\`\`\`\n`;
      }
    });

    // Better image handling
    this.turndownService.addRule('images', {
      filter: 'img',
      replacement: function(content, node) {
        const img = node as HTMLImageElement;
        const alt = img.alt || '';
        const src = img.src || '';
        const title = img.title ? ` "${img.title}"` : '';
        return src ? `![${alt}](${src}${title})` : '';
      }
    });
  }

  private cleanCodeContent(content: string): string {
    return content
      .replace(/^\n+|\n+$/g, '') // Remove leading/trailing newlines
      .replace(/\t/g, '  ')      // Convert tabs to spaces
      .replace(/\n\s+\n/g, '\n\n') // Remove lines with only whitespace
      .trim();
  }

  private getPrecedingText(node: any, limit = 200): string {
    let current = node;
    let text = '';
    let depth = 0;
    const maxDepth = 3;

    while (current && depth < maxDepth && text.length < limit) {
      if (current.previousSibling) {
        text = (current.previousSibling.textContent || '') + text;
        current = current.previousSibling;
      } else {
        current = current.parentNode;
        depth++;
      }
    }

    return text.slice(-limit);
  }

  private detectLanguage(context: CodeBlockContext): string {
    const { precedingText, content, classNames } = context;

    // Check for explicit language classes first
    const classLanguage = classNames
      .find(c => c.startsWith('language-'))
      ?.replace('language-', '');
    if (classLanguage && classLanguage !== 'plaintext') {
      return classLanguage;
    }

    // Check for file extensions in content or preceding text
    const fileMatch = content.trim().match(/^.*\.(\w+)(?:\s+|$)/);
    if (fileMatch) {
      for (const [lang, config] of Object.entries(this.languagePatterns)) {
        if (config.fileExtensions.includes(`.${fileMatch[1].toLowerCase()}`)) {
          return lang;
        }
      }
    }

    // Check content against language patterns
    for (const [lang, config] of Object.entries(this.languagePatterns)) {
      // Skip plaintext initially
      if (lang === 'plaintext') continue;

      // Check code content patterns
      if (config.patterns.some(pattern => pattern.test(content))) {
        return lang;
      }

      // Check context patterns if available
      if (config.contextPatterns?.some(pattern => 
        pattern.test(precedingText) || pattern.test(context.parentContent || '')
      )) {
        return lang;
      }
    }

    // Special case for command line instructions
    if (content.includes('$') || content.includes('#') || 
        content.trim().split('\n').every(line => /^[\w-]+\s+/.test(line))) {
      return 'bash';
    }

    // Check if it's a simple path, environment variable, or single word
    if (this.languagePatterns.plaintext.patterns.some(pattern => pattern.test(content.trim()))) {
      return 'plaintext';
    }

    // Default to plaintext if nothing else matches
    return 'plaintext';
  }

  private async fetchPage(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BlogParser/1.0;)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch article: ${response.statusText}`);
    }

    return response.text();
  }

  public async parse(url: string): Promise<ScrapedArticle> {
    try {
      const html = await this.fetchPage(url);
      const dom = new JSDOM(html);
      const reader = new Readability(dom.window.document);
      const article = reader.parse();

      if (!article) {
        throw new Error('Failed to parse article content');
      }

      // Convert HTML to Markdown
      const markdown = this.turndownService.turndown(article.content);

      // Extract metadata
      const doc = dom.window.document;
      const headerImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');
      const tags = Array.from(doc.querySelectorAll('meta[property="article:tag"]'))
        .map(tag => tag.getAttribute('content'))
        .filter((tag): tag is string => Boolean(tag));

      return {
        title: article.title,
        content: markdown,
        excerpt: article.excerpt || article.title,
        headerImage: headerImage || undefined,
        tags,
        canonicalUrl: url,
        author: article.byline,
        seoTitle: doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || article.title,
        seoDescription: doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || article.excerpt,
        platform: new URL(url).hostname
      };
    } catch (error) {
      console.error('Error parsing article:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const articleParser = new ArticleParser();
