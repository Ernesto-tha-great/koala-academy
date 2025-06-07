// app/api/scrape/route.ts
import { NextResponse } from "next/server";
import { articleParser } from "@/lib/article-parser";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL provided" },
        { status: 400 }
      );
    }

    const article = await articleParser.parse(url);
    return NextResponse.json(article);
  } catch (error) {
    console.error("Error scraping article:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to scrape article",
      },
      { status: 500 }
    );
  }
}
