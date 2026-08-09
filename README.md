# OronBox Docs

OronBox 的官网与文档站，基于 [Fumadocs](https://fumadocs.dev) 构建。

## 技术栈

- Next.js 16 / React 19 / TypeScript
- Fumadocs 16（MDX 内容 + 国际化）
- Tailwind CSS 4

## 开发

```bash
pnpm install
pnpm dev
```

打开 http://localhost:3000 查看。

## 内容

四个板块，内容在 `content/` 下：

| 板块 | 路径 | 内容 |
| --- | --- | --- |
| 用户文档 | `content/user/` | 安装、连接设备、账号、资源库、固件、CLI |
| 创作者文档 | `content/creator/` | 资源包格式、提交审核、发布 |
| 插件开发 | `content/plugins/` | 插件包、运行时、权限、API |
| 关于 | `content/about/` | 项目介绍、开源、法律文档链接 |

国际化使用 dot parser：中文是默认语言（`index.mdx`，URL 无前缀），英文为 `index.en.mdx`（URL 带 `/en`）。

## 首页

首页是官网风格的自定义页面：`src/app/[lang]/page.tsx`，样式与设计令牌在 `src/app/global.css`（Material 3 tonal-spot 色板，种子色 `#6750A4`）。

## 验证

```bash
pnpm types:check
pnpm build
```
