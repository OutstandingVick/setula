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

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="docs-sidebar">
      <div className="docs-sidebar-brand">
        <Link href="/">
          <SetulaLogo theme="light" className="docs-logo" />
        </Link>
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
