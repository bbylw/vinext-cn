# vinext 中文文档站

vinext 官方 README 的中文译介网站：在 Vite 上运行 Next.js 应用，以 Cloudflare Workers 作为主要部署目标。

**线上地址：** [vinext.ndjp.net](https://vinext.ndjp.net)

## 技术栈

- [Astro](https://astro.build) 7 — 静态站点生成
- [React](https://react.dev) 19 — 交互岛屿（终端演示、筛选、手风琴等）
- [Tailwind CSS](https://tailwindcss.com) 4 — 样式
- TypeScript 6 — 类型安全
- [Bun](https://bun.sh) — 包管理与运行时

## 开发

```bash
bun install
bun run dev      # 本地开发
bun run build    # 构建到 dist/
bun run preview  # 预览构建产物
```

## 部署

通过 GitHub Actions 自动构建并发布到 GitHub Pages（自定义域 vinext.ndjp.net）。
推送 `main` 分支即触发部署。

## 内容来源

站点内容译自 vinext 官方 README（见 `vinext-readme.md`），以英文原文为准。
