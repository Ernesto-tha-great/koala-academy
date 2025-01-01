import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
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

export async function getById(id: Id<"articles">) {
  try {
    const article = await convex.query(api.articles.getById, { id });
    return article;
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
}

