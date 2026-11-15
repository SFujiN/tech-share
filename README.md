# Vercel Blob Tech Share

这个仓库用于课堂 Tech Share：通过一个 SvelteKit Cloud Photo Gallery，现场演示如何把图片上传到 Vercel Blob、通过 URL 显示图片、读取云端文件列表，以及删除文件。

## 仓库结构

- [`demo/`](demo/)：课堂开始时打开的版本。SvelteKit 和 `@vercel/blob` 已完成初始化，但还没有实现 Gallery 功能。
- [`finial/`](finial/)：完整的调试版本，包含 `put()`、`list()` 和 `del()`。
- [`finial/README.md`](finial/README.md)：从 `demo` 逐步做到 `finial` 的现场复制粘贴指南。

本地练习副本 `practice/` 已在仓库根目录的 `.gitignore` 中忽略，避免把课堂修改或 `.env.local` 凭据误提交到 Git。

> `finial` 是本次项目约定的目录名称，因此保留这一拼写。

## Demo 最终效果

最终页面支持：

1. 选择一张 JPG、PNG 或 WebP 图片。
2. 将小于 4 MB 的图片上传到 Vercel Blob。
3. 显示 Blob 返回的公开 URL 和图片。
4. 加载 `tech-share/` 目录下的云端图片。
5. 从 Gallery 中删除图片。

## 快速开始

以下命令需要逐行执行。不要复制终端提示符 `$`，也不要在每行末尾添加 `\`。

### Git Bash

课堂起点：

```bash
cd demo
npm install
cp .env.example .env.local
npm run dev -- --open
```

最终版本：

```bash
cd finial
npm install
cp .env.example .env.local
npm run dev -- --open
```

### PowerShell

课堂起点：

```powershell
cd demo
npm install
Copy-Item .env.example .env.local
npm run dev -- --open
```

最终版本：

```powershell
cd finial
npm install
Copy-Item .env.example .env.local
npm run dev -- --open
```

运行上传、列表和删除功能前，需要先在 `.env.local` 中配置自己的 Vercel Blob 凭据。详细配置过程见 [`finial/README.md`](finial/README.md)。

## 安全说明

- `.env.local` 已被 Git 忽略。
- 不要把真实的 `BLOB_READ_WRITE_TOKEN` 写进代码、README、截图或 Git 提交。
- 仓库中的 `.env.example` 只有空白占位符。
- 这是没有登录验证的课堂 Demo，不应直接作为公开生产上传接口使用。
