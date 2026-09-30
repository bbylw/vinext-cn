import { useState } from "react";

export interface FaqItem {
  q: string;
  a: string[];
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10">
      {items.map((item, i) => {
        const expanded = open === i;
        return (
          <div key={item.q}>
            <h3>
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? null : i)}
                className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition-colors hover:bg-white/[0.03]"
              >
                <span className={`text-base font-medium leading-relaxed transition-colors ${expanded ? "text-accent" : "text-paper"}`}>
                  {item.q}
                </span>
                <span
                  aria-hidden="true"
                  className={`shrink-0 font-mono text-lg text-mid transition-transform duration-300 ${expanded ? "rotate-45 text-accent" : ""}`}
                >
                  +
                </span>
              </button>
            </h3>
            <div
              className={`grid transition-all duration-300 ease-out ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
              <div className="overflow-hidden">
                <div className="space-y-3 px-6 pb-6 text-sm leading-relaxed text-mid">
                  {item.a.map((para, j) => (
                    <p key={j}>{para}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
