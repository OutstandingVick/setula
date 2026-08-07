import type { ReactNode } from "react";

type CalloutVariant = "info" | "warning" | "check" | "danger";

const icons: Record<CalloutVariant, string> = {
  info: "i",
  warning: "!",
  check: "✓",
  danger: "✕",
};

export function Callout({
  variant = "info",
  children,
}: {
  variant?: CalloutVariant;
  children: ReactNode;
}) {
  return (
    <div className={`docs-callout docs-callout-${variant}`}>
      <span className="docs-callout-icon">{icons[variant]}</span>
      <div className="docs-callout-body">{children}</div>
    </div>
  );
}
