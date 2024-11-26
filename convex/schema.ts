// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  articles: defineTable({
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    excerpt: v.string(), // For preview/SEO
    type: v.union(v.literal("markdown"), v.literal("external"), v.literal("video")),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
    externalUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    authorId: v.string(),
    publishedAt: v.optional(v.number()),
    tags: v.array(v.string()),
    likes: v.number(),
    views: v.number(),
    readingTime: v.number(),
    seoDescription: v.optional(v.string()),
    seoTitle: v.optional(v.string()),
    lastModified: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_author", ["authorId"])
    .index("by_status_and_date", ["status", "publishedAt"])
    .index("by_tags", ["tags"])
    .searchIndex("search", {
      searchField: "title",
      filterFields: ["status"]
    }),

  comments: defineTable({
    articleId: v.id("articles"),
    content: v.string(),
    authorId: v.string(),
    authorName: v.string(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    status: v.union(v.literal("visible"), v.literal("hidden"), v.literal("deleted")),
    parentCommentId: v.optional(v.id("comments")), // For nested comments
  })
    .index("by_article", ["articleId", "status", "createdAt"])
    .index("by_author", ["authorId", "createdAt"]),

  likes: defineTable({
    articleId: v.id("articles"),
    userId: v.string(),
    createdAt: v.number(),
  })
    .index("by_user_and_article", ["userId", "articleId"])
    .index("by_article", ["articleId"]),

  tags: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    articleCount: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_name", ["name"]),

  users: defineTable({
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("author"), v.literal("user")),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    lastLogin: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  audit_logs: defineTable({
    action: v.string(),
    userId: v.string(),
    resourceType: v.string(),
    resourceId: v.string(),
    timestamp: v.number(),
    details: v.string(),
  }).index("by_timestamp", ["timestamp"]),
});