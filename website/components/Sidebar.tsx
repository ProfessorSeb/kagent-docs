"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface DocLink {
  slug: string;
  title: string;
  icon: string;
}

export default function Sidebar({ docs }: { docs: DocLink[] }) {
  const pathname = usePathname();
  return (
    <aside className="fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 border-r border-border-dim bg-surface overflow-y-auto hidden lg:block">
      <nav className="p-4 space-y-1">
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wider px-3 py-2">Documentation</div>
        {docs.map((doc) => {
          const isActive = pathname === `/docs/${doc.slug}`;
          return (
            <Link
              key={doc.slug}
              href={`/docs/${doc.slug}`}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-kagent-500/10 text-kagent-300 font-medium"
                  : "text-text-secondary hover:bg-surface-overlay hover:text-text-primary"
              }`}
            >
              <svg className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-kagent-400" : "text-text-muted"}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={doc.icon} />
              </svg>
              <span className="truncate">{doc.title}</span>
            </Link>
          );
        })}
        <div className="border-t border-border-dim mt-4 pt-4">
          <Link
            href="/examples"
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              pathname.startsWith("/examples")
                ? "bg-kagent-500/10 text-kagent-300 font-medium"
                : "text-text-secondary hover:bg-surface-overlay hover:text-text-primary"
            }`}
          >
            <svg className="h-4 w-4 flex-shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
            <span>Examples</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}
