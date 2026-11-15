# Demo：课堂起点

这是 Tech Share 开始时打开的版本。以下准备已经完成：

- 创建 SvelteKit TypeScript 项目。
- 安装项目依赖。
- 安装 `@vercel/blob`。
- 准备不会泄漏 Token 的 `.env.example`。
- 提前创建空白的 `src/routes/api/blob/+server.ts`，课堂上只需粘贴代码。
- 保留一个可以正常运行的最小页面。

## 课堂文件已经全部准备好

| 文件 | Demo 中的状态 | 课堂操作 |
| --- | --- | --- |
| `.env.example` | 已创建，只有空白凭据占位符 | 不修改 |
| `src/env.ts` | 已完成环境变量初始化 | 不修改 |
| `src/routes/+page.svelte` | 已包含最原始页面 | Stage 1 替换代码 |
| `src/routes/api/blob/+server.ts` | 已创建，为空文件 | Stage 1 直接粘贴代码 |

Stage 2–4 都是在这两个已有的 route 文件中继续添加代码，不会再创建任何文件或文件夹。

## 首次运行

Git Bash：

```bash
npm install
cp .env.example .env.local
npm run dev -- --open
```

PowerShell：

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev -- --open
```

请逐行执行命令，不要复制终端提示符 `$`，也不要在行末添加 `\`。

然后打开 `.env.local`，填入你自己的 Vercel Blob 凭据。不要提交这个文件。

## 从空目录重新完成初始化

```bash
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
