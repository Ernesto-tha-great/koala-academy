"use client";

import { useState } from "react";
import { useForm } from "react-hook-form"
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";

type FormData = {
  title: string;
  content: string;
  type: "markdown" | "external" | "video";
  externalUrl?: string;
  videoUrl?: string;
  tags: string[];
};

export function ArticleForm() {
  const router = useRouter();
  const createArticle = useMutation(api.articles.create);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();
  const articleType = watch("type");

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      await createArticle(data);
      router.push("/admin");
    } catch (error) {
      console.error("Failed to create article:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Article Type
        </label>
        <select
          {...register("type", { required: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="markdown">Markdown</option>
          <option value="external">External Link</option>
          <option value="video">Video</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          {...register("title", { required: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      {articleType === "external" && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            External URL
          </label>
          <input
            type="url"
            {...register("externalUrl", { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
      )}

      {articleType === "video" && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Video URL
          </label>
          <input
            type="url"
            {...register("videoUrl", { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
      )}

      {articleType === "markdown" && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <textarea
            {...register("content", { required: true })}
            rows={15}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm font-mono"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          {...register("tags")}
          placeholder="react, typescript, nextjs"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? "Creating..." : "Create Article"}
      </button>
    </form>
  );
}