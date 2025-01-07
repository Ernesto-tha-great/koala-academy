"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQuery } from "convex/react";
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
import { Loader2, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ContentPreview from "./ContentPreview";
import { Doc, Id } from "../../../convex/_generated/dataModel";

const formSchema = z.object({
  type: z.enum(["markdown", "external", "video"]),
  status: z.enum(["draft", "published"]),
  title: z.string().min(1, "Title is required"),
  headerImage: z.string().optional(),
  excerpt: z.string()
    .min(1, "Excerpt is required")
    .max(300, "Excerpt must be less than 300 characters"),
  content: z.string().optional(),
  category: z.enum(["article", "guide", "morph"]),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  externalUrl: z.string().url().optional(),
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
  return true;
}, {
  message: "Required fields missing for selected article type"
});

type FormData = z.infer<typeof formSchema>;

interface ScrapedArticle {
  title: string;
  content: string;
  excerpt: string;
  headerImage?: string;
  tags: string[];
  canonicalUrl: string;
  seoTitle?: string;
  seoDescription?: string;
}

interface ArticleFormProps {
  article?: Doc<"articles"> & {
    author?: { name: string } | null;
  };

  defaultValues: any; 
}



export function ArticleForm({ article }: ArticleFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const createArticle = useMutation(api.articles.create);
  const updateArticle = useMutation(api.articles.update);

  const [isImporting, setIsImporting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewId, setPreviewId] = useState<string | undefined>();
  const previewArticle = useQuery(api.articles.getById, 
    previewId ? { id: previewId as Id<"articles"> } : "skip"
  );
  const [importError, setImportError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: article?.type || "markdown",
      status: article?.status || "draft",
      category: article?.category || "article",
      level: article?.level || "beginner",
      title: article?.title || "",
      headerImage: article?.headerImage || "",
      excerpt: article?.excerpt || "",
      content: article?.content || "",
      // Convert array to comma-separated string for tags 
      tags: article?.tags || [],
      seoTitle: article?.seoTitle || "",
      seoDescription: article?.seoDescription || "",
      // Add these conditionally
      externalUrl: article?.type === "external" ? article.externalUrl : "",
    },
    mode: "onChange",
  });

  // Reset form when article changes
  useEffect(() => {
    if (article) {
      form.reset({
        type: article.type,
        status: article.status,
        category: article.category,
        level: article.level,
        title: article.title,
        headerImage: article.headerImage || "",
        excerpt: article.excerpt || "",
        content: article.content || "",
        tags: article.tags || [],
        seoTitle: article.seoTitle || "",
        seoDescription: article.seoDescription || "",
        externalUrl: article.type === "external" ? article.externalUrl : "",
      });
    }
  }, [article, form]);


  const articleType = form.watch("type");
  const isSubmitting = form.formState.isSubmitting;

  const handleImport = async (url: string) => {
    if (!url) return;
    
    try {
      setIsImporting(true);
      
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to import article');
      }
  
      const article = await response.json();
    
  
      // Update form fields with imported content
      form.setValue('title', article.title);
      form.setValue('content', article.content);
      form.setValue('excerpt', article.excerpt.slice(0, 280));
      form.setValue('tags', Array.isArray(article.tags) ? article.tags.join(', ') : '');
      form.setValue('externalUrl', article.canonicalUrl);
      
      if (article.headerImage) {
        form.setValue('headerImage', article.headerImage);
      }
      if (article.seoTitle) {
        form.setValue('seoTitle', article.seoTitle);
      }
      if (article.seoDescription) {
        form.setValue('seoDescription', article.seoDescription.slice(0, 160));
      }
  
      toast({
        title: "Article imported",
        description: "Content has been imported. You can now edit before saving.",
      });
    } catch (error) {
      console.error('Error importing article:', error);
      toast({
        title: "Import failed",
        description: "Failed to import article. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const onPreview = async (data: FormData) => {
    try {
      // If we already have a preview ID, don't create a new draft
      if (!previewId) {
        const newArticle = await createArticle({
          ...data,
          status: "draft",
          content: data.content || "",
          tags: data.tags,
          externalUrl: data.type === "external" ? data.externalUrl : undefined,
        });
        
        setPreviewId(newArticle);
        toast({
          title: "Success",
          description: "Draft saved successfully",
        });
      }

      setPreviewOpen(true);
    } catch (error) {
      console.error("Failed save draft:", error);
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (data: FormData) => {
    console.log("Form submitted with data:", data);
    const status = form.getValues("status");
    
    if (status === "draft") {
      await onPreview(data);
    } else {
      await onSubmit(data);
    }
  };
  

  const onSubmit = async (data: FormData) => {
    console.log("Starting onSubmit with data:"); // Debug log
    
    try {
      if (article) {
        console.log("Updating article", article._id, "with data:", data); // Debug log
        
        // Transform the data to match the mutation requirements
        const updateData = {
          id: article._id,
          type: data.type,
          status: data.status,
          category: data.category,
          level: data.level,
          title: data.title,
          headerImage: data.headerImage || undefined,
          excerpt: data.excerpt,
          content: data.content || "",
          tags: Array.isArray(data.tags) 
            ? data.tags
            : typeof data.tags === 'string' && data.tags
              ? (data.tags as string).split(",").map((tag: string) => tag.trim()).filter(Boolean)
              : [],
          seoTitle: data.seoTitle || undefined,
          seoDescription: data.seoDescription || undefined,
          externalUrl: data.type === "external" ? data.externalUrl : undefined,
        };

        console.log("Calling updateArticle with:", updateData); // Debug log
        
        const result = await updateArticle(updateData);
        console.log("Update result:", result); // Debug log

        toast({
          title: "Success",
          description: "Article updated successfully",
        });
        
        router.push("/admin/articles");
      } else {
        console.log("Creating new article"); // Debug log
        await createArticle({
          ...data,
          status: "published",
          content: data.content || "",
          tags: data.tags,
          externalUrl: data.type === "external" ? data.externalUrl : undefined,
        });
        toast({
          title: "Success",
          description: "Article published successfully",
        });
      }
    } catch (error) {
      console.error("Error in onSubmit:", error); // Detailed error logging
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save article. Please try again.",
        variant: "destructive",
      });
    }
  };


  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(handleFormSubmit)} 
        className="space-y-6 mt-4"
      >
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
                    {/* <SelectItem value="video">Video</SelectItem> */}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }: { field: any }) => (
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
                    <SelectItem value="published">Publish</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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

        <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <FormDescription>
                  Choose the level of this content
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

        <FormField
          control={form.control}
          name="title"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter the article title" {...field} />
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
                <FormLabel>External URL</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      {...field}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => field.value && handleImport(field.value)}
                    disabled={isImporting || !field.value}
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Link2 className="mr-2 h-4 w-4" />
                        Import
                      </>
                    )}
                  </Button>
                </div>
                <FormDescription>
                  Paste a URL to import content from an external article
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {importError && (
          <Alert variant="destructive">
            <AlertDescription>{importError}</AlertDescription>
          </Alert>
        )}

        {articleType === "markdown" || articleType === "external" && (
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
                  maxLength={280}
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


        {articleType === "markdown" || articleType === "external" && (
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
                    maxLength={160}
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

        {form.getValues("status") === "draft" ? (
                 <Button 
                 type="submit"
                   disabled={isSubmitting} 
                   className="w-full bg-[#0f603c]"
                 >
                   {isSubmitting ? (
                     <>
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                       Previewing...
                     </>
                   ) : (
                     "Preview Article"
                  )}
                 </Button>
        ) : (
            <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
               "Publish Article"
            )}
          </Button>
        )}


        {/* {   previewArticle && previewOpen && (
          <ContentPreview 
            article={{...previewArticle} as Doc<"articles">} 
            open={previewOpen} 
            onOpenChange={setPreviewOpen}
          />
        )} */}

        {/* Add debug info */}
        {/* <div className="mt-4 p-4 bg-gray-100 rounded">
          <p>Form State:</p>
          <pre>{JSON.stringify(form.formState, null, 2)}</pre>
        </div> */}

      </form>
    </Form>
  );
}