/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { SignInButton, useUser } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Reply, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface CommentSectionProps {
  articleId: Id<"articles">;
}

type Comment = {
  _id: Id<"comments">;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  status: "visible" | "hidden" | "deleted";
  parentCommentId?: Id<"comments">;
  author?: {
    name: string;
    userId: string;
  };
};

export function CommentSection({ articleId }: CommentSectionProps) {
  const { user, isSignedIn } = useUser();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [editingId, setEditingId] = useState<Id<"comments"> | null>(null);
  const [editContent, setEditContent] = useState("");

  const comments = useQuery(api.comments.list, { 
    articleId,
    limit: 50 
  });
  const createComment = useMutation(api.comments.create);
  const updateComment = useMutation(api.comments.update);
  const deleteComment = useMutation(api.comments.remove);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !isSignedIn) return;
    
    try {
      setIsSubmitting(true);
      await createComment({
        articleId,
        content: content.trim(),
        parentCommentId: replyingTo?._id,
      });
      setContent("");
      setReplyingTo(null);
      toast({
        description: "Comment posted successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to post comment",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (commentId: Id<"comments">) => {
    if (!editContent.trim()) return;
    
    try {
      await updateComment({
        id: commentId,
        content: editContent.trim(),
      });
      setEditingId(null);
      setEditContent("");
      toast({
        description: "Comment updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to update comment",
      });
    }
  };

  const handleDelete = async (commentId: Id<"comments">) => {
    try {
      await deleteComment({
        id: commentId,
      });
      toast({
        description: "Comment deleted successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to delete comment",
      });
    }
  };

  const CommentComponent = ({ comment, level = 0 }: { comment: Comment; level?: number }) => {
    const isAuthor = user?.id === comment.authorId;
    const replies = comments?.filter(c => c.parentCommentId === comment._id);

    if (comment.status === "deleted") {
      return (
        <div className="p-4 rounded-lg bg-gray-50 opacity-60">
          <p className="text-gray-500 italic">This comment has been deleted</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div 
          className={`p-4 rounded-lg bg-card ${
            level > 0 ? 'ml-6 border-l-2 border-muted' : ''
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{comment.authorName}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                </span>
                {comment.parentCommentId && (
                  <span className="text-xs text-muted-foreground">
                    (reply)
                  </span>
                )}
              </div>

              {editingId === comment._id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleEdit(comment._id)}
                    >
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        setEditingId(null);
                        setEditContent("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm">{comment.content}</p>
              )}
            </div>

            {isSignedIn && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setReplyingTo(comment);
                      setContent(`@${comment.authorName} `);
                    }}
                  >
                    <Reply className="mr-2 h-4 w-4" />
                    Reply
                  </DropdownMenuItem>
                  {isAuthor && (
                    <>
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingId(comment._id);
                          setEditContent(comment.content);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(comment._id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {replies && replies.length > 0 && (
          <div className="space-y-2">
            {replies.map((reply) => (
              <CommentComponent 
                key={reply._id}
                comment={{
                  ...reply,
                  author: reply.author ? {
                    name: reply.author.name,
                    userId: reply.author.userId
                  } : undefined
                }}
                level={level + 1} 
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!comments) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Comments</h2>

      {isSignedIn ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              replyingTo 
                ? `Reply to ${replyingTo.authorName}...` 
                : "Add to the discussion..."
            }
            className="min-h-[100px]"
          />
          <div className="flex items-center gap-2">
            <Button 
              type="submit" 
              disabled={isSubmitting || !content.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : replyingTo ? (
                "Post Reply"
              ) : (
                "Post Comment"
              )}
            </Button>
            {replyingTo && (
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => {
                  setReplyingTo(null);
                  setContent("");
                }}
              >
                Cancel Reply
              </Button>
            )}
          </div>
        </form>
      ) : (
        <div className="text-center py-4 bg-muted rounded-lg">
          <p className="text-muted-foreground mb-4">
            Please sign in to join the discussion
          </p>
          <SignInButton mode="modal">
            <Button>Sign In</Button>
          </SignInButton>
        </div>
      )}

      <div className="space-y-4">
        {comments
          .filter(comment => !comment.parentCommentId)
          .map((comment) => (
            <CommentComponent 
              key={comment._id} 
              comment={{
                ...comment,
                author: comment.author ? {
                  name: comment.author.name,
                  userId: comment.author.userId
                } : undefined
              }} 
            />
          ))}
      </div>
    </div>
  );
}