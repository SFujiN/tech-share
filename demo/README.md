# Demo：课堂起点

这是 Tech Share 开始时打开的版本。以下准备已经完成：

- 创建 SvelteKit TypeScript 项目。
- 安装项目依赖。
- 安装 `@vercel/blob`。
- 准备不会泄漏 Token 的 `.env.example`。
- 保留一个可以正常运行的最小页面。

## 首次运行

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev -- --open
```

然后打开 `.env.local`，填入你自己的 Vercel Blob 凭据。不要提交这个文件。

## 从空目录重新完成初始化

```powershell
npx sv create blob-demo
cd blob-demo
npm install
npm install @vercel/blob
npm run dev
```

创建 `.env.local`：

```env
BLOB_READ_WRITE_TOKEN=your_token_here
```

课堂需要复制的 Stage 1–4 代码见 [`../finial/README.md`](../finial/README.md)。
