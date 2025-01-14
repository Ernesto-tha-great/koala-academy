/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
const { HTMLElement, Node } = new JSDOM().window;

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
  private readonly IMAGE_MARKER_PREFIX = '__SCHLUMBURGER_IMAGE_';
  private sourceUrl: string | null = null;

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

    // Fix code block detection
    this.turndownService.addRule('fencedCodeBlock', {
      filter: (node: Element): boolean => {
        // Only match actual code blocks, not the entire article
        return (
          (node.nodeName === 'PRE' && node.querySelector('code') !== null) ||
          (node instanceof HTMLElement &&
           node.classList.contains('code-block') && 
           node.querySelector('code') !== null)
        );
      },
      replacement: (content: string, node: Node) => {
        const codeNode = (node as Element).querySelector('code') || node;
        let codeContent = codeNode.textContent || content;
        
        // Clean the content
        codeContent = this.cleanCodeContent(codeContent);
        
        // Detect language
        const language = this.detectCodeLanguage(node as Element);
        return `\n\n\`\`\`${language}\n${codeContent}\n\`\`\`\n\n`;
      }
    });

    // Fix image handling
    this.turndownService.addRule('images', {
      filter: ['img', 'picture'],
      replacement: (content: string, node: Node) => {
        // Handle both direct img tags and picture elements
        const img = node.nodeName === 'IMG' ? 
          node as HTMLImageElement : 
          (node as Element).querySelector('img');
        
        if (!img) return '';

        // Get image source with fallbacks
        const src = this.getImageSource(img as HTMLImageElement);
        if (!src) return '';
        // Clean and optimize the URL
        const alt = img.getAttribute('alt') || '';

        // Add extra newlines for better spacing
        return `\n\n![${alt}](${src})\n\n`;
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

    // Ghost-specific code block handling
    this.turndownService.addRule('ghostCodeBlock', {
      filter: (node: Element) => {
        return (
          node instanceof HTMLElement && 
          node.nodeName === 'DIV' && 
          (node.classList.contains('gh-code-block') || 
           node.classList.contains('kg-code-card'))
        );
      },
      // @ts-expect-error - dont worry about it
      replacement: (content: string, node: Element) => {
        const codeNode = node.querySelector('pre, code');
        const codeContent = this.cleanCodeContent(codeNode?.textContent || content);
        
        // Try to get language from Ghost's class
        const classes = node instanceof HTMLElement ? Array.from(node.classList) : [];
        const languageClass = classes.find(c => c.startsWith('language-'));
        const language = languageClass ? 
          languageClass.replace('language-', '') : 
          this.detectLanguage({
            precedingText: this.getPrecedingText(node),
            content: codeContent,
            classNames: classes,
            parentContent: node.parentNode?.textContent || ''
          });

        return `\n\n\`\`\`${language}\n${codeContent}\n\`\`\`\n\n`;
      }
    });

    // Fix inline code formatting
    this.turndownService.addRule('inlineCode', {
      filter: (node: Element) => {
        return (
          node.nodeName === 'CODE' && 
          (!node.parentNode || node.parentNode.nodeName !== 'PRE')
        );
      },
      replacement: (content: string) => {
        // Clean inline code content
        const cleaned = content
          .replace(/`/g, '\\`') // Escape backticks
          .replace(/\n/g, ' ')  // Replace newlines with spaces
          .trim();
        return `\`${cleaned}\``;
      }
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

  private extractImages(container: Element): Array<{src: string, alt: string, marker: string}> {
    const images = Array.from(container.querySelectorAll('img, picture img'))
      .map((img, index) => {
        const imgElement = img as HTMLImageElement;
        const src = this.getImageSource(imgElement);
        
        // Skip invalid images
        if (!src || !this.isValidContentImage({ src, container: img.closest('figure, div, p') })) {
          return null;
        }

        const optimizedSrc = this.optimizeImageUrl(src);
        return {
          src: optimizedSrc,
          alt: imgElement.alt || '',
          marker: `${this.IMAGE_MARKER_PREFIX}POS_${index}__`
        };
      })
      .filter((img): img is NonNullable<typeof img> => img !== null);

    // Replace images with markers in the content
    images.forEach(({marker, src}) => {
      const imgElement = container.querySelector(`img[src="${src}"]`);
      if (imgElement) {
        const markerSpan = container.ownerDocument!.createElement('span');
        markerSpan.textContent = marker;
        const imageContainer = imgElement.closest('figure, picture') || imgElement;
        imageContainer.parentNode?.replaceChild(markerSpan, imageContainer);
      }
    });

    return images;
  }

  private getImageSource(img: HTMLImageElement): string {
    return (
      img.getAttribute('src') ||
      img.getAttribute('data-src') ||
      img.getAttribute('srcset')?.split(' ')[0] ||
      img.closest('picture')?.querySelector('source')?.getAttribute('srcset') ||
      ''
    );
  }

  private detectCodeLanguage(node: Element): string {
    // Check for explicit language class
    const classes = Array.from(node.classList || [])
      .concat(Array.from(node.querySelector('code')?.classList || []));
    
    const languageClass = classes.find(c => c.startsWith('language-'));
    if (languageClass) {
      return languageClass.replace('language-', '');
    }

    // Fallback to content analysis
    const content = node.textContent || '';
    const context: CodeBlockContext = {
      precedingText: this.getPrecedingText(node),
      content: content,
      classNames: classes,
      parentContent: node.parentNode?.textContent || ''
    };

    return this.detectLanguage(context);
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

  private reconstructContent(article: any, originalImages: Array<{src: string, alt: string, marker: string}>) {
    let content = article.content;
  
    // Sort images by their position number to maintain order
    const sortedImages = [...originalImages].sort((a, b) => {
      const posA = parseInt(a.marker.match(/POS_(\d+)__/)?.[1] || '0');
      const posB = parseInt(b.marker.match(/POS_(\d+)__/)?.[1] || '0');
      return posA - posB;
    });
  
    // Replace markers with images
    sortedImages.forEach(img => {
      const imageHtml = `<figure><img src="${img.src}" alt="${img.alt}" /></figure>`;
      content = content.replace(img.marker, imageHtml);
    });
  
    return content;
  }

  private isElementAfter(referenceElement: Element, targetElement: Element): boolean {
    return !!(referenceElement.compareDocumentPosition(targetElement) & Node.DOCUMENT_POSITION_FOLLOWING);
  }

  private verifyMarkdownImages(markdown: string, originalImages: Array<{src: string}>): void {
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
    this.sourceUrl = url;
    try {
      const html = await this.fetchPage(url);
      const dom = new JSDOM(html);
      const document = dom.window.document;

      // Ghost-specific content selectors
      const articleContent = document.querySelector('.gh-content') || 
                           document.querySelector('.article-content') || 
                           document.querySelector('article') || 
                           document.body;
      
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
      
      // Convert HTML to Markdown
      const markdown = this.turndownService.turndown(enhancedContent);

      // Verify images were preserved
      this.verifyMarkdownImages(markdown, originalImages);

      // Determine platform
      const platform = url.includes('ghost.io') ? 'ghost' : 'medium.com';

      return {
        title: article.title,
        content: markdown,
        excerpt: article.excerpt || article.title,
        headerImage: this.findGhostHeaderImage(document, originalImages),
        tags: this.extractGhostTags(document),
        canonicalUrl: url,
        author: this.findGhostAuthor(document) || article.byline,
        seoTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || article.title,
        seoDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content') || article.excerpt,
        platform
      };
    } catch (error) {
      console.error('Error parsing article:', error);
      throw error;
    }
  }

  private findGhostHeaderImage(document: Document, images: any[]): string | undefined {
    // Ghost-specific header image selectors
    const ghostFeatureImage = document.querySelector('.gh-feature-image')?.getAttribute('src') ||
                            document.querySelector('.article-image img')?.getAttribute('src');
    if (ghostFeatureImage) return this.optimizeImageUrl(ghostFeatureImage);

    // Fallback to OG image
    const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
    if (ogImage) return this.optimizeImageUrl(ogImage);

    // Last resort: first content image
    return images[0]?.src;
  }

  private extractGhostTags(document: Document): string[] {
    const tags = new Set<string>();
    
    // Ghost-specific tag selectors
    document.querySelectorAll('.gh-article-tag, .post-tag').forEach(tag => {
      const content = tag.textContent?.trim();
      if (content) tags.add(content);
    });

    // Fallback to meta tags
    document.querySelectorAll('meta[property="article:tag"]').forEach(tag => {
      const content = tag.getAttribute('content');
      if (content) tags.add(content);
    });

    return Array.from(tags);
  }

  private findGhostAuthor(document: Document): string | undefined {
    // Ghost-specific author selectors
    const authorElement = document.querySelector('.gh-author-name') || 
                         document.querySelector('.author-name');
    return authorElement?.textContent?.trim();
  }

  private optimizeImageUrl(url: string): string {
    if (!url) return '';

    try {
      // Handle relative URLs
      if (url.startsWith('/') && this.sourceUrl) {
        const baseUrl = new URL(this.sourceUrl).origin;
        url = `${baseUrl}${url}`;
      }

      const urlObj = new URL(url);

      // Google Docs image handling
      if (urlObj.hostname.includes('googleusercontent.com')) {
        // Remove any size restrictions and get full resolution
        return url.split('=')[0] + '=s0';
      }

      // Ghost image handling
      if (urlObj.hostname.includes('ghost.io')) {
        // Remove size parameters for full resolution
        return url.replace(/\/size\/\w+/, '');
      }

      // Medium image handling
      if (url.includes('miro.medium.com')) {
        return url.replace(/\/max\/\d+/, '/max/3840')  // Get highest resolution
                 .replace(/\/quality\/\d+/, '/quality/100');
      }

      // General CDN optimizations
      if (url.includes('cloudinary.com')) {
        return url.replace(/\/w_\d+/, '/w_3840')
                 .replace(/\/q_\d+/, '/q_100');
      }

      if (url.includes('imgix.net')) {
        urlObj.searchParams.set('w', '3840');
        urlObj.searchParams.set('q', '100');
        return urlObj.toString();
      }

      return url;
    } catch (error) {
      console.warn('Error optimizing image URL:', error);
      return url; // Return original URL if optimization fails
    }
  }
}

// Export a singleton instance
export const articleParser = new ArticleParser();