"use client";
import { useState } from "react";

export function CopyValueButton({ value, label = "Copy transaction hash" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 2000); }
    catch { setCopied(false); }
  }
  return <button className="copy-button" type="button" onClick={() => void copy()} aria-label={label}>{copied ? "Copied" : "Copy"}</button>;
}
