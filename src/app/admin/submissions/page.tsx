import { SubmissionsTable } from "@/components/admin/SubmissionsTable";

export default function AdminSubmissionsPage() {
  return (
    <div className="space-y-8 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Article Submissions</h1>
          <p className="text-gray-600 mt-2">
            Review and manage submitted articles
          </p>
        </div>
      </div>
      <SubmissionsTable />
    </div>
  );
}
