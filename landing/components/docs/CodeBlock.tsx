import type { ReactNode } from "react";

export function CodeBlock({
  language,
  children,
}: {
  language?: string;
  children: ReactNode;
}) {
  return (
    <div className="docs-code-block">
      {language && <span className="docs-code-lang">{language}</span>}
      <pre className="docs-code-pre">{children}</pre>
    </div>
  );
}
