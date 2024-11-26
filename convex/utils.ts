// convex/utils.ts
import { DatabaseReader } from "./_generated/server";

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export async function generateSlug(
  db: DatabaseReader,
  title: string,
  existingId?: string
): Promise<string> {
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  let isUnique = false;
  let counter = 0;
  let finalSlug = slug;

  while (!isUnique) {
    const existing = await db
      .query("articles")
      .withIndex("by_slug")
      .filter(q => q.eq(q.field("slug"), finalSlug))
      .first();

    if (!existing || (existingId && existing._id === existingId)) {
      isUnique = true;
    } else {
      counter++;
      finalSlug = `${slug}-${counter}`;
    }
  }

  return finalSlug;
}

export function sanitizeHtml(html: string): string {
  // Implement HTML sanitization logic
  // You might want to use a library like DOMPurify in the frontend
  return html;
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}