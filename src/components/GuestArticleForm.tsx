"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
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
import { Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z
  .object({
    type: z.enum(["markdown", "external"]),
    title: z.string().min(1, "Title is required"),
    headerImage: z.string().url().optional().or(z.literal("")),
    excerpt: z
      .string()
      .min(1, "Excerpt is required")
      .max(300, "Excerpt must be less than 300 characters"),
    content: z.string().min(1, "Content is required"),
    category: z.enum(["article", "guide", "morph"]),
    level: z.enum(["beginner", "intermediate", "advanced"]),
    externalUrl: z.string().url().optional().or(z.literal("")),
    tags: z.string().transform((str) =>
      str
        ? str
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : []
    ),
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
      return true;
    },
    {
      message: "External URL is required for external articles",
    }
  );

type FormData = z.infer<typeof formSchema>;

export function ArticleForm() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const submitArticle = useMutation(api.articles.create);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "markdown",
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
      status: "draft",
    },
    mode: "onChange",
  });

  const articleType = form.watch("type");
  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: FormData) => {
    try {
      await submitArticle({
        ...data,
        tags: Array.isArray(data.tags) ? data.tags : [],
        externalUrl: data.type === "external" ? data.externalUrl : undefined,
        headerImage: data.headerImage || undefined,
        seoTitle: data.seoTitle || undefined,
        seoDescription: data.seoDescription || undefined,
      });

      setSubmitted(true);
      toast({
        title: "Article submitted!",
        description:
          data.status === "published"
            ? "Your article has been published!"
            : "Your article has been submitted for review. We'll email you when it's published.",
      });
    } catch (error) {
      console.error("Error submitting article:", error);
      toast({
        title: "Error",
        description: "Failed to submit article. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (submitted) {
    return (
      <div className="text-center space-y-6 py-12">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-green-700">
            Article Submitted!
          </h2>
          <p className="text-gray-600 max-w-lg mx-auto">
            Thank you for your submission. Your article has been submitted for
            review.
          </p>
        </div>
        <Button
          onClick={() => {
            setSubmitted(false);
            form.reset();
          }}
          variant="outline"
        >
          Submit Another Article
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Article Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <SelectItem value="markdown">Markdown</SelectItem>
                    <SelectItem value="external">External Link</SelectItem>
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
                    <SelectItem value="morph">Morph Docs</SelectItem>
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
                <FormLabel>Level</FormLabel>
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
        </div>

        {/* Article Content */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Article Title *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter an engaging title for your article"
                  {...field}
                />
              </FormControl>
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
                  {...field}
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

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting Article...
            </>
          ) : form.watch("status") === "draft" ? (
            "Save Draft"
          ) : (
            "Submit Article for Review"
          )}
        </Button>
      </form>
    </Form>
  );
}
