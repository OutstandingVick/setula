"use client";

import { useState, type ReactNode } from "react";
import { DocsSidebar } from "../../components/docs/Sidebar";
import { DocsSearch } from "../../components/docs/Search";
import "./docs.css";

export default function DocsLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="docs-shell">
      <a className="skip-link" href="#docs-content">Skip to documentation</a>
      <div
        className={`docs-sidebar-overlay${sidebarOpen ? " open" : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />
      <DocsSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="docs-main" id="docs-content">
        <div className="docs-topbar">
          <button
            className="docs-mobile-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-controls="docs-navigation"
            aria-expanded={sidebarOpen}
            aria-label="Open navigation"
          >
            ☰ Menu
          </button>
          <DocsSearch />
        </div>
        <div className="docs-content">{children}</div>
      </main>
    </div>
  );
}
