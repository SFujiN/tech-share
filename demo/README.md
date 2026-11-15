# Demo：课堂起点

这是 Tech Share 开始时打开的版本。以下准备已经完成：

- 创建 SvelteKit TypeScript 项目。
- 安装项目依赖。
- 安装 `@vercel/blob`。
- 准备不会泄漏 Token 的 `.env.example`。
- 提前完成文件选择、Upload 按钮、请求和结果提示界面。
- 提前完成后端表单读取及图片校验，课堂上只粘贴 `put()` 核心代码。

## 课堂文件已经全部准备好

| 文件 | Demo 中的状态 | 课堂操作 |
| --- | --- | --- |
| `.env.example` | 已创建，只有空白凭据占位符 | 不修改 |
| `src/env.ts` | 已完成环境变量初始化 | 不修改 |
| `src/routes/+page.svelte` | 已包含上传、预览、Gallery、删除界面及全部前端请求 | Stage 1–4 无需修改 |
| `src/routes/api/blob/+server.ts` | 已包含 POST、GET、DELETE 骨架和输入校验 | Stage 1、3、4 分别加入 `put()`、`list()`、`del()` |

Stage 2 只演示已有图片预览，不写代码；Stage 3 和 Stage 4 也只修改现有的后端文件。课堂上不会创建文件、文件夹，也不会粘贴前端代码。

## 首次运行

Git Bash：

```bash
npm install
cp .env.example .env.local
npm run dev
```

PowerShell：

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

请逐行执行命令，不要复制终端提示符 `$`，也不要在行末添加 `\`。

然后打开 `.env.local`，填入你自己的 Vercel Blob 凭据。不要提交这个文件。

在 VS Code 中按 `Ctrl + Alt + /` 打开内置浏览器，访问终端显示的 localhost 地址。端口通常是 `5173`，请以终端实际地址为准。

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
