"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  MessageSquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Id } from "../../../convex/_generated/dataModel";

type SubmissionStatus = "pending" | "approved" | "rejected" | "needs_revision";

interface Article {
  _id: Id<"articles">;
  title: string;
  submissionStatus?: SubmissionStatus;
  category: string;
  submittedAt?: number;
  reviewedAt?: number;
  authorId?: string;
  guestAuthorName?: string;
  author?: { name: string; email: string; userId: string; role: string } | null;
}

function getStatusVariant(status: SubmissionStatus) {
  switch (status) {
    case "pending":
      return "secondary";
    case "approved":
      return "default";
    case "rejected":
      return "destructive";
    case "needs_revision":
      return "outline";
    default:
      return "secondary";
  }
}

function getStatusIcon(status: SubmissionStatus) {
  switch (status) {
    case "pending":
      return <Clock className="h-3 w-3" />;
    case "approved":
      return <CheckCircle className="h-3 w-3" />;
    case "rejected":
      return <XCircle className="h-3 w-3" />;
    case "needs_revision":
      return <MessageSquare className="h-3 w-3" />;
    default:
      return <Clock className="h-3 w-3" />;
  }
}

function SubmissionRow({ article }: { article: Article }) {
  const { toast } = useToast();
  const reviewSubmission = useMutation(api.articles.reviewSubmission);

  const handleQuickAction = async (action: "approve" | "reject") => {
    try {
      await reviewSubmission({
        id: article._id,
        action,
      });

      toast({
        title: `Article ${action}d`,
        description: `The article has been ${action}d successfully.`,
      });
    } catch {
      toast({
        title: "Error",
        description: `Failed to ${action} the article.`,
        variant: "destructive",
      });
    }
  };

  const authorName = article.authorId
    ? article.author?.name
    : article.guestAuthorName;

  const status = article.submissionStatus || "pending";

  return (
    <>
      <TableRow key={article._id}>
        <TableCell className="max-w-xs">
          <div className="space-y-1">
            <div className="font-medium line-clamp-2">{article.title}</div>
            <div className="text-sm text-gray-500">
              by {authorName || "Unknown"}
              {!article.authorId && (
                <span className="ml-1 text-xs text-blue-600">(Guest)</span>
              )}
            </div>
          </div>
        </TableCell>

        <TableCell>
          <div className="flex items-center gap-2">
            {getStatusIcon(status)}
            <Badge variant={getStatusVariant(status)}>
              {status.replace("_", " ")}
            </Badge>
          </div>
        </TableCell>

        <TableCell>
          <Badge variant="outline">{article.category}</Badge>
        </TableCell>

        <TableCell className="text-sm text-gray-500">
          {article.submittedAt
            ? new Date(article.submittedAt).toLocaleDateString()
            : "Unknown"}
        </TableCell>

        <TableCell>
          {article.reviewedAt && (
            <div className="text-sm text-gray-500">
              {new Date(article.reviewedAt).toLocaleDateString()}
            </div>
          )}
        </TableCell>

        <TableCell>
          <div className="flex items-center gap-2">
            {status === "pending" && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleQuickAction("approve")}
                  className="h-8"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleQuickAction("reject")}
                  className="h-8"
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Reject
                </Button>
              </>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/admin/submissions/${article._id}/review`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/admin/submissions/${article._id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Article
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableCell>
      </TableRow>
    </>
  );
}

export function SubmissionsTable() {
  const [activeTab, setActiveTab] = useState<SubmissionStatus | "all">(
    "pending"
  );

  const allSubmissions = useQuery(api.articles.getAllSubmissions, {});
  const pendingSubmissions = useQuery(api.articles.getPendingSubmissions, {});

  const getSubmissionsForTab = () => {
    if (activeTab === "all") return allSubmissions;
    if (activeTab === "pending") return pendingSubmissions;
    return allSubmissions?.filter(
      (article) => article.submissionStatus === activeTab
    );
  };

  const submissions = getSubmissionsForTab();

  if (!submissions) {
    return (
      <div className="space-y-3">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const getTabCount = (status: SubmissionStatus | "all") => {
    if (status === "all") return allSubmissions?.length || 0;
    if (status === "pending") return pendingSubmissions?.length || 0;
    return (
      allSubmissions?.filter((a) => a.submissionStatus === status).length || 0
    );
  };

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as SubmissionStatus | "all")
        }
      >
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({getTabCount("pending")})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({getTabCount("approved")})
          </TabsTrigger>
          <TabsTrigger value="needs_revision">
            Needs Revision ({getTabCount("needs_revision")})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({getTabCount("rejected")})
          </TabsTrigger>
          <TabsTrigger value="all">All ({getTabCount("all")})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No submissions found for this status.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Article</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Reviewed</TableHead>
                  <TableHead className="w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((article) => (
                  <SubmissionRow key={article._id} article={article} />
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
