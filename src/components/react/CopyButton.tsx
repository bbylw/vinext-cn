import { useCallback, useEffect, useRef, useState } from "react";

export function CopyButton({ text, label = "复制" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  }, [text]);

  return (
    <button
      type="button"
      onClick={copy}
      aria-live="polite"
      className="flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1 font-mono text-[11px] tracking-wider text-mid transition hover:border-accent/60 hover:text-paper active:scale-95"
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M4 12.5l5 5L20 6.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          已复制
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="9" y="9" width="12" height="12" rx="2" />
            <path d="M5 15V5a2 2 0 012-2h10" strokeLinecap="round" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
