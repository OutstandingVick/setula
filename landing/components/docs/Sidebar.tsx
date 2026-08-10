"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SetulaLogo } from "../SetulaLogo";

type NavItem = { label: string; href: string };

const navigation: { group: string; items: NavItem[] }[] = [
  {
    group: "Get Started",
    items: [
      { label: "Overview", href: "/docs/overview" },
      { label: "Quickstart", href: "/docs/quickstart" },
    ],
  },
  {
    group: "Technical",
    items: [
      { label: "Architecture", href: "/docs/architecture" },
      { label: "API & State Machine", href: "/docs/api" },
    ],
  },
  {
    group: "Operations",
    items: [
      { label: "Deployment", href: "/docs/deployment" },
      { label: "Local Development", href: "/docs/local-development" },
    ],
  },
];

export function DocsSidebar({
  open = false,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      id="docs-navigation"
      className={`docs-sidebar${open ? " open" : ""}`}
      aria-label="Documentation navigation"
    >
      <div className="docs-sidebar-header">
        <div className="docs-sidebar-brand">
          <Link href="/">
            <SetulaLogo theme="dark" className="docs-logo" />
          </Link>
        </div>
        <button
          type="button"
          className="docs-sidebar-close"
          onClick={onClose}
          aria-label="Close navigation"
        >
          ×
        </button>
      </div>
      <nav className="docs-sidebar-nav">
        {navigation.map((group) => (
          <div key={group.group} className="docs-sidebar-group">
            <p className="docs-sidebar-group-title">{group.group}</p>
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`docs-sidebar-link${pathname === item.href ? " active" : ""}`}
                onClick={onClose}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className="docs-sidebar-footer">
        <a href="https://github.com/OutstandingVick/setula" className="docs-sidebar-gh-link">
          GitHub →
        </a>
        <a href="https://setula.vercel.app" className="docs-sidebar-gh-link">
          Live Demo →
        </a>
        <a href="/docs/SUBMISSION.pdf" className="docs-sidebar-gh-link">
          Submission (PDF) ↓
        </a>
      </div>
    </aside>
  );
}
