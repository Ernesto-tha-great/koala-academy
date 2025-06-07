"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "convex/react";
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
import { Loader2, Eye, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "../../convex/_generated/api";
import ContentPreview from "./ContentPreview";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@clerk/nextjs";
import { Doc } from "../../convex/_generated/dataModel";

const formSchema = z
  .object({
    type: z.enum(["markdown"]),
    title: z.string().min(1, "Title is required").max(200),
    headerImage: z.string().optional(),
    excerpt: z.string().min(1, "Excerpt is required").max(500),
    content: z.string().min(1, "Content is required"),
    status: z.enum(["draft", "published"]),
    category: z.enum(["article", "guide", "morph"]),
    level: z.enum(["beginner", "intermediate", "advanced"]),
    tags: z.array(z.string()).min(1, "At least one tag is required"),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "markdown" && !data.content) {
        return false;
      }
      return true;
    },
    {
      message: "Content is required for markdown articles",
    }
  );

type FormData = z.infer<typeof formSchema>;

interface EditArticleFormProps {
  article: Doc<"articles">;
}

export function EditArticleForm({ article }: EditArticleFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const updateArticle = useMutation(api.articles.update);
  const { isSignedIn, isLoaded } = useUser();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<FormData | null>(null);

  // Convert existing article type to markdown if it's external/video (for compatibility)
  const compatibleType =
    article.type === "external" || article.type === "video"
      ? "markdown"
      : article.type;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: compatibleType,
      status: article.status === "published" ? "published" : "draft",
      category: article.category,
      level: article.level,
      title: article.title,
      headerImage: article.headerImage || "",
      excerpt: article.excerpt,
      content: article.content,
      tags: article.tags || [],
      seoTitle: article.seoTitle || "",
      seoDescription: article.seoDescription || "",
    },
    mode: "onChange",
  });

  const isSubmitting = form.formState.isSubmitting;
  const status = form.watch("status");

  function isValidUrl(string: string): boolean {
    if (!string || string.trim() === "") return false;
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  const onPreview = async (data: FormData) => {
    setPreviewData(data);
    setPreviewOpen(true);

    toast({
      title: "Preview Ready",
      description: "Review your changes before saving",
    });
  };

  const onSubmit = async (data: FormData) => {
    try {
      const updateData = {
        id: article._id,
        type: data.type,
        status: data.status,
        category: data.category,
        level: data.level,
        title: data.title,
        headerImage: data.headerImage || undefined,
        excerpt: data.excerpt,
        content: data.content,
        tags: data.tags,
        seoTitle: data.seoTitle || undefined,
        seoDescription: data.seoDescription || undefined,
      };

      await updateArticle(updateData);

      toast({
        title: "Success",
        description:
          data.status === "draft"
            ? "Article saved as draft successfully"
            : "Article updated and submitted for review",
      });

      router.push("/my-articles");
    } catch (error) {
      console.error("Failed to update article:", error);

      let errorMessage = "Failed to update article. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit(data);
  };

  const previewArticle = previewData
    ? {
        ...article,
        title: previewData.title,
        content: previewData.content,
        excerpt: previewData.excerpt,
        headerImage:
          previewData.headerImage && isValidUrl(previewData.headerImage)
            ? previewData.headerImage
            : undefined,
        tags: previewData.tags,
        category: previewData.category,
        level: previewData.level,
        type: previewData.type,
        status: "draft" as const,
        submissionStatus: undefined,
        slug: previewData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        readingTime: Math.ceil(
          (previewData.content?.split(/\s+/).length || 0) / 200
        ),
        seoTitle: previewData.seoTitle,
        seoDescription: previewData.seoDescription,
        author: null,
      }
    : null;

  const getStatusMessage = () => {
    if (article.submissionStatus === "needs_revision") {
      return (
        <Alert className="mb-6">
          <AlertDescription>
            <strong>Revision Required:</strong> This article was returned for
            revision. Make your changes and resubmit when ready.
          </AlertDescription>
        </Alert>
      );
    }
    if (article.submissionStatus === "pending") {
      return (
        <Alert className="mb-6">
          <AlertDescription>
            <strong>Under Review:</strong> This article is currently being
            reviewed. You can still make changes until it&apos;s approved.
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-8"
      >
        {getStatusMessage()}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Article Type</FormLabel>
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
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Save as Draft</SelectItem>
                    <SelectItem value="published">Submit for Review</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Drafts are private. Submitted articles go to admin review.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter article title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Excerpt</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description of your article"
                  className="h-20"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This will be displayed in article previews and search results.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="headerImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Header Image (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormDescription>
                URL to a header image for your article.
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
              <FormLabel>
                {article.type === "external" ? "Summary/Commentary" : "Content"}
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={
                    article.type === "external"
                      ? "Add your commentary or summary of the external article..."
                      : "Write your article content in Markdown..."
                  }
                  className="h-80"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {article.type === "external"
                  ? "Add your thoughts, summary, or commentary about the external article."
                  : "You can use Markdown formatting including headers, lists, code blocks, and links."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="guide">Guide</SelectItem>
                    <SelectItem value="morph">Morph</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty Level</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {field.value.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => {
                            const newTags = field.value.filter(
                              (_, i) => i !== index
                            );
                            field.onChange(newTags);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Type a tag and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const target = e.target as HTMLInputElement;
                        const newTag = target.value.trim();
                        if (newTag && !field.value.includes(newTag)) {
                          field.onChange([...field.value, newTag]);
                          target.value = "";
                        }
                      }
                    }}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Press Enter after typing each tag. Tags help categorize your
                content.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="seoTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SEO Title (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Custom title for search engines"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  If empty, the article title will be used.
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
                <FormLabel>SEO Description (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Custom description for search engines"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  If empty, the excerpt will be used.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                {status === "draft" ? "Updating Draft..." : "Submitting..."}
              </>
            ) : status === "draft" ? (
              "Update Draft"
            ) : (
              "Submit for Review"
            )}
          </Button>
        </div>

        {previewArticle && previewOpen && (
          <ContentPreview
            article={previewArticle}
            open={previewOpen}
            onOpenChange={setPreviewOpen}
          />
        )}
      </form>
    </Form>
  );
}
