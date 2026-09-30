# vinext

在 Vite 上运行 Next.js 应用，以 Cloudflare Workers 作为主要部署目标。

**官网：** [vinext.dev](https://vinext.dev)

**文档：** [vinext.dev/docs](https://vinext.dev/docs)

> **阅读发布说明：** [我们如何用 AI 在一周内重写 Next.js](https://blog.cloudflare.com/vinext/)

> **正在积极开发中。** vinext 目前已经能够支撑相当一部分规模的 Next.js 应用，但它还不是每个应用或生产负载的即插即用替代品。请预期会出现兼容性缺口（尤其是较新的 App Router 特性），并在采用前结合你自己的应用进行评估。

vinext 在 Vite 上重新实现了 Next.js 的 API 表面，而不是消费 `next build` 的产物。它同时支持 App Router 与 Pages Router、React Server Components、Server Actions、中间件、路由处理器、ISR、静态导出，以及最常用的 `next/*` 模块。Cloudflare Workers 的集成最为深入；Node.js 和其他平台也提供不同程度的支持。

## 项目状态

### 目前可用的功能

- **App Router 与 Pages Router** 的开发与生产构建
- **React Server Components、Server Actions、路由处理器与中间件**
- **静态生成、ISR、`output: "export"`，以及 standalone Node.js 输出**
- **核心 Next.js API 与模块**，包括 `next/link`、`next/image`、`next/navigation`、`next/headers`、`next/cache`，以及 Metadata API
- **Cloudflare Workers 部署**，支持 bindings、缓存适配器与图片优化
- **迁移工具**，通过 `vinext check`、`vinext init`，以及 vinext 的 Agent Skill

### 正在解决的已知缺口

这些是当前活跃的兼容性工作方向，并非永久性的排除项：

- **Cache Components 与 Partial Prerendering：** `"use cache"` 已实现部分功能，但完整的 `cacheComponents` 行为仍不完整。缓存配置文件、标签、局部外壳（partial shells）、恢复行为、预取，以及一些开发/构建阶段的缓存语义，尚未在所有情况下与 Next.js 一致。
- **构建期图片与字体优化：** 图片可以在 Cloudflare 上按请求实时优化，但 vinext 尚未复刻 Next.js 完整的构建期图片处理流水线。Google Fonts 从 CDN 加载，本地字体 CSS 在运行时注入，而非在构建时提取。
- **App Router 开发环境下的原生模块：** `sharp`、`resvg`、`satori`、`lightningcss`、`@napi-rs/canvas` 等包在 Vite 的 RSC 开发环境中可能会失败。生产构建对这些情况的支持比开发模式更完整。
- **平台特定与高级 Next.js 行为：** `preferredRegion` 路由配置会被忽略；`runtime` 不会决定路由在哪里运行（在 `cacheComponents` 之外，`runtime = "edge"` 的 App Router 页面永远不会被 ISR 缓存，这与 Next.js 一致）；部分近期引入或未文档化的 Next.js 行为可能尚未复刻。

在迁移前，请先对已有应用运行 `vinext check`。如果某个缺口未列于此，请查看 [open issues](https://github.com/cloudflare/vinext/issues) 或提交一个聚焦的重现示例。

## 快速开始

**请使用下方的官方初始化命令。** 它们是创建或迁移 vinext 项目的推荐方式，因为它们会替你配置依赖、`scripts`、Vite 以及部署目标。

用 `create-vinext-app` 新建项目：

```bash
pnpm create vinext-app@latest my-app
```

用 `vinext init` 迁移已有的 Next.js 项目：

```bash
npx vinext init
```

### 可选：用 AI agent 迁移

如果只是想要直接、可重复的迁移，更推荐 `vinext init`。如果你想让 AI agent 来排查兼容性问题并引导迁移，vinext 还附带了一个可选的 [Agent Skill](https://agentskills.io/home)。它可以与 Claude Code、OpenCode、Cursor、Codex 以及数十种其他 AI 编程工具配合使用：

```sh
npx skills add cloudflare/vinext
```

然后在任意受支持的工具中打开你的 Next.js 项目并输入：

```
migrate this project to vinext
```

该 skill 会处理兼容性检查、依赖安装、配置生成，以及开发服务器启动。它了解 vinext 支持哪些能力，并会标记出需要人工介入的地方。

### 或者手动操作

```bash
npm install vinext
npm install -D vite @vitejs/plugin-react
```

如果你使用 App Router，还需安装：

```bash
npm install react-server-dom-webpack
npm install -D @vitejs/plugin-rsc
```

添加 Vite 配置：

```ts
import { defineConfig } from "vite";
import vinext from "vinext";

export default defineConfig({
  plugins: [vinext()],
});
```

随后用 Vite 进行开发与构建：

```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "start": "vinext start"
  }
}
```

```bash
npx vite dev        # 带 HMR 的开发服务器
npx vite build      # 生产构建
npx @vinext/cloudflare deploy  # 构建并部署到 Cloudflare Workers
```

如果使用 Vite+，则用 `vpx @vinext/cloudflare deploy`，或者在运行本地安装的 bin 时用
`vp exec vinext-cloudflare deploy`。

`vinext()` 插件会自动探测你的 `app/` 或 `pages/` 目录，并加载 `next.config.js`。

你已有的 `pages/`、`app/`、`next.config.js`、`public/` 目录都可以原样工作。先运行 `vinext check` 扫描已知兼容性问题，或使用 `vinext init` 来[自动化完成整次迁移](#migrating-an-existing-nextjs-project)。

### CLI 参考

| 命令                                 | 说明                                                                       |
| ------------------------------------ | -------------------------------------------------------------------------- |
| `vite dev`                           | 启动带 HMR 的开发服务器                                                     |
| `vite build`                         | 生产构建（App Router 多环境：RSC + SSR + 客户端）                          |
| `vinext start`                       | 启动本地生产服务器用于测试                                                 |
| `npx @vinext/cloudflare deploy`      | 构建并部署到 Cloudflare Workers                                            |
| `vp exec vinext-cloudflare deploy`   | 配合 Vite+ 构建并部署到 Cloudflare Workers                                 |
| `vinext init`                        | 将 Next.js 项目迁移到 vinext 下运行                                        |
| `vinext check`                       | 在迁移前扫描你的 Next.js 应用的兼容性问题                                  |
| `vinext lint`                        | 委托给 eslint 或 oxlint                                                    |

`vinext dev` 与 `vinext build` 仍然作为项目本地 Vite 命令的轻量别名存在。
它们需要一个 Vite 配置；如果缺失，请先运行 `vinext init`。这两个命令的选项、输出与退出行为都由 Vite 掌管。对于较早配置好的项目，这些别名仍会在 Vite 读取配置前预加载 dotenv，并在某个明确的默认 Vite 配置需要 ESM 迁移时添加 `"type": "module"`（把已知的 CommonJS 配置文件重命名为 `.cjs`）。显式的
`"type": "commonjs"` 永远不会被改动。直接使用 `vite dev` 与 `vite build` 不会执行这些
包装层兼容性步骤。

`@vinext/cloudflare deploy` 的选项：`--preview`、`--env <name>`、`--name <name>`、`--skip-build`、`--dry-run`、`--warm-cache`、`--traffic-aware-warm-cache`。

`vinext init` 会提示你选择部署目标，默认是 Cloudflare。Agent 必须先询问用户想要哪个
目标，再传入 `--platform=cloudflare` 或 `--platform=node`。

其他选项：`--port <port>`（默认 `3001`）、`--skip-check`、`--force`。

Cloudflare 的 init 默认使用 `cf` 与 `cloudflare.config.ts`。`vinext init` 与
`create-vinext-app` 都接受 `--legacy-wrangler-cloudflare-init` 以保留旧的 Wrangler 配置。
已有的 Wrangler 配置不会被自动迁移。

如果你的 `next.config.*` 设置了 `output: "standalone"`，那么 `vite build` 会在 `dist/standalone/` 输出一个自托管包。启动方式：

```bash
node dist/standalone/server.js
```

环境变量：`PORT`（默认 `3000`）、`HOST`（默认 `0.0.0.0`）。

> **注意：** Next.js 的 standalone 使用 `HOSTNAME` 作为绑定地址，但 vinext 使用 `HOST` 以避免与 Linux 上系统设置的 `HOSTNAME` 变量冲突。请据此更新你的部署配置。

### 新建一个 vinext 项目

新项目请使用 `create-vinext-app`。它会创建一个带 Tailwind CSS 的 TypeScript App Router 项目，
然后运行与已有应用相同的 vinext init 流程：

```bash
pnpm create vinext-app@latest my-app
```

生成的项目默认已准备好部署到 Cloudflare Workers。如果你想要 Node 目标，传入
`--platform=node`。

### 迁移已有的 Next.js 项目

`vinext init` 用一条命令自动化完成迁移：

```bash
npx vinext init
```

它会执行：

1. 运行 `vinext check` 扫描兼容性问题
2. 将 vinext 运行时包安装为依赖，将 Vite/插件工具安装为 devDependencies
3. 把 CJS 配置文件（例如 `postcss.config.js` -> `.cjs`）重命名以避免 ESM 冲突
4. 向 `package.json` 添加 `"type": "module"`
5. 向 `package.json` 添加 `dev:vinext`、`build:vinext`、`start:vinext` 脚本
6. 提示选择部署平台（默认 Cloudflare，或 Node）
7. 生成对应的 `vite.config.ts`
8. 对于 Cloudflare，为 `cf` 与 Cloudflare Vite plugin v2 生成 `cloudflare.config.ts`

这次迁移是非破坏性的——你已有的 Next.js 配置会继续与 vinext 共存。它不会修改
`next.config`、`tsconfig.json` 或任何源文件，也不会移除 Next.js 依赖。

vinext 面向 Vite 8，后者默认使用 Rolldown、Oxc、Lightning CSS，以及更新的浏览器基线。如果你从更旧的配置带来自定义的 Vite 配置或插件，请优先使用 `oxc`、`optimizeDeps.rolldownOptions`、`build.rolldownOptions`，而非旧的 `esbuild` 与 `build.rollupOptions` 开关；如果你仍然需要支持旧浏览器，请覆盖 `build.target`。如果某个依赖因更严格的 CommonJS 默认导入处理而报错，请修正导入，或临时使用 `legacy.inconsistentCjsInterop: true` 作为逃生舱。详见 [Vite 8 迁移指南](https://vite.dev/guide/migration)。

```bash
npm run dev:vinext    # 启动 vinext 开发服务器（端口 3001）
npm run build:vinext  # 用 vinext 构建生产输出
npm run start:vinext  # 启动 vinext 生产服务器
npm run dev           # 仍像以前一样运行 Next.js
```

使用 `--platform=cloudflare` 或 `--platform=node` 可以跳过平台选择提示。Cloudflare 的 init
会通过 AST 更新已有的 JavaScript 或 TypeScript Vite 配置，保留不相关的设置。使用
`--force` 可替换已有的 Node 目标 Vite 配置，或使用 `--skip-check` 跳过兼容性报告。

## 为什么

Vite 已经成为现代 Web 框架的默认构建工具——快速的 HMR、干净的插件 API、原生 ESM，以及不断壮大的生态。随着 [`@vitejs/plugin-rsc`](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-rsc) 加入对 React Server Components 的支持，现在终于可以在 Vite 上构建一套完整的 RSC 框架了。

vinext 在 Vite 上重新实现 Next.js 的 API 表面，让已有的 Next.js 应用可以在另一套工具链上运行。到目前为止，结论是：相当一部分规模的应用确实可以。

vinext 到处都能运行。它原生支持 Cloudflare Workers（配合 `npx @vinext/cloudflare deploy` 或 `vp exec vinext-cloudflare deploy`、bindings、KV 缓存），并且可以通过 [Nitro](https://v3.nitro.build/) Vite 插件部署到 Vercel、Netlify、AWS、Deno Deploy 等更多平台。更多平台的原生支持已在[规划中](https://github.com/cloudflare/vinext/issues/80)。

**值得了解的替代方案：**

- **[OpenNext](https://opennext.js.org/)** —— 将 `next build` 的产物适配到 AWS、Cloudflare 等平台。OpenNext 比 vinext 资历深得多，也更为成熟，因为它构建在 Next.js 自身产物之上，而非重新实现，所以覆盖的 Next.js API 面更广。如果你想要更稳妥、更经过验证的方案，从它开始。
- **[Next.js 自托管](https://nextjs.org/docs/app/building-your-application/deploying#self-hosting)** —— Next.js 可以部署到任意 Node.js 服务器、Docker 容器，或作为静态导出。

### 设计原则

- **随处部署。** 原生支持 Cloudflare Workers，其他平台可通过 Nitro 获得。更多平台的原生适配器已在[规划中](https://github.com/cloudflare/vinext/issues/80)。
- **务实兼容，而非逐 bug 对齐。** 目标覆盖 95% 以上的真实世界 Next.js 应用。依赖未文档化 Vercel 行为的边缘情况，我们有意不支持。
- **只支持最新 Next.js。** 面向 Next.js 16.x。不支持旧版本中已废弃的 API。
- **渐进式采用。** 装上插件，修掉报错，部署上线。

## 常见问题

**这是什么？**
vinext 是一个 Vite 插件，重新实现了公开的 Next.js API——路由、服务端渲染、`next/*` 模块导入、CLI——这样你就可以在 Vite 而非 Next.js 编译器工具链上运行 Next.js 应用。它可以部署到任何地方：Cloudflare Workers 是第一个原生支持的目标，其他平台可通过 Nitro 获得。更多平台的原生适配器已在[规划中](https://github.com/cloudflare/vinext/issues/80)。

**这是 Next.js 的一个 fork 吗？**
不是。vinext 是一套基于 Vite 构建的、对 Next.js API 表面的替代实现。核心是从零写起的。目标不是创建一个竞争性的框架或在 Next.js 已有能力之外添加特性，而是把同一套定义良好的 API 表面搬到 Vite 的工具链上。

**vinext 需要安装 Next.js 吗？**
不需要。vinext 为受支持的 `next` 与 `next/*` API 提供了兜底的类型声明，因此应用可以在没有 `next` 包的情况下运行并做类型检查。如果两个包都安装了，vinext 会继续沿用 Next.js 的权威类型，只附加自己的扩展。那些需要消费 Next.js 内部实现（例如 `styled-jsx`）的兼容特性，在使用时可能仍需要匹配版本的 Next.js 安装。

**这和 OpenNext 有何不同？**
[OpenNext](https://opennext.js.org/) 把标准 `next build` 的_产物_适配到各种平台运行。因为它构建在 Next.js 自身产物之上，所以继承了广泛的 API 覆盖，并且经过了更长时间的良好测试。vinext 走的是另一条路：它从零在 Vite 上重新实现 Next.js API，意味着更快的构建与更小的包体，但对 Next.js 长尾特性的覆盖更少。如果你需要一套成熟、经过充分测试的、在 Vercel 之外运行 Next.js 的方式，OpenNext 是更稳妥的选择。如果你想要一套更轻量的、基于 Vite 的工具链，并且不需要每一个 Next.js API，vinext 可能更合适。

**我能用在生产环境吗？**
可以，但要谨慎。vinext 存在已知的兼容性缺口，尚未在完整的生产 Next.js 负载范围内经过实战检验。在采用前，请评估你的应用所依赖的特性与部署目标。

**我能不能就自托管 Next.js？**
能。Next.js 支持在 Node.js 服务器、Docker 容器上[自托管](https://nextjs.org/docs/app/building-your-application/deploying#self-hosting)，或作为静态导出。如果你对 Next.js 工具链满意，只是想把它跑到 Vercel 之外，自托管是最简单的路径。

**你们是怎么验证它能用的？**
测试套件包含超过 1,700 个 Vitest 测试与 380 个 Playwright E2E 测试。其中包含直接从 [Next.js 测试套件](https://github.com/vercel/next.js/tree/canary/test) 和 [OpenNext 的 Cloudflare 一致性测试套件](https://github.com/opennextjs/opennextjs-cloudflare) 移植过来的用例，覆盖路由、SSR、RSC、Server Actions、缓存、Metadata、中间件、流式渲染等。Vercel 的 [App Router Playground](https://github.com/vercel/next-app-router-playground) 也作为集成测试跑在 vinext 上。详见 [Tests](#tests) 小节与 `tests/nextjs-compat/TRACKING.md`。

**谁在审阅这些代码？**
人类与 AI agent 的混合。人类会在 PR 合并前审阅，关注行为、结构与长期方向。我们重度依赖 agent 驱动的代码审查，以便在 PR 阶段和整个代码库中捕捉问题。测试套件是主要的质量关卡。我们非常欢迎外部贡献与更深入的人工代码审查。

**为什么选择 Vite？**
Vite 是一个优秀的构建工具，拥有丰富的插件生态、一流的 ESM 支持，以及快速的 HMR。 [`@vitejs/plugin-rsc`](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-rsc) 插件通过多环境构建加入了对 React Server Components 的支持。vinext 把 Next.js 的开发体验建立在这套基础设施之上。

**它支持 Pages Router、App Router，还是两者都支持？**
两者都支持。文件系统路由、SSR、客户端水合，以及部署到 Cloudflare Workers，对两种路由器都有效。

**它面向哪个版本的 Next.js？**
Next.js 16.x。不支持旧版本中已废弃的 API。

**我能部署到 AWS/Netlify/其他平台吗？**
能。在 vinext 旁边加上 [Nitro](https://v3.nitro.build/) Vite 插件，就能部署到 Vercel、Netlify、AWS Amplify、Deno Deploy、Azure 以及[更多平台](https://v3.nitro.build/deploy)。配置方法见 [Other platforms (via Nitro)](#other-platforms-via-nitro)。对于 Cloudflare Workers，原生集成（`npx @vinext/cloudflare deploy` 或 `vp exec vinext-cloudflare deploy`）能给你最顺滑的体验。更多平台的原生适配器已在[规划中](https://github.com/cloudflare/vinext/issues/80)。

**Next.js 发布新特性时会怎样？**
我们会跟踪公开的 Next.js API 表面，并为新的稳定特性添加支持。实验性或不稳定特性的优先级较低。计划是加入对 Next.js 仓库的提交级跟踪，以便在各版本发布时保持同步。

## 部署

### Cloudflare Workers

vinext 通过 `@cloudflare/vite-plugin` 与 Cloudflare Workers 原生集成，包括通过 `cloudflare:workers` 访问 bindings、KV 缓存、图片优化，以及 `@vinext/cloudflare deploy` 的一条命令工作流。

#### 前置条件

在首次运行 `npx @vinext/cloudflare deploy` 之前，请先运行 `vinext init --platform=cloudflare` 来安装 `cf` 与 Cloudflare Vite plugin v2，创建或更新 `vite.config.*`，并生成 `cloudflare.config.ts`。

**身份认证——二选一：**

- **`cf auth login`**（本地开发推荐）——打开浏览器窗口完成认证。
- **`CLOUDFLARE_API_TOKEN` 环境变量**（CI / 非交互场景）——在 [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) 使用 **Edit Cloudflare Workers** 模板创建令牌。该模板授予了 `@vinext/cloudflare deploy` 所需的全部权限。

**账户 ID：**

在 `cloudflare.config.ts` 的 `defineConfig` 顶层、`worker` 之外设置 `accountId`。你可以在 Cloudflare 仪表盘 URL（`dash.cloudflare.com/<account-id>`）中找到你的账户 ID。

或者，设置 `CLOUDFLARE_ACCOUNT_ID` 环境变量，而不是把它硬编码进配置文件。

`@vinext/cloudflare deploy` 会校验初始化好的配置、构建应用，并
用 `cf` 部署其 Cloudflare Build Output，而不会改写项目配置。

Cloudflare 的 init 还可以在 Vite 配置中用 `imagesOptimizer()` 声明式地配置图片优化，
并向 `cloudflare.config.ts` 添加对应的 Images binding。内置的 fetch 处理器会在运行时注册
该优化器；图片优化并不是由 `@vinext/cloudflare deploy` 实现或生成的。

```bash
npx @vinext/cloudflare deploy
vp exec vinext-cloudflare deploy
npx @vinext/cloudflare deploy --env staging
vp exec vinext-cloudflare deploy --env staging
```

使用 `--env <name>` 来选择构建与部署所用的 Vite 模式。`--preview` 是 `--env preview` 的简写。

在 Response Store 的 service-binding 模式下，两个 Worker 会一起构建，但缓存 Worker 需要显式部署。在创建 init 指定的 R2 存储桶后，运行：

```sh
pnpm run build:vinext
pnpm run deploy:response-store
pnpm run deploy:vinext
```

对于 `create-vinext-app` 项目，使用 `build` 与 `deploy`，而非 `build:vinext` 与 `deploy:vinext`。仅当 Response Store 的包或配置发生变化时才重新部署它；普通的应用部署不会部署这些辅助 Worker。

init 命令还会自动探测并修复常见的迁移问题：

- 如果缺失，则向 package.json 添加 `"type": "module"`
- 用 Vite 的原生解析器自动解析 tsconfig.json 的路径别名
- 探测 MDX 用法并配置 `@mdx-js/rollup`
- 在需要时把 CJS 配置文件（postcss.config.js 等）重命名为 `.cjs`
- 探测原生 Node.js 模块（sharp、resvg、satori、lightningcss、@napi-rs/canvas）并为 Workers 自动打桩。如果你遇到其他需要打桩的模块，欢迎提 PR。

App Router 与 Pages Router 在 Workers 上都支持完整的客户端水合。

#### Cloudflare Bindings（D1、R2、KV、AI 等）

使用 `import { env } from "cloudflare:workers"` 即可在任何服务端组件、路由处理器或 Server Action 中访问 bindings。无需自定义的 worker 入口或特殊配置。

```tsx
import { env } from "cloudflare:workers";

export default async function Page() {
  const result = await env.DB.prepare("SELECT * FROM posts").all();
  return <div>{JSON.stringify(result)}</div>;
}
```

这之所以可行，是因为 `@cloudflare/vite-plugin` 在 workerd 中运行 RSC 环境，而 `cloudflare:workers` 在那里是一个原生模块。在生产构建中，该导入会被外部化，由 workerd 在运行时解析。所有绑定类型都受支持：D1、R2、KV、Durable Objects、AI、Queues、Vectorize、Browser Rendering 等。

在 `cloudflare.config.ts` 中为你的 Worker 的 `env` 添加 bindings：

```ts
import { bindings } from "cf/config";

env: {
  // ...已有的 bindings
  DB: bindings.d1({ name: "my-db" }),
  CACHE: bindings.kv(),
},
```

绑定与运行时类型会在开发与构建期间生成于 `.cloudflare/types`。请将该目录加入 `tsconfig.json`；在独立类型检查前运行 `cf workers types`。生成的类型与 Build Output 都保持 gitignore 状态。

> **注意：** 你不需要 `getPlatformProxy()`、带 `fetch(request, env)` 的自定义 worker 入口，或任何其他变通方案。`cloudflare:workers` 是 vinext 中访问 bindings 的推荐方式。

#### 流量感知预热

流量感知预热会在部署时查询 Cloudflare 的 zone 分析数据，挑选出真正有流量的路由。这些路由随后会经过 vinext 标准的、分阶段的 CDN 预热流程，包括路由解析、可缓存性检查与晋升。

```bash
npx @vinext/cloudflare deploy --traffic-aware-warm-cache                              # 预热覆盖 90% 流量的路由
vp exec vinext-cloudflare deploy --traffic-aware-warm-cache                           # 同上，配合 Vite+
npx @vinext/cloudflare deploy --traffic-aware-warm-cache --traffic-aware-coverage 95  # 更激进的覆盖率
npx @vinext/cloudflare deploy --traffic-aware-warm-cache --traffic-aware-limit 500    # 上限 500 条路由
npx @vinext/cloudflare deploy --traffic-aware-warm-cache --traffic-aware-window 48    # 使用 48 小时的分析数据
npx @vinext/cloudflare deploy --traffic-aware-warm-cache --warm-cache-target https://example.com  # 手动设置生产源站
```

需要一个自定义域名（`*.workers.dev` 上无法使用 zone 分析数据），以及具备该 zone 的 **Zone > Analytics > Read** 与 **Zone > Zone > Read** 权限的 `CLOUDFLARE_API_TOKEN`。

对于类型化配置的项目，在 `cloudflare.config.ts` 中用 `domains: ["example.com"]` 在 Worker 上声明自定义域名。生成的 Build Output 中的第一个域名会被同时用于分析与分阶段预热。Wrangler 项目则从它们配置好的路由与已部署的触发器保留域名选择。使用 `--warm-cache-target https://example.com` 可覆盖源站。添加 `--warm-cache-certify` 以要求可复用的缓存命中在晋升前被证明有效，或使用 `--no-promote` 让预热好的版本停留在 0% 流量以便验证。

单独使用流量感知标志即可应用覆盖率与路由上限。把它与 `--warm-cache` 组合则会保留完整的、构建期发现的预热结果。所有选择项与要求的详细说明见 [caching guide](https://vinext.dev/docs/guides/caching)。

此前的 `--experimental-traffic-aware-warm-cache`、`--experimental-tpr`、`--tpr-*` 名称仍作为别名保留。

#### 自定义 Vite 配置

如果你需要自定义 Vite 配置，请创建 `vite.config.ts`。vinext 会把它的配置与你的配置合并。对于使用 App Router 的 Cloudflare Workers 部署，请配置 `@cloudflare/vite-plugin`，让 RSC 环境运行在 workerd 中：

```ts
import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [
    vinext(),
    cloudflare({
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
    }),
  ],
});
```

> **不要自己注册 `@vitejs/plugin-rsc`。** 它是一个可选的 peer 依赖，因此必须在你的项目中
> _安装_，但 vinext 会在探测到 `app/` 目录时自动注册它。显式调用 `rsc()` 会导致构建失败，
> 报错 `[vinext] Duplicate @vitejs/plugin-rsc detected`。只有在你想自己掌控该注册时，
> 才向 `vinext()` 传入 `rsc: false`。

#### Module Federation（客户端）

对于客户端 Module Federation，需要在 host 与 remote 两侧都把 React 与 React DOM 配置为单例共享模块：

```ts
import { federation } from "@module-federation/vite";
import { defineConfig } from "vite";
import vinext from "vinext";

export default defineConfig({
  plugins: [
    federation({
      name: "host",
      shared: {
        react: { singleton: true },
        "react/": { singleton: true },
        "react-dom": { singleton: true },
        "react-dom/": { singleton: true },
      },
    }),
    vinext(),
  ],
});
```

在一个远程客户端组件中，读取 React hooks 之前先使用 `getVinextReact()`。vinext 会在应用模块执行前注册 host 的浏览器 React 实例，并且首次注册在远程求值与 HMR 之间保持稳定：

```tsx
"use client";

import * as React from "react";
import { getVinextReact } from "vinext/client";

const { useState } = getVinextReact(React);

export function RemoteCounter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount((value) => value + 1)}>{count}</button>;
}
```

这个桥接仅限浏览器。它不提供 App Router 的 Module Federation SSR，也不会透明地替换第三方包内部的 React 导入；兼容的 React 版本仍由 Module Federation 的 `shared` 配置负责。

完整可用的配置见 [examples](#live-examples)。

### Other platforms（via Nitro）

要部署到 Cloudflare 以外的平台，vinext 可以与 [Nitro](https://v3.nitro.build/) 作为 Vite 插件配合使用。在 Vite 配置中把 `nitro` 与 `vinext` 并列，即可部署到任意 [Nitro 支持的平台](https://v3.nitro.build/deploy)。

```ts
import { defineConfig } from "vite";
import vinext from "vinext";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [vinext(), nitro()],
});
```

```bash
npm install nitro
```

Nitro 在绝大多数 CI/CD 环境（Vercel、Netlify、AWS Amplify、Azure 等）中会自定探测部署平台，因此通常你不需要设置 preset。对于本地构建，请设置 `NITRO_PRESET` 环境变量：

```bash
NITRO_PRESET=vercel npx vite build
NITRO_PRESET=netlify npx vite build
NITRO_PRESET=deno_deploy npx vite build
```

> **要部署到 Cloudflare？** 你可以用 Nitro，但我们推荐使用原生集成（`npx @vinext/cloudflare deploy`、`vp exec vinext-cloudflare deploy`，以及 `@cloudflare/vite-plugin`）。它能通过 `cloudflare:workers` bindings、KV 缓存、图片优化和一条命令部署，提供最佳的开发体验。

<details>
<summary>Vercel</summary>

Nitro 会在 CI 中自动探测 Vercel。本地构建：

```bash
NITRO_PRESET=vercel npx vite build
```

使用 [Vercel CLI](https://vercel.com/docs/cli) 部署，或在 Vercel 仪表盘中连接你的 Git 仓库。将构建命令设为 `vite build`，输出目录设为 `.output`。

</details>

<details>
<summary>Netlify</summary>

Nitro 会在 CI 中自动探测 Netlify。本地构建：

```bash
NITRO_PRESET=netlify npx vite build
```

使用 [Netlify CLI](https://docs.netlify.com/cli/get-started/) 部署，或连接你的 Git 仓库。将构建命令设为 `vite build`。

</details>

<details>
<summary>AWS（Amplify）</summary>

Nitro 会在 CI 中自动探测 AWS Amplify。本地构建：

```bash
NITRO_PRESET=aws_amplify npx vite build
```

在 AWS Amplify 控制台中连接你的 Git 仓库。将构建命令设为 `vite build`。

</details>

<details>
<summary>Deno Deploy</summary>

```bash
NITRO_PRESET=deno_deploy npx vite build
cd .output
deployctl deploy --project=my-project server/index.ts
```

</details>

<details>
<summary>Node.js server</summary>

```bash
NITRO_PRESET=node npx vite build
node .output/server/index.mjs
```

这会产出一个独立的 Node.js 服务器。适用于 Docker、虚拟机，或任何能运行 Node 的环境。

</details>

完整的支持平台列表与各家提供商的特定配置见 [Nitro 部署文档](https://v3.nitro.build/deploy)。

## 在线示例

这些示例部署在 Cloudflare Workers 上，并在每次推送到 `main` 时更新：

| 示例                | 说明                                                                                                         | URL                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| App Router Playground | [Vercel 的 Next.js App Router Playground](https://github.com/vercel/next-app-router-playground) 跑在 vinext 上 | [app-router-playground.vinext.workers.dev](https://app-router-playground.vinext.workers.dev)                  |
| Hacker News         | HN 克隆（App Router、RSC）                                                                                    | [hackernews.vinext.workers.dev](https://hackernews.vinext.workers.dev)                                        |
| Nextra Docs         | Nextra 文档站（MDX、App Router）                                                                              | [nextra-docs-template.vinext.workers.dev](https://nextra-docs-template.vinext.workers.dev)                    |
| App Router（最小）  | Workers 上的最小 App Router                                                                                   | [app-router-cloudflare.vinext.workers.dev](https://app-router-cloudflare.vinext.workers.dev)                  |
| Pages Router（最小）| Workers 上的最小 Pages Router                                                                                 | [pages-router-cloudflare.vinext.workers.dev](https://pages-router-cloudflare.vinext.workers.dev)              |
| Static export       | [混合 App/Pages Router 站点](https://github.com/cloudflare/vinext/tree/main/examples/static-export)，仅作为静态资源提供 | [static-export.vinext.workers.dev](https://static-export.vinext.workers.dev)                                  |
| RealWorld API       | REST API 路由示例                                                                                             | [realworld-api-rest.vinext.workers.dev](https://realworld-api-rest.vinext.workers.dev)                        |
| Benchmarks Dashboard| 构建性能随时间跟踪（基于 D1）                                                                                 | [vinext.dev/benchmarks](https://vinext.dev/benchmarks)                                                        |
| App Router + Nitro  | 通过 Nitro 部署的 App Router（多平台）                                                                        | [examples/app-router-nitro](https://github.com/cloudflare/vinext/tree/main/examples/app-router-nitro)         |

## API 覆盖

约 94% 的 Next.js 16 API 表面已获得完整或局部支持。剩余的缺口是有意为之的桩（针对已废弃特性），再加上 Partial Prerendering 与 Cache Components。Next.js 16 把 PPR 重做成了 `"use cache"`；vinext 为该指令实现了文件级与函数级缓存，但完整的 `cacheComponents` 行为仍不完整——见[正在解决的已知缺口](#known-gaps-were-working-on)。

> ✅ = 完整实现 | 🟡 = 局部实现（运行时行为正确，部分构建期优化缺失） | ⬜ = 有意为之的桩/空操作

### 模块垫片

每一个 `next/*` 导入都被垫片为一个 Vite 兼容的实现。

| 模块                 |     | 说明                                                                                                                       |
| -------------------- | --- | -------------------------------------------------------------------------------------------------------------------------- |
| `next/link`          | ✅  | 全部 props，包括 `prefetch`（IntersectionObserver）、`onNavigate`、滚动恢复、`basePath`、`locale`                            |
| `next/image`         | 🟡  | 远程图片通过 [@unpic/react](https://unpic.pics)（28 个 CDN）。本地图片通过 `<img>` + srcSet。无构建期优化/缩放             |
| `next/head`          | ✅  | SSR 收集 + 客户端 DOM 操作                                                                                                  |
| `next/router`        | ✅  | `useRouter`、`Router` 单例、事件、客户端导航、SSR 上下文、i18n                                                               |
| `next/navigation`    | ✅  | `usePathname`、`useSearchParams`、`useParams`、`useRouter`、`redirect`、`notFound`、`forbidden`、`unauthorized`              |
| `next/server`        | ✅  | `NextRequest`、`NextResponse`、`NextURL`、cookies、`userAgent`、`after`、`connection`、`URLPattern`                          |
| `next/headers`       | ✅  | 异步的 `headers()`、`cookies()`、`draftMode()`                                                                              |
| `next/dynamic`       | ✅  | `ssr: true`、`ssr: false`、`loading` 组件                                                                                  |
| `next/script`        | ✅  | 全部 4 种策略（`beforeInteractive`、`afterInteractive`、`lazyOnload`、`worker`）                                            |
| `next/font/google`   | 🟡  | 运行时 CDN 加载。无自托管、字体子集化或兜底度量                                                                              |
| `next/font/local`    | 🟡  | 运行时 `@font-face` 注入。不在构建时提取                                                                                    |
| `next/og`            | ✅  | 通过 `@vercel/og`（Satori + resvg）生成 OG 图片                                                                             |
| `next/cache`         | ✅  | `revalidateTag`、`revalidatePath`、`unstable_cache`、可插拔的 `CacheHandler`、带 `cacheLife()` 与 `cacheTag()` 的 `"use cache"` |
| `next/form`          | ✅  | GET 表单拦截 + POST Server Action 委托                                                                                      |
| `next/legacy/image`  | ✅  | 把旧版 props 翻译成现代 Image                                                                                               |
| `next/error`         | ✅  | 默认错误页组件                                                                                                              |
| `next/config`        | ✅  | `getConfig` / `setConfig`                                                                                                   |
| `next/document`      | ✅  | `Html`、`Head`、`Main`、`NextScript`                                                                                        |
| `next/constants`     | ✅  | 全部阶段常量                                                                                                                |
| `next/amp`           | ⬜  | 空操作（AMP 已废弃）                                                                                                        |
| `next/web-vitals`    | ⬜  | 空操作（直接使用 `web-vitals` 库）                                                                                          |

### 路由

| 特性                                 |     | 说明                                                                                                                       |
| ------------------------------------ | --- | -------------------------------------------------------------------------------------------------------------------------- |
| 文件系统路由（`pages/`）             | ✅  | 自动扫描，文件变更时热重载                                                                                                  |
| 文件系统路由（`app/`）               | ✅  | 页面、路由、布局、模板、loading、error、not-found、forbidden、unauthorized                                                  |
| 动态路由 `[param]`                   | ✅  | 两种路由器                                                                                                                  |
| 全捕获 `[...slug]`                   | ✅  | 两种路由器                                                                                                                  |
| 可选全捕获 `[[...slug]]`             | ✅  | 两种路由器                                                                                                                  |
| 路由分组 `(group)`                   | ✅  | 对 URL 透明，布局仍生效                                                                                                     |
| 平行路由 `@slot`                     | ✅  | 发现、布局 props、`default.tsx`、继承的插槽                                                                                 |
| 拦截路由                             | ✅  | `(.)`、`(..)`、`(..)(..)`、`(...)` 约定                                                                                     |
| 路由处理器（`route.ts`）             | ✅  | 具名 HTTP 方法、自动 OPTIONS/HEAD、cookie 附加                                                                              |
| 中间件                               | ✅  | `middleware.ts` 与 `proxy.ts`（Next.js 16）。匹配模式（字符串、数组、正则、`:param`、`:path*`、`:path+`）                   |
| i18n 路由                            | 🟡  | Pages Router 的 locale 前缀、Accept-Language 探测、NEXT_LOCALE cookie。无基于域名的路由                                    |
| `basePath`                           | ✅  | 应用于各处——URL、Link、Router、导航 hooks                                                                                  |
| `trailingSlash`                      | ✅  | 308 重定向到规范形式                                                                                                        |

### 服务端特性

| 特性                                       |     | 说明                                                                                                |
| ------------------------------------------ | --- | --------------------------------------------------------------------------------------------------- |
| SSR（Pages Router）                        | ✅  | 流式渲染、`_app`/`_document`、`__NEXT_DATA__`、水合                                                 |
| SSR（App Router）                          | ✅  | RSC 流水线、嵌套布局、流式渲染、面向客户端组件的导航上下文                                           |
| `getStaticProps`                           | ✅  | props、redirect、notFound、revalidate                                                                 |
| `getStaticPaths`                           | ✅  | `fallback: false`、`true`、`"blocking"`                                                               |
| `getServerSideProps`                       | ✅  | 完整上下文（含 locale）                                                                               |
| ISR                                        | ✅  |  stale-while-revalidate、可插拔的 `CacheHandler`、后台再生                                            |
| Server Actions（`"use server"`）           | ✅  | Action 执行、FormData、变更后重渲染、Action 内的 `redirect()`                                         |
| React Server Components                    | ✅  | 通过 `@vitejs/plugin-rsc` 实现。`"use client"` 边界正确生效                                          |
| 流式 SSR                                   | ✅  | 两种路由器                                                                                           |
| Metadata API                               | ✅  | `metadata`、`generateMetadata`、`viewport`、`generateViewport`、标题模板                              |
| `generateStaticParams`                     | ✅  | 配合 `dynamicParams` 强制校验                                                                         |
| Metadata 文件路由                          | ✅  | sitemap.xml、robots.txt、manifest、favicon、OG 图片（静态 + 动态）                                    |
| 静态导出（`output: 'export'`）             | ✅  | 为所有路由生成静态 HTML/JSON                                                                          |
| Standalone 输出（`output: 'standalone'`）  | ✅  | 生成带 `server.js`、构建产物与运行时依赖的 `dist/standalone`                                          |
| `connection()`                             | ✅  | 强制动态渲染                                                                                         |
| `"use cache"` 指令                         | ✅  | 文件级与函数级。`cacheLife()` 配置文件、`cacheTag()`、stale-while-revalidate                          |
| `instrumentation.ts`                       | ✅  | `register()`、`onRequestError()`，以及 [framework tracing](https://github.com/cloudflare/vinext/blob/main/docs/tracing.mdx) |
| 路由段配置                                 | 🟡  | `revalidate`、`dynamic`、`dynamicParams`、`runtime`（非位置相关）。无 `preferredRegion`               |

### 配置

| 特性                                           |     | 说明                                                                                                                                                              |
| ---------------------------------------------- | --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `next.config.js` / `.ts` / `.mjs`              | ✅  | 函数式配置、phase 参数                                                                                                                                             |
| `rewrites` / `redirects` / `headers`           | ✅  | 所有 phase、参数插值                                                                                                                                               |
| 环境变量（`.env*`、`NEXT_PUBLIC_*`）           | ✅  | 自动加载 Next.js 风格的 dotenv 文件；仅 public 变量会被内联                                                                                                        |
| `images` 配置                                  | 🟡  | 会被解析，但不用于优化                                                                                                                                             |
| `experimental.optimizePackageImports`          | ✅  | 在 RSC/SSR 环境中把 barrel 导入改写为直接的子模块导入。一组默认集合（lucide-react、date-fns、radix-ui、antd、MUI 等）始终被优化。在此添加包名以扩展列表。          |
| `vinext({ nextConfig })`                       | ✅  | 从 `vite.config.*` 内联 Next 风格配置。支持对象形式与函数形式配置。提供时，会覆盖根 `next.config.*`。                                                               |
| `vinext({ react: { compiler: true } })`        | ✅  | React Compiler 自动记忆化。需要 `@vitejs/plugin-react` 6.1+ 与可选的 `oxc-transform-react` 包。                                                                     |

### React Compiler

vinext 会自动注册 `@vitejs/plugin-react`，因此 React Compiler 通过同一个 `react` 选项开启：

```ts
import { defineConfig } from "vite";
import vinext from "vinext";

export default defineConfig({
  plugins: [vinext({ react: { compiler: true } })],
});
```

转换本身单独发布，因此请一并安装：

```bash
npm install -D oxc-transform-react
```

这需要 `@vitejs/plugin-react` 6.1.0 或更高版本。旧版本会接受该选项但将其丢弃，因此 vinext 会抛出一个可操作的错误，而不是让编译器被悄悄禁用。该编译器只在客户端环境运行。

一个注意点：那些 JSX 在流水线更早阶段被降级的模块不会被记忆化。它们能正常构建与运行，只是错过了自动记忆化：

- 普通 `.js` 文件中的 JSX，会被 `vinext:jsx-in-js` 先编译，编译器才能解析它们。重命名为 `.jsx` 或 `.tsx` 即可获得记忆化。
- 使用 `<style jsx>` 的组件，会先由 `vinext:styled-jsx` 通过 Next.js 的 SWC 转换编译，然后编译器才运行。

### 环境变量加载（`.env*`）

vinext 会自动为 `dev`、`build`、`start`、`deploy` 加载 dotenv 文件。

Vite 会在插件钩子之前、不论导入顺序地求值所有静态配置导入。
`vinext dev` 与 `vinext build` 会在移交给 Vite 之前，从项目根目录预加载 dotenv，
从而保留旧 CLI 在配置期的这种行为。直接用 `vite dev` 与 `vite build` 则不会。为了
让配置期的值在两种命令下都可用，请在配置工厂中使用 Vite 的
[`loadEnv(mode, process.cwd(), "")`](https://vite.dev/config/#using-environment-variables-in-config)，
并读取它返回的值，而不是在静态导入中依赖 `process.env`。空前缀会包含仅服务端的变量；
如果你有自己的 `envDir`，请用它替换 `process.cwd()`。

加载顺序与 Next.js 一致（优先级从高到低）：

1. 已有的 `process.env` 值（shell/CI）
2. `.env.<mode>.local`
3. `.env.local`（在 mode 为 `test` 时跳过）
4. `.env.<mode>`
5. `.env`

模式：

- `vite dev` 使用 `development`
- `vite build`、`vinext start`、`@vinext/cloudflare deploy` 使用 `production`
- `vinext dev` 与 `vinext build` 使用对应的模式，包括 `--mode` 覆盖

支持变量展开（`$VAR` / `${VAR}`）。

客户端暴露始终保持显式：

- `NEXT_PUBLIC_*` 变量会被内联供浏览器使用
- `next.config.js` 的 `env` 项也会被内联
- 其他环境变量保持仅服务端，除非你通过 Vite 显式暴露（例如 `VITE_*` + `import.meta.env`）

覆盖行为：

- 要覆盖任意 `.env*` 值，请在运行 vinext 之前于你的 shell/CI 环境中设置它。已有的 `process.env` 始终优先。

### 缓存

缓存是可插拔的。默认的 `MemoryCacheHandler` 开箱即用。在生产环境中换成你自己的后端即可。

#### 从 `vite.config` 配置缓存适配器

与其从 worker 入口以命令式方式接线缓存处理器，不如在 `vinext()` 插件配置中声明它们。`@vinext/cloudflare` 包为此附带了 Cloudflare 适配器：

- **`kvDataAdapter()`**（`@vinext/cloudflare/cache/kv-data-adapter`）——用 Workers KV 命名空间支撑 `"use cache"` 的数据缓存。
- **`workersCacheCdnAdapter()`**（`@vinext/cloudflare/cache/workers-cache-cdn-adapter`）——从 Cloudflare Workers Cache（`ctx.cache`）而非源站提供页面级 ISR。
- **`staticAssetsAdapter()`**（`@vinext/cloudflare/cache/static-assets-adapter`）——把本地预渲染的 App Router HTML/RSC 打包进 Workers Static Assets，并通过只读页面缓存提供。
- **`responseStoreAdapter()`**（`@vinext/cloudflare/cache/response-store-adapter`）——对响应与数据都使用 Workers Response Store，支持 service-binding 或自包含部署模式。两种模式的配置示例见 [config examples for both modes](https://github.com/cloudflare/vinext/blob/main/docs/caching.mdx#workers-response-store)。

KV 与 Workers Cache 适配器填充不同的槽位，可组合使用：

```ts
import { workersCacheCdnAdapter } from "@vinext/cloudflare/cache/workers-cache-cdn-adapter";
import { kvDataAdapter } from "@vinext/cloudflare/cache/kv-data-adapter";

vinext({
  cache: {
    cdn: workersCacheCdnAdapter(),
    data: kvDataAdapter(),
  },
});
```

KV 数据适配器在运行时读取 `env[binding]`。请在 `cloudflare.config.ts` 中配置它的命名空间与 Workers Cache 入口点。这里的 `existingExports` 是你当前 Worker 的 `exports` 对象，如果没有则为 `{}`：

```ts
import { bindings } from "cf/config";
import { createWorkersCacheConfig } from "@vinext/cloudflare/cache/config";

const cache = await createWorkersCacheConfig();

defineWorker({
  // ...已有的 Worker 设置
  ...cache,
  env: {
    // ...已有的 bindings
    ...cache.env,
    VINEXT_KV_CACHE: bindings.kv(),
  },
  exports: { ...existingExports, ...cache.exports },
});
```

`binding` 默认为 `VINEXT_KV_CACHE`，因此只要你的绑定名就是这个，`kvDataAdapter()` 不带选项也能工作。其他选项：`appPrefix`（为命名空间缓存键加前缀，以在单个 KV 命名空间内隔离多个应用）、`ttlSeconds`（默认 KV `expirationTtl`，默认 30 天）、`tagCacheTtlMs`（内存中标签失效缓存 TTL，默认 5s），以及 `entryCacheTtlSeconds`（可选的 KV 边缘缓存 TTL，用于条目读取；标签标记保留 KV 默认值）。

对于不可变的构建输出，配置 `prerender: true` 配合 `cache: { cdn: staticAssetsAdapter() }`。该适配器会把预渲染的 HTML、RSC 与 metadata 响应复制进配置好的客户端资源输出，并在运行时从 `ASSETS` binding 读取。写入与失效都是空操作；一次新的部署会替换掉被缓存的响应。运行 `vinext init --platform=cloudflare --cdn-cache=static-assets` 即可配置该 binding 与 Worker 优先的路由（防止直接访问私有缓存产物）；手动配置方法见 [Static Assets response cache](https://github.com/cloudflare/vinext/blob/main/docs/caching.mdx#static-assets-response-cache)。

当 Cloudflare 构建中使用 `workersCacheCdnAdapter()` 时，vinext 会输出两个 Worker
入口点，并且只在响应入口点上配置 Workers Cache。默认入口点保持缓存禁用，
以便中间件与请求期路由在每次请求上都运行。`createWorkersCacheConfig()` 会在源配置中
声明这些策略与版本元数据 binding；vinext 不会在 Cloudflare Build Output 中改写它们。
对于仅 KV 的缓存，请省略该辅助函数并保留 KV binding。适配器配置示例见
[adapter configuration examples](https://github.com/cloudflare/vinext/blob/main/docs/caching.mdx)。

生成的版本元数据 binding 让分阶段发现与预热能够验证已上传的 Worker 版本。
只有当部署需要使用自定义 binding 名时，才需要把同一个 `versionMetadataBinding`
传给 `workersCacheCdnAdapter()` 与 `createWorkersCacheConfig()`。

`vinext-cloudflare deploy --warm-cache` 默认会执行两阶段上传，
并为每个被接纳的身份做最后一次缓存填充请求。仅当你想选择第二个、仅含请求头的请求
（必须在晋升前证明每个计划中的条目都可复用）时，才添加 `--warm-cache-certify`。

数据适配器虽然可以自行存储条目并提供 HIT/STALE，但 CDN 适配器把提供服务的职责委托给 Cloudflare 的边缘：源站渲染新鲜响应并用 `Cache-Tag` 标记它们，`revalidateTag()` / `revalidatePath()` 通过 `ctx.cache.purge({ tags })` 清除边缘缓存。Workers Response Store 适配器见 [examples/response-store-demo](https://github.com/cloudflare/vinext/tree/main/examples/response-store-demo)。

响应入口点会往它的 Workers Cache URL 上加一个仅用于传输的、完整阶段
身份的摘要。这个内部键独立于 zone 的 Cache Rules，并防止不同的表示、重写或拦截
身份发生碰撞。在分阶段部署（`--warm-cache`）下，
App Router 页面的可缓存性清单会证明静态资源把查询
字符串排除在身份之外，因此页面的不同查询共享同一个条目，与 Next.js 一致。被拦截的 RSC 请求，
以及被 `next.config` 的 `headers()` 规则标记为可缓存的响应，则保留查询字符串。详见
[Query strings](https://github.com/cloudflare/vinext/blob/main/docs/caching.mdx#query-strings)。

适配器声明不会访问 Workers 运行时，因此在 bindings 不可用时，配置求值期或开发期都不会抛错。
构建器也可能提供平台特定的输出钩子；`workersCacheCdnAdapter()` 会添加响应阶段的
Worker 导出，而源配置辅助函数声明它们的缓存策略。运行时适配器（以及
它们的 `env` binding 查找）会在首次请求时惰性实例化。

注册被接入**每一个路由器与运行时**——App Router 与 Pages Router，在 Cloudflare Workers 上、在 Node.js 服务器（`vinext start`）上，以及开发期。它自我防护（每个 isolate 实例化一次）且具备韧性：如果某个适配器无法在特定运行时初始化（例如 Node 服务器上没有某个 KV binding），vinext 会记录一条警告并回退到默认处理器，而不是让请求失败。

要编写你自己的适配器，只需把一个槽位指向某个按路径指定的模块，并默认导出一个工厂函数，该函数在运行时接收 `{ env, options }` 并返回一个数据缓存 `CacheHandler`（或一个 CDN 适配器）：

```ts
vinext({
  cache: {
    data: {
      adapter: require.resolve("./my-adapter.js"),
      options: {/* … */},
    },
  },
});
```

## 不支持的内容（且以后也不会支持）

这些是有意为之的排除项。对于目前缺失但已在路线图上的内容，见上方的[正在解决的已知缺口](#known-gaps-were-working-on)。

- **Vercel 特定特性** —— `@vercel/og` 边缘运行时、Vercel Analytics 集成、Vercel KV/Blob/Postgres bindings。请使用平台等价物。
- **AMP** —— 自 Next.js 13 起已废弃。`useAmp()` 返回 `false`。
- **`next export`（旧版）** —— 请改用配置中的 `output: 'export'`。
- **Turbopack/webpack 配置** —— 这套东西跑在 Vite 上。请使用 Vite 插件，而非 webpack loader/插件。
- **`next/jest`** —— 请使用 Vitest。
- **`create-next-app` 脚手架** —— 新 vinext 项目请使用 `create-vinext-app`。
- **与未文档化行为的逐 bug 对齐** —— 如果它不在 Next.js 文档里，我们大概率不会复刻它。

## 基准测试

> **提醒：** 基准测试很难做对，而且这些还是早期结果。请将其视为方向性参考，而非定论。

这些基准测试衡量的是**编译与打包速度**，而非生产环境服务性能。Next.js 与 vinext 的默认做法有本质不同：Next.js 在构建时静态预渲染页面（构建更慢，但静态内容的生成服务更快），而 vinext 在每次请求时对所有页面做服务端渲染。为了让比较旗鼓相当，基准应用使用 `export const dynamic = "force-dynamic"` 关掉 Next.js 的静态预渲染——两个框架做着相同的工作：编译、打包，以及准备服务端渲染的路由。

基准应用是一个共享的、33 条路由的 App Router 应用（服务端组件、客户端组件、动态路由、嵌套布局、API 路由），由两种工具以相同方式构建。我们比较 Next.js（Turbopack）与 vinext（Vite 8）。Turbopack 与 Rolldown 都会跨核并行，因此在核数更多的机器上结果可能有显著差异。

我们衡量三件事：

- **生产构建时间** —— 运行 5 次，用 `hyperfine` 计时。
- **客户端包体大小** —— 每次构建的 gzip 输出。
- **开发服务器冷启动** —— 运行 10 次，随机化执行顺序。每次运行前都会清空 Vite 的依赖优化缓存。

基准测试在 GitHub CI runner（2 核 Ubuntu）上、每次合并到 `main` 时运行。发布时的数字见[发布博客文章](https://blog.cloudflare.com/vinext/)，最新结果见 **[vinext.dev/benchmarks](https://vinext.dev/benchmarks)**。

<details>
<summary>为什么包体大小会有差异？</summary>

对构建输出的分析显示了两个主要因素：

1. **Tree-shaking**：Vite/Rolldown 产出的 React+ReactDOM 包比 Next.js/Turbopack 更小。Rolldown 更激进的死代码消除贡献了整体差异的大约一半。
2. **框架开销**：Next.js 比 vinext 更轻量的客户端运行时携带了更多的客户端基础设施（路由器、Turbopack 运行时加载器、预取、错误处理）。

两个框架都交付相同的应用代码，以及相同的 RSC 客户端运行时（`react-server-dom-webpack`）。差异在于有多少 React 内部实现在 tree-shaking 后存活下来，以及每个工具额外加入了多少框架管线。

</details>

用 `node benchmarks/run.mjs --runs=5 --dev-runs=10` 复现。每个结果中都记录了确切的框架版本。

## 架构

vinext 是一个 Vite 插件，它会：

1. **解析所有 `next/*` 导入**，指向用标准 Web API 与 React 原语重新实现 Next.js API 的本地垫片模块。
2. **扫描你的 `pages/` 与 `app/` 目录**，构建一套符合 Next.js 约定的文件系统路由器。
3. **生成虚拟入口模块**，用于 RSC、SSR 与浏览器环境，负责请求路由、组件渲染与客户端水合。
4. **与 `@vitejs/plugin-rsc` 集成**，以支撑 React Server Components——处理 `"use client"` / `"use server"` 指令、RSC 流序列化，以及多环境构建。

其结果是一个标准的 Vite 应用，恰好与 Next.js API 兼容。

### Pages Router 流程

```
Request → Vite dev server middleware → Route match → getServerSideProps/getStaticProps
  → renderToReadableStream(App + Page) → HTML with __NEXT_DATA__ → Client hydration
```

### App Router 流程

```
Request → RSC entry (Vite rsc environment) → Route match → Build layout/page tree
  → renderToReadableStream (RSC payload) → SSR entry (Vite ssr environment)
  → renderToReadableStream (HTML) → Client hydration from RSC stream
```

## 项目结构

```
packages/vinext/
  src/
    index.ts              # 主插件——解析别名、配置、虚拟模块
    cli.ts                # vinext CLI（dev/build/start/deploy/init/check/lint）
    check.ts              # 兼容性扫描器
    deploy.ts             # Cloudflare Workers 部署
    init.ts               # vinext init——Next.js 应用的一条命令迁移
    client/
      entry.ts            # 客户端水合入口
    routing/
      pages-router.ts     # Pages Router 文件系统扫描器
      app-router.ts       # App Router 文件系统扫描器
    entries/
      app-rsc-entry.ts    # App Router RSC 入口生成器
      app-ssr-entry.ts    # App Router SSR 入口生成器
      app-browser-entry.ts # App Router 浏览器入口生成器
      pages-server-entry.ts # Pages Router SSR 入口生成器
      pages-client-entry.ts # Pages Router 客户端入口生成器
    server/
      dev-server.ts       # Pages Router SSR 请求处理器
      prod-server.ts      # 带压缩的生产服务器
      api-handler.ts      # Pages Router API 路由
      isr-cache.ts        # ISR 缓存层
      middleware.ts        # middleware.ts / proxy.ts 运行器
      metadata-routes.ts  # 基于文件的 metadata 路由扫描器
      instrumentation.ts  # instrumentation.ts 支持
    shims/                # 每个 next/* 模块一个文件（33 个垫片 + 6 个内部）
    build/
      static-export.ts    # output: 'export' 支持
    utils/
      project.ts          # 共享项目工具（ESM、CJS、包管理器探测）
    config/
      next-config.ts      # next.config.js 加载器
      config-matchers.ts  # 配置匹配工具

tests/
  *.test.ts               # Vitest 单元 + 集成测试
  nextjs-compat/          # 从 Next.js 测试套件移植过来的测试
  fixtures/               # 测试应用（pages-basic、app-basic、ecosystem libs）
  e2e/                    # Playwright E2E 测试（5 个项目）

examples/                 # 已部署的演示应用（见上方 Live Examples）
```

## 测试

```bash
pnpm test             # Vitest 单元 + 集成测试
pnpm run test:e2e     # Playwright E2E 测试（5 个项目）
pnpm run check        # 格式化、lint 与类型检查
pnpm run lint         # 仅 lint（类型感知的 oxlint）
pnpm run fmt          # 格式化（oxfmt）
pnpm run fmt:check    # 不做写入地检查格式化
```

E2E 测试覆盖 Pages Router（dev + 生产）、App Router（dev），以及通过 `wrangler dev` 在 Cloudflare Workers 上运行的两种路由器。

[Vercel App Router Playground](https://github.com/vercel/next-app-router-playground) 作为集成测试跑在 vinext 上——在线地址见 [app-router-playground.vinext.workers.dev](https://app-router-playground.vinext.workers.dev)。

## 本地搭建（从源码）

如果你是从仓库工作，而不是从 npm 安装：

```bash
git clone https://github.com/cloudflare/vinext.git
cd vinext
pnpm install
pnpm run build
```

这会把 vinext 包构建到 `packages/vinext/dist/`。要进行活跃开发，请使用 `pnpm --filter vinext run dev` 在变更时重新构建。

要针对一个外部的 Next.js 应用使用它，请链接构建好的包：

```bash
# 在你的 Next.js 项目目录下：
pnpm link /path/to/vinext/packages/vinext
```

或者把它作为文件依赖加入你的 `package.json`：

```json
{
  "dependencies": {
    "vinext": "file:/path/to/vinext/packages/vinext"
  }
}
```

vinext 的 peer 依赖为 `react ^19.2.6`、`react-dom ^19.2.6`、`react-server-dom-webpack ^19.2.6`，以及 `vite ^8.0.0`。然后把脚本里的 `next` 换成 `vinext`，照常运行即可。

## 贡献

本项目正在积极开发中。欢迎提 issue 与 PR。

### CI

当你打开一个 PR 时，CI（check、Vitest、Playwright E2E）会自动运行。首次贡献者需要一位维护者的人工批准，之后的 PR 则无需干预即可运行。

部署预览（把示例构建并部署到 Cloudflare Workers）只对推送到主仓库的分支运行。如果你是 Cloudflare 员工，请把你的分支推到主仓库而不是 fork，这样预览会自动部署。对于 fork 的 PR，维护者可以评论 `/deploy-preview` 来触发部署并贴出预览 URL。

### 报告 Bug

如果你的 Next.js 应用出现了问题，请提交一个 issue——我们想了解情况。

在此之前，试着把一个 AI agent 指向这个问题。用 Claude Code、Cursor、OpenCode 或你常用的工具打开你的项目，让它去弄清楚为什么你的应用跑不通 vinext。根据我们的经验，agent 非常擅长顺着 vinext 源码追踪，定位缺口或 bug，并且常常能产出修复，或至少给出清晰的判断。一个包含"agent 发现了什么"的 issue，远比"它跑不通"更有可操作性。

哪怕只是部分诊断也有帮助——堆栈跟踪、涉及哪个 `next/*` 导入、是 dev 还是生产构建问题、App Router 还是 Pages Router。上下文越多，我们修得越快。

## 许可证

MIT
