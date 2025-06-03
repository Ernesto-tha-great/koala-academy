import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            Built by{" "}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gray-900 hover:text-primary transition-colors"
            >
              devrel
            </Link>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Privacy
            </Link>
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Terms
            </Link>
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
