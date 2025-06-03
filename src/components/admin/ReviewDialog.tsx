"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Id } from "../../../convex/_generated/dataModel";

const reviewSchema = z.object({
  action: z.enum(["approve", "reject", "request_revision"]),
  reviewNotes: z.string().optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface Article {
  _id: Id<"articles">;
  title: string;
  excerpt: string;
  category: string;
  authorId?: Id<"users">;
  guestAuthorName?: string;
  author?: { name: string };
  submittedAt: number;
  type: string;
  level: string;
}

interface ReviewDialogProps {
  article: Article;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReviewDialog({
  article,
  open,
  onOpenChange,
}: ReviewDialogProps) {
  const { toast } = useToast();
  const reviewSubmission = useMutation(api.articles.reviewSubmission);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      action: "approve",
      reviewNotes: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;
  const selectedAction = form.watch("action");

  const onSubmit = async (data: ReviewFormData) => {
    try {
      await reviewSubmission({
        id: article._id,
        action: data.action,
        reviewNotes: data.reviewNotes || undefined,
      });

      toast({
        title: "Review submitted",
        description: `Article has been ${data.action === "request_revision" ? "marked for revision" : data.action + "d"}.`,
      });

      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error reviewing article:", error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "approve":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "reject":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "request_revision":
        return <MessageSquare className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getActionDescription = (action: string) => {
    switch (action) {
      case "approve":
        return "This will publish the article immediately and notify the author.";
      case "reject":
        return "This will reject the article and archive it. The author will be notified.";
      case "request_revision":
        return "This will request changes from the author and keep the article in draft status.";
      default:
        return "";
    }
  };

  const authorName = article.authorId
    ? article.author?.name
    : article.guestAuthorName;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Review Article</DialogTitle>
          <DialogDescription>
            Review and provide feedback for this submission
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Article Summary */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold">{article.title}</h3>
                <p className="text-sm text-gray-600">
                  by {authorName || "Unknown"}
                  {!article.authorId && (
                    <Badge variant="outline" className="ml-2">
                      Guest
                    </Badge>
                  )}
                </p>
              </div>
              <Badge variant="outline">{article.category}</Badge>
            </div>

            <p className="text-sm text-gray-700">{article.excerpt}</p>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>
                Submitted: {new Date(article.submittedAt).toLocaleDateString()}
              </span>
              <span>•</span>
              <span>Type: {article.type}</span>
              <span>•</span>
              <span>Level: {article.level}</span>
            </div>
          </div>

          {/* Review Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="action"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review Decision</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an action" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="approve">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Approve & Publish
                          </div>
                        </SelectItem>
                        <SelectItem value="request_revision">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-yellow-600" />
                            Request Revision
                          </div>
                        </SelectItem>
                        <SelectItem value="reject">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            Reject
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedAction && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  {getActionIcon(selectedAction)}
                  <div className="text-sm text-blue-800">
                    {getActionDescription(selectedAction)}
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="reviewNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Review Notes
                      {selectedAction !== "approve" && (
                        <span className="text-red-500">*</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={
                          selectedAction === "approve"
                            ? "Optional feedback for the author..."
                            : selectedAction === "reject"
                              ? "Please explain why this article is being rejected..."
                              : "Please specify what changes are needed..."
                        }
                        className="h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    (selectedAction !== "approve" && !form.watch("reviewNotes"))
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      {getActionIcon(selectedAction)}
                      <span className="ml-2">
                        {selectedAction === "approve" && "Approve & Publish"}
                        {selectedAction === "reject" && "Reject Article"}
                        {selectedAction === "request_revision" &&
                          "Request Revision"}
                      </span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
