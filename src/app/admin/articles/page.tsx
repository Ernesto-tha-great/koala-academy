import { CreateArticleButton } from "../../../components/admin/CreateArticlesButton";
import { ArticlesTable } from "../../../components/admin/ArticlesTable";

export default function AdminArticlesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Articles</h1>
        <CreateArticleButton />
      </div>
      <ArticlesTable />
    </div>
  );
}