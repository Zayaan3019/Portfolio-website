"use client";

import { useState } from "react";

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };
  return (
    <span className="copy-email">
      <a className="btn btn-primary" href={`mailto:${email}`}>
        {email}
      </a>
      <button type="button" className="btn btn-ghost" onClick={copy} aria-live="polite">
        {copied ? "Copied" : "Copy"}
      </button>
    </span>
  );
}
