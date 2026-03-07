import { getAllDocSlugs, getDocContent } from "@/lib/docs";
import { notFound } from "next/navigation";
import MarkdownRenderer from "@/components/MarkdownRenderer";

export function generateStaticParams() {
  return getAllDocSlugs().map((slug) => ({ slug }));
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDocContent(slug);
  if (!doc) notFound();

  return (
    <article>
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-kagent-500/30 bg-kagent-500/10 px-3 py-1 mb-4">
          <svg className="h-3.5 w-3.5 text-kagent-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d={doc.meta.icon} />
          </svg>
          <span className="text-xs font-medium text-kagent-300">Documentation</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">{doc.meta.title}</h1>
        <p className="text-text-secondary">{doc.meta.description}</p>
      </div>
      <MarkdownRenderer content={doc.content} />
    </article>
  );
}
