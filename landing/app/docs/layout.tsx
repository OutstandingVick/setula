"use client";

import { useState, type ReactNode } from "react";
import { DocsSidebar } from "../../components/docs/Sidebar";
import { DocsSearch } from "../../components/docs/Search";
import "./docs.css";

export default function DocsLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="docs-shell">
      <div
        className={`docs-sidebar-overlay${sidebarOpen ? " open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />
      <div className={`docs-sidebar${sidebarOpen ? " open" : ""}`}>
        <DocsSidebar />
      </div>
      <main className="docs-main">
        <div className="docs-topbar">
          <button
            className="docs-mobile-toggle"
            onClick={() => setSidebarOpen(true)}
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
