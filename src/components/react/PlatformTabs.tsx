import { useState } from "react";

interface Platform {
  id: string;
  label: string;
  badge?: string;
  note: string;
  build: string;
  steps: string[];
}

export const PLATFORMS: Platform[] = [
  {
    id: "cloudflare",
    label: "Cloudflare Workers",
    badge: "原生集成 · 推荐",
    note: "vinext 通过 @cloudflare/vite-plugin 与 Workers 原生集成，包括 cloudflare:workers bindings、KV 缓存、图片优化与一条命令部署。",
    build: "npx @vinext/cloudflare deploy",
    steps: [
      "先运行 vinext init --platform=cloudflare 安装 cf 与 Cloudflare Vite plugin v2，生成 cloudflare.config.ts",
      "认证二选一：cf auth login（本地开发）或 CLOUDFLARE_API_TOKEN 环境变量（CI / 非交互）",
      "在 cloudflare.config.ts 的 defineConfig 顶层设置 accountId，或使用 CLOUDFLARE_ACCOUNT_ID 环境变量",
      "运行 npx @vinext/cloudflare deploy —— 校验配置、构建并部署 Cloudflare Build Output",
    ],
  },
  {
    id: "vercel",
    label: "Vercel",
    note: "通过 Nitro Vite 插件部署。Nitro 会在 CI 中自动探测 Vercel。",
    build: "NITRO_PRESET=vercel npx vite build",
    steps: [
      "在 vite.config 中并列加入 nitro() 与 vinext() 插件",
      "本地构建：NITRO_PRESET=vercel npx vite build",
      "使用 Vercel CLI 部署，或在仪表盘连接 Git 仓库",
      "构建命令设为 vite build，输出目录设为 .output",
    ],
  },
  {
    id: "netlify",
    label: "Netlify",
    note: "Nitro 在 CI 中自动探测 Netlify。",
    build: "NITRO_PRESET=netlify npx vite build",
    steps: [
      "在 vite.config 中并列加入 nitro() 与 vinext() 插件",
      "本地构建：NITRO_PRESET=netlify npx vite build",
      "使用 Netlify CLI 部署，或连接 Git 仓库",
      "构建命令设为 vite build",
    ],
  },
  {
    id: "aws",
    label: "AWS（Amplify）",
    note: "Nitro 在 CI 中自动探测 AWS Amplify。",
    build: "NITRO_PRESET=aws_amplify npx vite build",
    steps: [
      "在 vite.config 中并列加入 nitro() 与 vinext() 插件",
      "本地构建：NITRO_PRESET=aws_amplify npx vite build",
      "在 AWS Amplify 控制台连接 Git 仓库",
      "构建命令设为 vite build",
    ],
  },
  {
    id: "deno",
    label: "Deno Deploy",
    note: "通过 Nitro preset 部署到 Deno Deploy。",
    build: "NITRO_PRESET=deno_deploy npx vite build",
    steps: [
      "本地构建：NITRO_PRESET=deno_deploy npx vite build",
      "进入 .output 目录",
      "运行 deployctl deploy --project=my-project server/index.ts",
    ],
  },
  {
    id: "node",
    label: "Node.js 服务器",
    note: "产出独立的 Node.js 服务器，适用于 Docker、虚拟机或任何能运行 Node 的环境。",
    build: "NITRO_PRESET=node npx vite build",
    steps: [
      "本地构建：NITRO_PRESET=node npx vite build",
      "运行 node .output/server/index.mjs 启动",
      "也可在 next.config 设置 output: \"standalone\"，然后 node dist/standalone/server.js",
    ],
  },
];

export function PlatformTabs() {
  const [active, setActive] = useState("cloudflare");
  const platform = PLATFORMS.find((p) => p.id === active) ?? PLATFORMS[0];

  return (
    <div>
      <div
        role="tablist"
        aria-label="部署平台"
        className="mb-6 flex flex-wrap gap-2"
      >
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            role="tab"
            aria-selected={active === p.id}
            onClick={() => setActive(p.id)}
            className={`rounded-full border px-4 py-2 font-mono text-[12px] tracking-wider transition active:scale-95 ${
              active === p.id
                ? "border-accent/70 bg-accent/10 text-paper"
                : "border-white/10 text-mid hover:border-white/25 hover:text-subtle"
            }`}
          >
            {p.label}
            {p.badge && (
              <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-[9px] font-semibold text-ink">
                {p.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div key={platform.id} className="reveal is-visible grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-mid">说明</p>
          <p className="mt-3 text-sm leading-relaxed text-subtle">{platform.note}</p>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-mid">部署 / 构建命令</p>
          <div className="mt-3 inline-flex items-center gap-3 rounded-lg border border-white/10 bg-[#101010] px-4 py-2.5">
            <span className="font-mono text-accent">$</span>
            <code className="font-mono text-[13px] text-paper">{platform.build}</code>
          </div>
        </div>
        <ol className="relative space-y-4 border-l border-white/12 pl-6">
          {platform.steps.map((step, i) => (
            <li key={`${platform.id}-step-${i}`} className="relative">
              <span
                className="absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-accent/60 bg-ink font-mono text-[9px] text-accent"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-mid">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
