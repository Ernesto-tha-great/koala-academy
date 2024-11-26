  import { defineSchema, defineTable } from 'convex/server';
  import { v } from 'convex/values';
  
  export default defineSchema({
    articles: defineTable({
      slug: v.string(),
      title: v.string(),
      content: v.string(),
      excerpt: v.optional(v.string()),
      coverImage: v.optional(v.string()),
      type: v.union(v.literal('markdown'), v.literal('external'), v.literal('video')),
      externalUrl: v.optional(v.string()),
      videoUrl: v.optional(v.string()),
      authorId: v.string(),
      publishedAt: v.string(),
      tags: v.array(v.string()),
      likes: v.number(),
      readTime: v.number(),
    })
    
    .index("by_slug", ["slug"])
    .index("by_author", ["authorId"])
    ,
  
    comments: defineTable({
      articleId: v.id('articles'),
      content: v.string(),
      authorId: v.string(),
      createdAt: v.number(),
    })
    .index("by_article", ["articleId"]),
  
    likes: defineTable({
      articleId: v.id('articles'),
      userId: v.string(),
      createdAt: v.string(),
    })
    .index("by_article", ["articleId"])
    .index("by_user", ["userId"]),
  });
