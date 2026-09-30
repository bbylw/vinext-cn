import { useMemo, useState } from "react";
import {
  SUPPORT_LEVEL_META,
  SUPPORT_LEVELS,
  type SupportLevel,
} from "../../data/support-level";

export type Level = SupportLevel;

export interface ApiRow {
  name: string;
  level: Level;
  note: string;
}

export interface ApiSection {
  title: string;
  rows: ApiRow[];
}

export const API_DATA: ApiSection[] = [
  {
    title: "模块垫片",
    rows: [
      { name: "next/link", level: "full", note: "全部 props，包括 prefetch（IntersectionObserver）、onNavigate、滚动恢复、basePath、locale" },
      { name: "next/image", level: "partial", note: "远程图片通过 @unpic/react（28 个 CDN），本地图片通过 <img> + srcSet，无构建期优化/缩放" },
      { name: "next/head", level: "full", note: "SSR 收集 + 客户端 DOM 操作" },
      { name: "next/router", level: "full", note: "useRouter、Router 单例、事件、客户端导航、SSR 上下文、i18n" },
      { name: "next/navigation", level: "full", note: "usePathname、useSearchParams、useParams、useRouter、redirect、notFound、forbidden、unauthorized" },
      { name: "next/server", level: "full", note: "NextRequest、NextResponse、NextURL、cookies、userAgent、after、connection、URLPattern" },
      { name: "next/headers", level: "full", note: "异步的 headers()、cookies()、draftMode()" },
      { name: "next/dynamic", level: "full", note: "ssr: true、ssr: false、loading 组件" },
      { name: "next/script", level: "full", note: "全部 4 种策略（beforeInteractive、afterInteractive、lazyOnload、worker）" },
      { name: "next/font/google", level: "partial", note: "运行时 CDN 加载，无自托管、字体子集化或兜底度量" },
      { name: "next/font/local", level: "partial", note: "运行时 @font-face 注入，不在构建时提取" },
      { name: "next/og", level: "full", note: "通过 @vercel/og（Satori + resvg）生成 OG 图片" },
      { name: "next/cache", level: "full", note: "revalidateTag、revalidatePath、unstable_cache、可插拔的 CacheHandler、带 cacheLife() 与 cacheTag() 的 \"use cache\"" },
      { name: "next/form", level: "full", note: "GET 表单拦截 + POST Server Action 委托" },
      { name: "next/legacy/image", level: "full", note: "把旧版 props 翻译成现代 Image" },
      { name: "next/error", level: "full", note: "默认错误页组件" },
      { name: "next/config", level: "full", note: "getConfig / setConfig" },
      { name: "next/document", level: "full", note: "Html、Head、Main、NextScript" },
      { name: "next/constants", level: "full", note: "全部阶段常量" },
      { name: "next/amp", level: "stub", note: "空操作（AMP 已废弃）" },
      { name: "next/web-vitals", level: "stub", note: "空操作（直接使用 web-vitals 库）" },
    ],
  },
  {
    title: "路由",
    rows: [
      { name: "文件系统路由（pages/）", level: "full", note: "自动扫描，文件变更时热重载" },
      { name: "文件系统路由（app/）", level: "full", note: "页面、路由、布局、模板、loading、error、not-found、forbidden、unauthorized" },
      { name: "动态路由 [param]", level: "full", note: "两种路由器" },
      { name: "全捕获 [...slug]", level: "full", note: "两种路由器" },
      { name: "可选全捕获 [[...slug]]", level: "full", note: "两种路由器" },
      { name: "路由分组 (group)", level: "full", note: "对 URL 透明，布局仍生效" },
      { name: "平行路由 @slot", level: "full", note: "发现、布局 props、default.tsx、继承的插槽" },
      { name: "拦截路由", level: "full", note: "(.)、(..)、(..)(..)、(...) 约定" },
      { name: "路由处理器（route.ts）", level: "full", note: "具名 HTTP 方法、自动 OPTIONS/HEAD、cookie 附加" },
      { name: "中间件", level: "full", note: "middleware.ts 与 proxy.ts（Next.js 16），匹配模式：字符串、数组、正则、:param、:path*、:path+" },
      { name: "i18n 路由", level: "partial", note: "Pages Router 的 locale 前缀、Accept-Language 探测、NEXT_LOCALE cookie，无基于域名的路由" },
      { name: "basePath", level: "full", note: "应用于各处——URL、Link、Router、导航 hooks" },
      { name: "trailingSlash", level: "full", note: "308 重定向到规范形式" },
    ],
  },
  {
    title: "服务端特性",
    rows: [
      { name: "SSR（Pages Router）", level: "full", note: "流式渲染、_app/_document、__NEXT_DATA__、水合" },
      { name: "SSR（App Router）", level: "full", note: "RSC 流水线、嵌套布局、流式渲染、面向客户端组件的导航上下文" },
      { name: "getStaticProps", level: "full", note: "props、redirect、notFound、revalidate" },
      { name: "getStaticPaths", level: "full", note: "fallback: false、true、\"blocking\"" },
      { name: "getServerSideProps", level: "full", note: "完整上下文（含 locale）" },
      { name: "ISR", level: "full", note: "stale-while-revalidate、可插拔的 CacheHandler、后台再生" },
      { name: "Server Actions（\"use server\"）", level: "full", note: "Action 执行、FormData、变更后重渲染、Action 内的 redirect()" },
      { name: "React Server Components", level: "full", note: "通过 @vitejs/plugin-rsc 实现，\"use client\" 边界正确生效" },
      { name: "流式 SSR", level: "full", note: "两种路由器" },
      { name: "Metadata API", level: "full", note: "metadata、generateMetadata、viewport、generateViewport、标题模板" },
      { name: "generateStaticParams", level: "full", note: "配合 dynamicParams 强制校验" },
      { name: "Metadata 文件路由", level: "full", note: "sitemap.xml、robots.txt、manifest、favicon、OG 图片（静态 + 动态）" },
      { name: "静态导出（output: 'export'）", level: "full", note: "为所有路由生成静态 HTML/JSON" },
      { name: "Standalone 输出", level: "full", note: "生成带 server.js、构建产物与运行时依赖的 dist/standalone" },
      { name: "connection()", level: "full", note: "强制动态渲染" },
      { name: "\"use cache\" 指令", level: "full", note: "文件级与函数级，cacheLife() 配置文件、cacheTag()、stale-while-revalidate" },
      { name: "instrumentation.ts", level: "full", note: "register()、onRequestError()，以及 framework tracing" },
      { name: "路由段配置", level: "partial", note: "revalidate、dynamic、dynamicParams、runtime（非位置相关），无 preferredRegion" },
    ],
  },
  {
    title: "配置",
    rows: [
      { name: "next.config.js / .ts / .mjs", level: "full", note: "函数式配置、phase 参数" },
      { name: "rewrites / redirects / headers", level: "full", note: "所有 phase、参数插值" },
      { name: "环境变量（.env*、NEXT_PUBLIC_*）", level: "full", note: "自动加载 Next.js 风格的 dotenv 文件，仅 public 变量会被内联" },
      { name: "images 配置", level: "partial", note: "会被解析，但不用于优化" },
      { name: "experimental.optimizePackageImports", level: "full", note: "RSC/SSR 环境中把 barrel 导入改写为直接子模块导入，默认集合含 lucide-react、date-fns、radix-ui、antd、MUI 等" },
      { name: "vinext({ nextConfig })", level: "full", note: "从 vite.config.* 内联 Next 风格配置，支持对象与函数形式，提供时覆盖根 next.config.*" },
      { name: "vinext({ react: { compiler: true } })", level: "full", note: "React Compiler 自动记忆化，需要 @vitejs/plugin-react 6.1+ 与可选的 oxc-transform-react" },
    ],
  },
];

const LEVEL_DOT: Record<Level, string> = {
  full: "bg-accent-green",
  partial: "bg-accent",
  stub: "bg-mid",
};

type Filter = "all" | Level;

export function ApiMatrix() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const stats = useMemo(() => {
    let full = 0;
    let partial = 0;
    let stub = 0;
    for (const section of API_DATA) {
      for (const row of section.rows) {
        if (row.level === "full") full++;
        else if (row.level === "partial") partial++;
        else stub++;
      }
    }
    return { full, partial, stub, total: full + partial + stub };
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return API_DATA.map((section) => ({
      ...section,
      rows: section.rows.filter((row) => {
        if (filter !== "all" && row.level !== filter) return false;
        if (!q) return true;
        return (
          row.name.toLowerCase().includes(q) ||
          row.note.toLowerCase().includes(q)
        );
      }),
    })).filter((section) => section.rows.length > 0);
  }, [query, filter]);

  return (
    <div>
      {/* 统计与筛选 */}
      <div className="mb-8 flex flex-col gap-5 rounded-xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[12px]">
          <span className="text-mid">共 {stats.total} 项</span>
          {SUPPORT_LEVELS.map((lv) => (
            <button
              key={lv}
              type="button"
              onClick={() => setFilter(filter === lv ? "all" : lv)}
              aria-pressed={filter === lv}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 transition active:scale-95 ${
                filter === lv
                  ? "border-accent/70 text-paper"
                  : "border-white/10 text-mid hover:border-white/25 hover:text-subtle"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${LEVEL_DOT[lv]}`} aria-hidden="true" />
              {SUPPORT_LEVEL_META[lv].symbol} {SUPPORT_LEVEL_META[lv].label} · <span className="tnum">{stats[lv]}</span>
            </button>
          ))}
        </div>
        <label className="relative block">
          <span className="sr-only">搜索 API</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索模块、特性…"
            className="w-full rounded-lg border border-white/10 bg-[#101010] px-4 py-2 pl-10 font-mono text-[13px] text-paper placeholder:text-mid/60 focus:border-accent/60 focus:outline-none sm:w-64"
          />
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mid"
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" strokeLinecap="round" />
          </svg>
        </label>
      </div>

      {/* 表格 */}
      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 p-12 text-center">
          <p className="font-mono text-sm text-mid">没有匹配「{query}」的条目</p>
          <p className="mt-2 text-sm text-mid/70">试试其他关键词，或清除状态筛选。</p>
        </div>
      ) : (
        visible.map((section) => (
          <section key={section.title} className="mb-10">
            <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
              {section.title}
            </h3>
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="table-tech w-full min-w-[720px] text-left">
                <thead>
                  <tr className="bg-white/[0.04]">
                    <th className="px-5 py-3.5">特性 / 模块</th>
                    <th className="w-36 px-4 py-3.5">状态</th>
                    <th className="px-5 py-3.5">说明</th>
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map((row) => (
                    <tr key={row.name} className="transition-colors hover:bg-white/[0.03]">
                      <td className="px-5 py-3.5 font-mono text-[13px] text-paper">{row.name}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-mono text-[11px] text-mid">
                          <span aria-hidden="true">{SUPPORT_LEVEL_META[row.level].symbol}</span>
                          {SUPPORT_LEVEL_META[row.level].label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] leading-relaxed text-mid">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))
      )}
    </div>
  );
}
