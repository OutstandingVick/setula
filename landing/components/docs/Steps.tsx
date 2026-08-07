import type { ReactNode } from "react";

export function Steps({ children }: { children: ReactNode }) {
  return <ol className="docs-steps">{children}</ol>;
}

export function Step({ children }: { children: ReactNode }) {
  return <li className="docs-step">{children}</li>;
}
