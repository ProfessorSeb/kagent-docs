import { getAllExampleCategories, getExampleFile } from "@/lib/docs";
import { notFound } from "next/navigation";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";

export function generateStaticParams() {
  const categories = getAllExampleCategories();
  const params: { slug: string[] }[] = [];
  for (const cat of categories) {
    for (const file of cat.files) {
      params.push({ slug: [cat.slug, file.slug] });
    }
  }
  return params;
}

export default async function ExampleFilePage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  if (slug.length !== 2) notFound();
  const [category, file] = slug;
  const result = getExampleFile(category, file);
  if (!result) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-8">
        <Link href="/examples" className="text-text-muted hover:text-text-secondary transition-colors">Examples</Link>
        <svg className="h-3 w-3 text-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
        <Link href="/examples" className="text-text-muted hover:text-text-secondary transition-colors">{result.category.title}</Link>
        <svg className="h-3 w-3 text-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
        <span className="text-text-primary font-medium">{result.file.name}</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">{result.file.name}</h1>
        <p className="text-sm text-text-secondary">
          Category: <span className="text-kagent-300">{result.category.title}</span>
        </p>
      </div>

      {/* Code block */}
      <div className="rounded-xl border border-border-dim bg-surface overflow-hidden">
        <div className="flex items-center justify-between border-b border-border-dim px-4 py-3 bg-surface-raised">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500/60" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
            <div className="h-3 w-3 rounded-full bg-green-500/60" />
            <span className="ml-3 text-xs font-mono text-text-muted">{result.file.name}</span>
          </div>
          <CopyButton content={result.file.content} />
        </div>
        <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
          <code className="text-text-secondary">{result.file.content}</code>
        </pre>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <Link href="/examples" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          Back to Examples
        </Link>
      </div>
    </div>
  );
}
