/* eslint-disable @typescript-eslint/no-explicit-any */
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

function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [inputValue, setInputValue] = useState("");

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag)) {
      onChange([...value, trimmedTag]);
    }
    setInputValue("");
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.includes(",")) {
      const tags = newValue.split(",");
      const lastTag = tags.pop() || "";
      tags.forEach((tag) => addTag(tag));
      setInputValue(lastTag);
    } else {
      setInputValue(newValue);
    }
  };

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
    </div>
  );
}

export function ArticleForm() {
  const { toast } = useToast();
  const router = useRouter();
  const createArticle = useMutation(api.articles.create);
  const { isSignedIn, isLoaded } = useUser();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<FormData | null>(null);

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
    },
    mode: "onChange",
  });

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Authentication Required
        </h2>
        <p className="text-gray-600">
          You need to be signed in to submit articles.
        </p>
        <Button onClick={() => window.location.reload()}>Refresh Page</Button>
      </div>
    );
  }

  const isSubmitting = form.formState.isSubmitting;
  const status = form.watch("status");

  const onPreview = async (data: FormData) => {
    setPreviewData(data);
    setPreviewOpen(true);

    toast({
      title: "Preview Ready",
      description: "Review your article before submitting",
    });
  };

  const onSubmit = async (data: FormData) => {
    try {
      await createArticle({
        ...data,
        content: data.content || "",
        tags: data.tags,
      });

      toast({
        title: "Success",
        description:
          data.status === "draft"
            ? "Article saved as draft successfully"
            : "Article submitted for review successfully",
      });

      router.push("/my-articles");
    } catch (error) {
      console.error("Failed to create article:", error);

      let errorMessage = "Failed to create article. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error && "message" in error) {
        errorMessage = error.message as string;
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
        _id: "preview" as any,
        _creationTime: Date.now(),
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
        authorId: "preview",
        publishedAt: undefined,
        views: 0,
        likes: 0,
        lastModified: Date.now(),
      }
    : null;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
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
                      <SelectValue placeholder="Select type" />
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
                      <SelectValue placeholder="Select category" />
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <SelectValue placeholder="Select level" />
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

          <FormField
            control={form.control}
            name="headerImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Header Image URL (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    {...field}
                  />
                </FormControl>
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
                  placeholder="Brief description of your article (used for previews and SEO)"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This will be shown in article previews and search results
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
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write your article content in Markdown format"
                  className="min-h-[400px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Use Markdown formatting for headings, links, code blocks, etc.
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
                <TagInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Add tags (press Enter or comma to separate)"
                />
              </FormControl>
              <FormDescription>
                Add relevant tags to help readers find your article
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
                  If not provided, the article title will be used
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
                  If not provided, the excerpt will be used
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
            article={previewArticle}
            open={previewOpen}
            onOpenChange={setPreviewOpen}
          />
        )}
      </form>
    </Form>
  );
}

function isValidUrl(string: string): boolean {
  if (!string || string.trim() === "") return false;
  try {
    new URL(string);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}
