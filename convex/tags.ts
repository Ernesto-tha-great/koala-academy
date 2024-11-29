import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./auth";
import { ConvexError } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    // Check if tag already exists
    const existing = await ctx.db
      .query("tags")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (existing) {
      throw new ConvexError("Tag already exists");
    }

    const slug = args.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const tag = await ctx.db.insert("tags", {
      name: args.name,
      slug,
      description: args.description,
      articleCount: 0,
    });

    return tag;
  },
});

export const list = query({
  args: {
    limit: v.optional(v.number()),
    includeEmpty: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("tags");
    
    // Only show tags with articles unless specifically requested
    if (!args.includeEmpty) {
      query = query.filter((q) => q.gt(q.field("articleCount"), 0));
    }
    return await query
      .order("desc")
      .take(args.limit ?? 50);
  },
});

export const update = mutation({
  args: {
    id: v.id("tags"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new ConvexError("Tag not found");
    }

    // Check if new name conflicts with another tag
    if (args.name !== existing.name) {
      const nameConflict = await ctx.db
        .query("tags")
        .filter((q) => q.eq(q.field("name"), args.name))
        .first();

      if (nameConflict) {
        throw new ConvexError("Tag name already exists");
      }
    }

    const slug = args.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    return await ctx.db.patch(args.id, {
      name: args.name,
      slug,
      description: args.description,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("tags") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const tag = await ctx.db.get(args.id);
    if (!tag) {
      throw new ConvexError("Tag not found");
    }

    // Check if tag is still in use
    if (tag.articleCount > 0) {
      throw new ConvexError("Cannot delete tag that is still in use");
    }

    await ctx.db.delete(args.id);
  },
});

// export const updateCount = mutation({
//   args: { id: v.id("tags") },
//   handler: async (ctx, args) => {
//     const tag = await ctx.db.get(args.id);
//     if (!tag) {
//       throw new ConvexError("Tag not found");
//     }

//     // Count articles with this tag
//     const articles = await ctx.db
//       .query("articles")
//       .withIndex("by_tags")
//       .filter((q) => q.eq(q.field("tags"), tag.name))
//       .collect();

//     await ctx.db.patch(args.id, {
//       articleCount: articles.length,
//     });
//   },
// });

export const getPopular = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tags")
      .filter((q) => q.gt(q.field("articleCount"), 0))
      .order("desc")
      .take(args.limit ?? 10);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tags")
      .filter((q) => q.eq(q.field("slug"), args.slug))
      .first();
  },
});