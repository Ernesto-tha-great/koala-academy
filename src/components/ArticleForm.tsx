"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/nextjs";
import ContentPreview from "@/components/ContentPreview";
import { Id } from "../../convex/_generated/dataModel";

const formSchema = z
  .object({
    type: z.enum(["markdown", "external", "video"]),
    title: z.string().min(1, "Title is required"),
    headerImage: z.string().optional(),
    excerpt: z
      .string()
      .min(1, "Excerpt is required")
      .max(300, "Excerpt must be less than 300 characters"),
    content: z.string().min(1, "Content is required"),
    category: z.enum(["article", "guide", "morph"]),
    level: z.enum(["beginner", "intermediate", "advanced"]),
    externalUrl: z.string().url().optional().or(z.literal("")),
    tags: z.array(z.string()).default([]),
    seoTitle: z.string().optional(),
    seoDescription: z
      .string()
      .max(160, "SEO description must be less than 160 characters")
      .optional(),
    status: z.enum(["draft", "published"]),
  })
  .refine(
    (data) => {
      if (data.type === "external" && !data.externalUrl) {
        return false;
      }
      if (data.type === "markdown" && !data.content) {
        return false;
      }
      return true;
    },
    {
      message: "Required fields missing for selected article type",
    }
  );

type FormData = z.infer<typeof formSchema>;

export function ArticleForm() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const createArticle = useMutation(api.articles.create);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewId, setPreviewId] = useState<string | undefined>();

  const previewArticle = useQuery(
    api.articles.getById,
    previewId ? { id: previewId as Id<"articles"> } : "skip"
  );

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "markdown",
      status: "draft",
      category: "article",
      level: "beginner",
      title: "",
      headerImage: "",
      excerpt: "",
      content: "",
      tags: [],
      seoTitle: "",
      seoDescription: "",
      externalUrl: "",
    },
    mode: "onChange",
  });

  const isSubmitting = form.formState.isSubmitting;
  const articleType = form.watch("type");
  const status = form.watch("status");

  const onPreview = async (data: FormData) => {
    try {
      const articleId = await createArticle({
        ...data,
        status: "draft",
        content: data.content || "",
        tags: data.tags,
        externalUrl: data.type === "external" ? data.externalUrl : undefined,
      });

      setPreviewId(articleId);
      setPreviewOpen(true);

      toast({
        title: "Success",
        description: "Draft saved successfully",
      });
    } catch (error) {
      console.error("Failed to save draft:", error);
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      await createArticle({
        ...data,
        content: data.content || "",
        tags: data.tags,
        externalUrl: data.type === "external" ? data.externalUrl : undefined,
      });

      toast({
        title: "Success",
        description:
          data.status === "draft"
            ? "Article saved as draft successfully"
            : "Article submitted for review successfully",
      });

      if (data.status === "published") {
        router.push("/my-articles");
      }
    } catch (error) {
      console.error("Failed to create article:", error);
      toast({
        title: "Error",
        description: "Failed to save article. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (data: FormData) => {
    if (status === "draft") {
      await onPreview(data);
    } else {
      await onSubmit(data);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Article Type *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select article type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="markdown">Markdown Article</SelectItem>
                    <SelectItem value="external">External Link</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose the type of content you want to submit
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="guide">Guide</SelectItem>
                    <SelectItem value="morph">Morph Docs</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose where this content will appear
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Difficulty Level *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Help readers understand the target audience
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Article Title *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter a compelling title for your article"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Make it clear, descriptive, and engaging
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {articleType === "external" && (
          <FormField
            control={form.control}
            name="externalUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>External URL *</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://example.com/your-article"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Link to your published article on another platform
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="headerImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Header Image (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://example.com/image.png"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A relevant image that represents your article
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Article Excerpt *</FormLabel>
              <FormControl>
                <Textarea
                  maxLength={300}
                  placeholder="Write a brief summary of your article (max 300 characters)"
                  className="h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This will be used for previews and search results
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Article Content *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write your article content in Markdown format..."
                  className="font-mono h-[400px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Use Markdown formatting for headers, links, code blocks, etc.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input
                  placeholder="react, typescript, nextjs, web development"
                  value={
                    Array.isArray(field.value)
                      ? field.value.join(", ")
                      : field.value
                  }
                  onChange={(e) =>
                    field.onChange(
                      e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean)
                    )
                  }
                />
              </FormControl>
              <FormDescription>
                Enter relevant tags separated by commas
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* SEO Fields */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">SEO (Optional)</h3>
          <FormField
            control={form.control}
            name="seoTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SEO Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Custom title for search engines (optional)"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Leave blank to use the article title
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="seoDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SEO Description</FormLabel>
                <FormControl>
                  <Textarea
                    maxLength={160}
                    placeholder="Custom description for search engines (optional)"
                    className="h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Leave blank to use the excerpt. Max 160 characters.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Publication Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Publication Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Save as Draft</SelectItem>
                  <SelectItem value="published">Submit for Review</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Drafts are saved privately. Submitted articles will be reviewed
                before publication.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Alert>
          <AlertDescription>
            By submitting this article, you confirm that it&apos;s your original
            work and you grant us permission to publish it on our platform.
          </AlertDescription>
        </Alert>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.handleSubmit(onPreview)()}
            disabled={
              isSubmitting ||
              !form.getValues("title") ||
              !form.getValues("excerpt") ||
              !form.getValues("content")
            }
            className="flex-1"
            size="lg"
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {status === "draft" ? "Saving Draft..." : "Submitting..."}
              </>
            ) : status === "draft" ? (
              "Save as Draft"
            ) : (
              "Submit for Review"
            )}
          </Button>
        </div>

        {previewArticle && previewOpen && (
          <ContentPreview
            article={{ ...previewArticle, author: null }}
            open={previewOpen}
            onOpenChange={setPreviewOpen}
          />
        )}
      </form>
    </Form>
  );
}
