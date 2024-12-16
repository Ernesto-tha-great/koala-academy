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

    // Enhanced image handling
    this.turndownService.addRule('images', {
        filter: ['img', 'picture', 'source'],
        replacement: (content, node) => {
          const img = node as HTMLImageElement;
          const src = this.getImageSource(img);
          const alt = img.getAttribute('alt') || '';
          
          if (this.isValidContentImage({ src, container: img.parentElement })) {
            // Add debug logging
            console.log(`Converting image: ${src}`);
            return `\n\n![${alt}](${src})\n\n`;
          }
          
          return '';
        }
      });
    

    // Add a specific rule for dev.to image handling
    this.turndownService.addRule('devToImages', {
      filter: (node) => {
        return (
          node.nodeName === 'IMG' &&
          (node as HTMLElement).getAttribute('src')?.includes('dev-to-uploads.s3.amazonaws.com') || false
        );
      },
      replacement: function(content, node) {
        const img = node as HTMLImageElement;
        const src = img.getAttribute('src');
        const alt = img.getAttribute('alt') || '';
        
        if (src) {
          // Clean up dev.to specific URL parameters
          const cleanSrc = src
            .replace(/\/width=\d+%2C/, '/')
            .replace(/height=\d+%2C/, '')
            .replace(/fit=scale-down%2C/, '')
            .replace(/gravity=auto%2C/, '')
            .replace(/format=auto/, '');
            
          return `\n\n![${alt}](${cleanSrc})\n\n`;
        }
        
        return '';
      }
    });

    // Add debug logging to track image processing
    const originalTurndown = this.turndownService.turndown.bind(this.turndownService);
    this.turndownService.turndown = (html: string) => {
      console.log('Processing HTML:', html.substring(0, 200) + '...');
      const markdown = originalTurndown(html);
      console.log('Generated Markdown:', markdown.substring(0, 200) + '...');
      return markdown;
    };

    // Enhanced code block handling
    this.turndownService.addRule('fencedCodeBlock', {
        filter: (node) => {
          if (node.nodeName !== 'PRE') return false;
          
          // Check if content starts with ``` or is within a pre tag
          const content = node.textContent || '';
          return content.startsWith('```') || node.nodeName === 'PRE';
        },
        replacement: (content, node) => {
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

      

    // Inline code handling
    this.turndownService.addRule('inlineCode', {
        filter: (node) => 
          node.nodeName === 'CODE' && 
          (!node.parentNode || node.parentNode.nodeName !== 'PRE'),
        replacement: (content) => `\`${content}\``
      });

      this.turndownService.addRule('pictureElements', {
        filter: 'picture',
        replacement: function(content, node) {
          const img = node.querySelector('img');
          if (!img) return '';
    
          const src = img.getAttribute('src') || 
                     img.getAttribute('data-src') || 
                     node.querySelector('source')?.getAttribute('srcset') || '';
          const alt = img.getAttribute('alt') || '';
    
          return src ? `\n\n![${alt}](${src})\n\n` : '';
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

  private extractImages(container: Element): Array<{src: string, alt: string}> {
    return Array.from(container.querySelectorAll('img, figure img'))
      .map(img => {
        // Check all possible image source attributes
        const src = this.getImageSource(img as HTMLImageElement);
        return {
          src,
          alt: (img as HTMLImageElement).alt || '',
          container: img.closest('figure, div, p')
        };
      })
      .filter(img => this.isValidContentImage(img));
  }

  private getImageSource(img: HTMLImageElement): string {
    const possibleSources = [
      img.src,
      img.getAttribute('data-src'),
      img.getAttribute('data-delayed-url'),
      img.getAttribute('data-original-src'),
      img.getAttribute('srcset')?.split(' ')[0],
      img.closest('picture')?.querySelector('source')?.getAttribute('srcset')?.split(' ')[0]
    ];
    
    return possibleSources.find(src => src && src.length > 0) || '';
  }


  private isValidContentImage(img: { src: string, container: Element | null }): boolean {
    if (!img.src) return false;
    
    // Skip tracking pixels, avatars, and tiny images
    const invalidPatterns = [
      /tracking/i,
      /pixel/i,
      /profile-/i,
      /avatar/i
    ];
    
    const isInvalid = invalidPatterns.some(pattern => pattern.test(img.src));
    const isProfileImage = img.container?.classList.contains('profile') ||
                         img.container?.classList.contains('avatar');
                         
    return !isInvalid && !isProfileImage;
  }

  private reconstructContent(article: any, originalImages: Array<{src: string, alt: string}>) {
    let content = article.content;
    const paragraphs = content.split('</p>');
    
    originalImages.forEach((img, index) => {
      // Insert after every few paragraphs to maintain original content flow
      const position = Math.min(index * 2, paragraphs.length - 1);
      const imageHtml = `<figure><img src="${img.src}" alt="${img.alt}" /></figure>`;
      paragraphs[position] = `${paragraphs[position]}</p>${imageHtml}`;
    });
    
    return paragraphs.join('');
  }

  private verifyMarkdownImages(markdown: string, originalImages: Array<{src: string}>) {
    const markdownImages = markdown.match(/!\[.*?\]\(.*?\)/g) || [];
    console.log(`Original images: ${originalImages.length}`);
    console.log(`Markdown images: ${markdownImages.length}`);
    
    if (markdownImages.length < originalImages.length) {
      console.warn('Some images were lost during conversion');
      // Log missing images
      originalImages.forEach(img => {
        if (!markdownImages.some(md => md.includes(img.src))) {
          console.warn(`Missing image: ${img.src}`);
        }
      });
    }
  }


  public async parse(url: string): Promise<ScrapedArticle> {
    try {
      const html = await this.fetchPage(url);
      const dom = new JSDOM(html);
      const document = dom.window.document;

      // Special handling for Medium articles
      const isMedium = url.includes('medium.com');
      
      // Find the main article content first
      const articleContent = document.querySelector('article') || document.body;
      
      // Store all content images before Readability processing
      const originalImages = this.extractImages(articleContent);

      console.log('Found content images:', originalImages);

      // Process with Readability
      const reader = new Readability(document);
      const article = reader.parse();

      if (!article) {
        throw new Error('Failed to parse article content');
      }

         // Reconstruct content with preserved images
         const enhancedContent = this.reconstructContent(article, originalImages);
      

      // Convert HTML to Markdown with enhanced image handling
      const markdown = this.turndownService.turndown(enhancedContent);


      
      // Verify images were preserved
      this.verifyMarkdownImages(markdown, originalImages);
      console.log(`Markdown contains ${originalImages.length} images`);

      return {
        title: article.title,
        content: markdown,
        excerpt: article.excerpt || article.title,
        headerImage: this.findHeaderImage(document, originalImages),
        tags: this.extractTags(document),
        canonicalUrl: url,
        author: article.byline,
        seoTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || article.title,
        seoDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content') || article.excerpt,
        platform: 'medium.com'
      };
    } catch (error) {
      console.error('Error parsing article:', error);
      throw error;
    }
  }

  
  private getImageCaption(img: Element): string {
    const figure = img.closest('figure');
    if (!figure) return '';

    // Try different caption elements
    const caption = figure.querySelector('figcaption') || 
                   figure.querySelector('[data-selectable-paragraph]') ||
                   figure.querySelector('.caption');
                   
    return caption ? caption.textContent?.trim() || '' : '';
  }

  private findHeaderImage(document: Document, images: any[]): string | undefined {
    // Try OG image first
    const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
    if (ogImage) return ogImage;

    // Fall back to first large content image
    return images[0]?.src;
  }

  private extractTags(document: Document): string[] {
    // Combine tags from multiple possible sources
    const tags = new Set<string>();
    
    // Meta tags
    document.querySelectorAll('meta[property="article:tag"]').forEach(tag => {
      const content = tag.getAttribute('content');
      if (content) tags.add(content);
    });

    // Medium specific tags
    document.querySelectorAll('a[data-tag]').forEach(tag => {
      const content = tag.textContent;
      if (content) tags.add(content);
    });

    return Array.from(tags);
  }
}

// Export a singleton instance
export const articleParser = new ArticleParser();
