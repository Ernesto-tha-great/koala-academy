import { api } from "../../convex/_generated/api";
import { convex } from "./convex";

export async function getBySlug(slug: string) {
  try {
    const article = await convex.query(api.articles.getBySlug, { slug });
    return article;
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
}

