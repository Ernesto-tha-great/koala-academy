"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CommentSectionProps {
  articleId: Id<"articles">;
}

export function CommentSection({ articleId }: CommentSectionProps) {
  const { user, isSignedIn } = useUser();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const comments = useQuery(api.comments.list, { articleId });
  const createComment = useMutation(api.comments.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !isSignedIn) return;

    try {
      setIsSubmitting(true);
      await createComment({
        articleId,
        content: content.trim(),
      });
      setContent("");
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-16 space-y-8">
      <h2 className="text-2xl font-bold">Comments</h2>

      {isSignedIn ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add to the discussion..."
            className="min-h-[100px]"
          />
          <Button type="submit" disabled={isSubmitting || !content.trim()}>
            {isSubmitting ? "Posting..." : "Post Comment"}
          </Button>
        </form>
      ) : (
        <p className="text-gray-600">
          Please sign in to join the discussion.
        </p>
      )}

      <div className="space-y-6">
        {comments?.map((comment) => (
          <div key={comment._id} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">{comment.authorName}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <p>{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
