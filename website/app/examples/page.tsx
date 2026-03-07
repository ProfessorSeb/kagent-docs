import { getAllExampleCategories } from "@/lib/docs";
import Link from "next/link";

const CATEGORY_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  "human-in-the-loop": { border: "border-amber-500/30", bg: "bg-amber-500/10", text: "text-amber-400" },
  "git-skills": { border: "border-emerald-500/30", bg: "bg-emerald-500/10", text: "text-emerald-400" },
  memory: { border: "border-blue-500/30", bg: "bg-blue-500/10", text: "text-blue-400" },
  "multi-runtime": { border: "border-cyan-500/30", bg: "bg-cyan-500/10", text: "text-cyan-400" },
  "prompt-templates": { border: "border-purple-500/30", bg: "bg-purple-500/10", text: "text-purple-400" },
  "context-management": { border: "border-rose-500/30", bg: "bg-rose-500/10", text: "text-rose-400" },
  tools: { border: "border-kagent-500/30", bg: "bg-kagent-500/10", text: "text-kagent-400" },
};

export default function ExamplesPage() {
  const categories = getAllExampleCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-kagent-500/30 bg-kagent-500/10 px-3 py-1 mb-4">
          <svg className="h-3.5 w-3.5 text-kagent-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
          </svg>
          <span className="text-xs font-medium text-kagent-300">Examples</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Example Configurations</h1>
        <p className="text-text-secondary">Ready-to-use YAML manifests for every kagent feature. Copy, customize, and deploy.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => {
          const colors = CATEGORY_COLORS[cat.slug] || { border: "border-border-dim", bg: "bg-surface-overlay", text: "text-text-primary" };
          return (
            <div key={cat.slug} className={`rounded-xl border ${colors.border} bg-surface-raised p-6`}>
              <h2 className={`text-lg font-semibold ${colors.text} mb-4`}>{cat.title}</h2>
              <div className="space-y-2">
                {cat.files.map((file) => (
                  <Link
                    key={file.slug}
                    href={`/examples/${cat.slug}/${file.slug}`}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-secondary hover:bg-surface-overlay hover:text-text-primary transition-colors border border-transparent hover:border-border-dim"
                  >
                    <svg className="h-4 w-4 flex-shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <span className="font-mono text-xs">{file.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
