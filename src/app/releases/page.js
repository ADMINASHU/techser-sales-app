import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Release Notes | Techser Sales App",
  description: "Recent updates and improvements.",
};

export default function ReleasesPage() {
  let content = "No release notes found.";
  
  try {
    const changelogPath = path.join(process.cwd(), "CHANGELOG.md");
    if (fs.existsSync(changelogPath)) {
      const rawContent = fs.readFileSync(changelogPath, "utf-8");
      // Remove commit links like ([5e6b976](...))
      content = rawContent.replace(/\s*\(\[[0-9a-f]+\]\(.*?\)\)/g, "");
    }
  } catch (error) {
    console.error("Failed to read CHANGELOG.md", error);
    content = "Error loading release notes.";
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-200 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
            <Link href="/dashboard">
                <Button variant="ghost" className="text-gray-400 hover:text-white pl-0 mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Button>
            </Link>
          <h1 className="text-3xl font-bold bg-linear-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">
            Release Notes
          </h1>
          <p className="text-gray-500 mt-2">
            History of changes, improvements, and fixes.
          </p>
        </div>

        <article className="prose prose-invert prose-headings:text-gray-200 prose-a:text-blue-400 prose-strong:text-white max-w-none glass-panel p-8 rounded-xl border border-white/5">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
