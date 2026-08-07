"use client";

import { useState, useMemo, useRef, useEffect } from "react";

type SearchPage = { label: string; href: string; keywords: string };

const pages: SearchPage[] = [
  {
    label: "Overview",
    href: "/docs/overview",
    keywords: "setula overview problem solution cross-border payment usdc arc",
  },
  {
    label: "Quickstart",
    href: "/docs/quickstart",
    keywords: "quickstart demo live steps sandbox quote funding settlement payout receipt",
  },
  {
    label: "Architecture",
    href: "/docs/architecture",
    keywords: "architecture frontend backend vercel railway circle wallet arc testnet diagram",
  },
  {
    label: "API & State Machine",
    href: "/docs/api",
    keywords: "api routes endpoints state machine payment status idempotency key callback",
  },
  {
    label: "Deployment",
    href: "/docs/deployment",
    keywords: "deployment vercel railway environment variables cors build start production",
  },
  {
    label: "Local Development",
    href: "/docs/local-development",
    keywords: "local development setup install configure environment tests typecheck golden path",
  },
];

export function DocsSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return pages.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.keywords.toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="docs-search" ref={ref}>
      <input
        type="search"
        placeholder="Search docs…"
        className="docs-search-input"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && results.length > 0 && (
        <div className="docs-search-results">
          {results.map((r) => (
            <a
              key={r.href}
              href={r.href}
              className="docs-search-result"
              onClick={() => setOpen(false)}
            >
              {r.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
