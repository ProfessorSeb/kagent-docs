"use client";

import { useState } from "react";

export default function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <button
      className="text-xs text-text-muted hover:text-text-secondary transition-colors px-2 py-1 rounded border border-border-dim hover:bg-surface-overlay"
      onClick={handleCopy}
      title="Copy to clipboard"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
