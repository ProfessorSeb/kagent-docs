import { getAllDocs } from "@/lib/docs";
import Sidebar from "@/components/Sidebar";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const docs = getAllDocs();
  return (
    <div className="flex">
      <Sidebar docs={docs} />
      <div className="flex-1 lg:ml-64">
        <div className="mx-auto max-w-4xl px-6 py-12">
          {children}
        </div>
      </div>
    </div>
  );
}
