"use client";

import { ArticleForm } from "@/components/ArticleForm";
import { useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function SubmitArticlePage() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Submit Your Article</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Share your knowledge with our community! You need to be signed in to
            submit articles.
          </p>
        </div>

        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please sign in to submit articles to our platform.
          </p>
          <SignInButton mode="modal">
            <Button size="lg">Sign In to Submit Article</Button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Submit Your Article</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Share your knowledge with our community! Submit your article for
          review and it will be published after approval by our editorial team.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="font-semibold text-blue-900 mb-2">
          Submission Guidelines
        </h2>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Articles should be original and well-written</li>
          <li>• Technical content should be accurate and helpful</li>
          <li>• Please include a clear excerpt/summary</li>
          <li>• All submissions will be reviewed before publication</li>
          <li>
            • We&apos;ll notify you via email about the status of your
            submission
          </li>
        </ul>
      </div>

      <ArticleForm />
    </div>
  );
}
