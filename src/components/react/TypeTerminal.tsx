import { useEffect, useRef, useState } from "react";

interface Step {
  command: string;
  output: string[];
  ok?: boolean;
}

const STEPS: Step[] = [
  {
    command: "pnpm create vinext-app@latest my-app",
    output: [
      "┌  依赖安装完成 · Vite + @vitejs/plugin-react 就绪",
      "├  部署目标：Cloudflare Workers（cloudflare.config.ts 已生成）",
      "└  完成。cd my-app 即可开始开发",
    ],
    ok: true,
  },
  {
    command: "cd my-app && npm run dev:vinext",
    output: [
      "  VITE v8 · vinext 插件已加载 · App Router 探测成功",
      "  ➜ Local:   http://localhost:3001",
      "  ➜ HMR:     已连接（14ms）",
    ],
  },
  {
    command: "npx @vinext/cloudflare deploy",
    output: [
      "  ✔ 构建完成（RSC + SSR + 客户端三环境）",
      "  ✔ 上传 Cloudflare Build Output",
      "  ✔ 已部署 → https://my-app.vinext.workers.dev",
    ],
    ok: true,
  },
];

const TYPING_MS = 46;
const OUTPUT_DELAY = 320;
const END_PAUSE = 4200;

export function TypeTerminal() {
  const [phase, setPhase] = useState<{ step: number; typed: string; outCount: number }>({
    step: 0,
    typed: "",
    outCount: 0,
  });
  const [running, setRunning] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setRunning(e.isIntersecting), {
      threshold: 0.2,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return;
    if (reduced) {
      setPhase({ step: STEPS.length, typed: "", outCount: 99 });
      return;
    }

    let cancelled = false;
    let step = 0;
    let charIdx = 0;
    let outCount = 0;
    let timeout: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (cancelled) return;
      const current = STEPS[step];

      if (charIdx < current.command.length) {
        charIdx += 1;
        setPhase({ step, typed: current.command.slice(0, charIdx), outCount });
        timeout = setTimeout(tick, TYPING_MS);
        return;
      }
      if (outCount < current.output.length) {
        outCount += 1;
        setPhase({ step, typed: current.command, outCount });
        timeout = setTimeout(tick, OUTPUT_DELAY);
        return;
      }
      step += 1;
      if (step >= STEPS.length) {
        timeout = setTimeout(() => {
          if (cancelled) return;
          step = 0;
          charIdx = 0;
          outCount = 0;
          setPhase({ step: 0, typed: "", outCount: 0 });
          timeout = setTimeout(tick, 600);
        }, END_PAUSE);
        return;
      }
      charIdx = 0;
      outCount = 0;
      setPhase({ step, typed: "", outCount: 0 });
      timeout = setTimeout(tick, 500);
    };

    timeout = setTimeout(tick, 400);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [running, reduced]);

  return (
    <div
      ref={boxRef}
      className="overflow-hidden rounded-xl border border-white/10 bg-[#101010] shadow-[0_24px_80px_-24px_rgba(0,0,0,0.8)]"
      role="img"
      aria-label="vinext 快速开始命令演示"
    >
      <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
        <i className="h-2.5 w-2.5 rounded-full bg-[#3f3d3a]" aria-hidden="true" />
        <i className="h-2.5 w-2.5 rounded-full bg-[#3f3d3a]" aria-hidden="true" />
        <i className="h-2.5 w-2.5 rounded-full bg-accent/70" aria-hidden="true" />
        <span className="ml-2 font-mono text-[11px] tracking-wider text-mid">
          vinext · bash
        </span>
        <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" aria-hidden="true" />
          LIVE
        </span>
      </div>

      <div className="min-h-[300px] space-y-4 px-5 py-5 font-mono text-[13px] leading-relaxed sm:min-h-[320px]">
        {STEPS.slice(0, running ? phase.step + 1 : 1).map((s, i) => {
          const isCurrent = i === phase.step && running;
          const shownCommand = isCurrent ? phase.typed : s.command;
          const visibleOutputs = isCurrent ? phase.outCount : s.output.length;
          return (
            <div key={s.command} className={i < (running ? phase.step : 0) ? "opacity-55" : ""}>
              <p>
                <span className="text-accent">$ </span>
                <span className="text-paper">{shownCommand}</span>
                {isCurrent && charIdxActive(phase, s) && (
                  <span className="terminal-caret" aria-hidden="true" />
                )}
              </p>
              {visibleOutputs > 0 && (
                <div className="mt-2 space-y-1 pl-4 text-[12px] text-mid">
                  {s.output.slice(0, visibleOutputs).map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function charIdxActive(phase: { step: number; typed: string; outCount: number }, s: Step) {
  return phase.typed.length < s.command.length && phase.outCount === 0;
}
