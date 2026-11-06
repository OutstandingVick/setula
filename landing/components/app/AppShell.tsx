import Link from "next/link";
import type { ReactNode } from "react";
import { SetulaLogo } from "../SetulaLogo";
import { AccountIcon, ContractorsIcon, HomeIcon, PaymentsIcon } from "./Icons";

const items = [
  { label: "Home", href: "/app", icon: HomeIcon },
  { label: "Payments", href: "/app#payments", icon: PaymentsIcon },
  { label: "Contractors", href: "/app#contractor", icon: ContractorsIcon },
  { label: "Account", href: "/app#account", icon: AccountIcon },
];

function Navigation({ current }: { current: string }) {
  return <>{items.map(({ label, href, icon: NavIcon }) => (
    <Link className="app-nav-link" data-active={current === label.toLowerCase()} href={href} key={label}>
      <NavIcon /><span>{label}</span>
    </Link>
  ))}</>;
}

export function AppShell({ children, current = "home" }: { children: ReactNode; current?: string }) {
  return (
    <div className="business-app">
      <a className="app-skip-link" href="#app-main">Skip to content</a>
      <aside className="desktop-nav" aria-label="Primary navigation">
        <Link href="/app" aria-label="Setula home"><SetulaLogo className="app-logo" theme="dark" /></Link>
        <nav><Navigation current={current} /></nav>
        <div className="business-chip" id="account"><span>SN</span><div><strong>Studio North</strong><small>Business account</small></div></div>
      </aside>
      <div className="app-frame">
        <main id="app-main" className="app-main">{children}</main>
      </div>
      <nav className="bottom-nav" aria-label="Primary navigation"><Navigation current={current} /></nav>
    </div>
  );
}
