"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
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
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast"


const formSchema = z.object({
  type: z.enum(["markdown", "external", "video"]),
  status: z.enum(["draft", "published"]),
  title: z.string().min(1, "Title is required"),
  headerImage: z.string().optional(),
  excerpt: z.string()
    .min(1, "Excerpt is required")
    .max(300, "Excerpt must be less than 300 characters"),
  content: z.string().optional(),
  externalUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  tags: z.string().transform((str) => 
    str ? str.split(",").map((tag) => tag.trim()).filter(Boolean) : []
  ),
  seoTitle: z.string().optional(),
  seoDescription: z.string()
    .max(160, "SEO description must be less than 160 characters")
    .optional(),
}).refine((data) => {
  if (data.type === "markdown" && !data.content) {
    return false;
  }
  if (data.type === "external" && !data.externalUrl) {
    return false;
  }
  if (data.type === "video" && !data.videoUrl) {
    return false;
  }
  return true;
}, {
  message: "Required fields missing for selected article type"
});

type FormData = z.infer<typeof formSchema>;

export function ArticleForm() {
  const router = useRouter();
  const { toast } = useToast()
  const createArticle = useMutation(api.articles.create);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "markdown",
      status: "draft",
      title: "",
      headerImage: "",
      excerpt: "",
      content: "",
      tags: "",
      seoTitle: "",
      seoDescription: "",
    },
  });

  const articleType = form.watch("type");
  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: FormData) => {
    try {
      await createArticle({
        ...data,
        // Ensure content is empty if not markdown
        content: data.type === "markdown" ? data.content || "" : "",
        // Convert tags string to array (handled by zod transform)
        tags: data.tags,
        // Clean up optional fields
        externalUrl: data.type === "external" ? data.externalUrl : undefined,
        videoUrl: data.type === "video" ? data.videoUrl : undefined,
      });

      toast({
        title: "Success",
        description: data.status === "published" 
          ? "Article published successfully" 
          : "Draft saved successfully",
      });

      router.push("/admin");
    } catch (error) {
      console.error("Failed to create article:", error);
      toast({
        title: "Error",
        description: "Failed to create article. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Article Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select article type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="markdown">Markdown</SelectItem>
                    <SelectItem value="external">External Link</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }: { field: any }  ) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }: { field: any }    ) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter the article title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {articleType === "markdown" && (
          <FormField
            control={form.control}
            name="headerImage"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Header Image</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://example.com/image.png"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Excerpt</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Brief summary of the article"
                  className="h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A short summary of the article. Will be used for previews and SEO.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {articleType === "external" && (
          <FormField
            control={form.control}
            name="externalUrl"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>External URL</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {articleType === "video" && (
          <FormField
            control={form.control}
            name="videoUrl"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Video URL</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://youtube.com/..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {articleType === "markdown" && (
          <FormField
            control={form.control}
            name="content"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your markdown content here..."
                    className="font-mono h-[400px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="tags"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input
                  placeholder="react, typescript, nextjs"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter tags separated by commas
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="seoTitle"
            render={({ field }: { field: any }) => (
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
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>SEO Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Custom description for search engines (optional)"
                    className="h-[100px]"
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

        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {form.getValues("status") === "published" ? "Publishing..." : "Saving..."}
            </>
          ) : (
            form.getValues("status") === "published" ? "Publish Article" : "Save as Draft"
          )}
        </Button>
      </form>
    </Form>
  );
}