import fs from "fs";
import path from "path";
import matter from "gray-matter";

const docsDir = path.join(process.cwd(), "..", "docs");
const examplesDir = path.join(process.cwd(), "..", "examples");

export interface DocMeta {
  slug: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

const DOC_META: Record<string, Omit<DocMeta, "slug">> = {
  overview: {
    title: "Architecture Overview",
    description: "Core components, protocols, and design principles",
    icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z",
    order: 0,
  },
  "agent-crd-reference": {
    title: "Agent CRD Reference",
    description: "Complete API reference for Agent custom resources",
    icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
    order: 1,
  },
  "tools-ecosystem": {
    title: "Tools Ecosystem",
    description: "MCP servers, tool approval, and community tools",
    icon: "M11.42 15.17l-4.655 2.448a1.5 1.5 0 01-2.18-1.582l.89-5.191-3.77-3.674a1.5 1.5 0 01.832-2.56l5.211-.757 2.33-4.723a1.5 1.5 0 012.694 0l2.33 4.723 5.211.757a1.5 1.5 0 01.832 2.56l-3.77 3.674.89 5.191a1.5 1.5 0 01-2.18 1.582L12 15.17z",
    order: 2,
  },
  "human-in-the-loop": {
    title: "Human-in-the-Loop",
    description: "Tool approval workflows and interactive questions",
    icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
    order: 3,
  },
  "git-based-skills": {
    title: "Git-Based Skills",
    description: "Load reusable agent skills from Git repos and OCI images",
    icon: "M3 3l8.735 8.735m0 0a.374.374 0 11.53.53m-.53-.53l.53.53m0 0L21 21M14.652 9.348a3.75 3.75 0 010 5.304m2.121-7.425a6.75 6.75 0 010 9.546m2.121-11.667C21.583 7.794 23.25 9.813 23.25 12s-1.667 4.206-4.356 6.894",
    order: 4,
  },
  "agent-memory": {
    title: "Agent Memory",
    description: "Long-term vector memory with embeddings and semantic search",
    icon: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375",
    order: 5,
  },
  "prompt-templates": {
    title: "Prompt Templates",
    description: "Go templates with ConfigMap-sourced fragments",
    icon: "M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z",
    order: 6,
  },
  "multi-runtime": {
    title: "Multi-Runtime Support",
    description: "Go ADK, Python ADK, and BYO container agents",
    icon: "M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z",
    order: 7,
  },
  "context-management": {
    title: "Context Management",
    description: "Event compaction for long-running conversations",
    icon: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6",
    order: 8,
  },
};

export function getAllDocs(): DocMeta[] {
  return Object.entries(DOC_META)
    .map(([slug, meta]) => ({ slug, ...meta }))
    .sort((a, b) => a.order - b.order);
}

export function getDocContent(slug: string): { meta: DocMeta; content: string } | null {
  const filePath = path.join(docsDir, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { content } = matter(raw);
  const meta = DOC_META[slug];
  if (!meta) return null;
  return { meta: { slug, ...meta }, content };
}

export function getAllDocSlugs(): string[] {
  return Object.keys(DOC_META);
}

export interface ExampleCategory {
  slug: string;
  title: string;
  icon: string;
  files: { name: string; slug: string; content: string }[];
}

const EXAMPLE_META: Record<string, { title: string; icon: string }> = {
  "human-in-the-loop": { title: "Human-in-the-Loop", icon: "shield" },
  "git-skills": { title: "Git Skills", icon: "git" },
  memory: { title: "Memory", icon: "database" },
  "multi-runtime": { title: "Multi-Runtime", icon: "server" },
  "prompt-templates": { title: "Prompt Templates", icon: "template" },
  "context-management": { title: "Context Management", icon: "compress" },
  tools: { title: "Tools", icon: "wrench" },
};

export function getAllExampleCategories(): ExampleCategory[] {
  if (!fs.existsSync(examplesDir)) return [];
  const dirs = fs.readdirSync(examplesDir, { withFileTypes: true }).filter((d) => d.isDirectory());
  return dirs
    .map((dir) => {
      const meta = EXAMPLE_META[dir.name] || { title: dir.name, icon: "file" };
      const catDir = path.join(examplesDir, dir.name);
      const files = fs
        .readdirSync(catDir)
        .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml") || f.endsWith(".md"))
        .map((f) => ({
          name: f,
          slug: f.replace(/\.(yaml|yml|md)$/, ""),
          content: fs.readFileSync(path.join(catDir, f), "utf-8"),
        }));
      return { slug: dir.name, title: meta.title, icon: meta.icon, files };
    })
    .filter((c) => c.files.length > 0);
}

export function getExampleFile(
  category: string,
  file: string
): { category: ExampleCategory; file: { name: string; slug: string; content: string } } | null {
  const categories = getAllExampleCategories();
  const cat = categories.find((c) => c.slug === category);
  if (!cat) return null;
  const f = cat.files.find((f) => f.slug === file);
  if (!f) return null;
  return { category: cat, file: f };
}
