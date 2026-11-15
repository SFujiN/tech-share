# Finial：Cloud Photo Gallery 完整版

这份指南从 [`../demo`](../demo/) 开始，按课堂演示顺序实现 Vercel Blob Cloud Photo Gallery。

本次现场 Coding 的重点是云存储后端。文件选择、按钮、上传请求、图片预览、Gallery 和 Delete 按钮都已经放进 `demo`；课堂上不需要粘贴大段前端代码，只需要逐步补上 `put()`、`list()` 和 `del()`。

## 课堂流程

| Stage | 演示结果 | 现场加入的核心代码 |
| --- | --- | --- |
| 0. Setup | 项目运行并连接 Blob Store | 不写代码 |
| 1. Upload | 上传图片并获得云端 URL | `put()` |
| 2. Display | 用 Blob URL 直接显示图片 | 不写代码，只讲解已有 `<img>` |
| 3. List | 加载所有已上传图片 | `list()` |
| 4. Delete | 从 Gallery 删除图片 | `del()` |
| 5. Advanced | 对比 Server Upload 与 Client Upload | 只讲解 |

建议把 Stage 1–4 控制在 10–12 分钟，Stage 5 用 2–3 分钟解释架构。

## Stage 0：提前完成准备工作

### 0.1 创建干净的练习副本

在仓库根目录执行。请逐行输入，不要复制终端提示符 `$`，也不要在行末添加 `\`。

Git Bash：

```bash
rm -rf -- practice
cp -r demo practice
cd practice
npm install
cp .env.example .env.local
```

PowerShell：

```powershell
Remove-Item -Recurse -Force practice
Copy-Item -Recurse demo practice
cd practice
npm install
Copy-Item .env.example .env.local
```

删除旧 `practice` 会同时删除其中的 `.env.local` 和练习修改。需要保留凭据时，先把值记录到安全位置。

后面的操作全部在 `practice` 中完成，原始 `demo` 保持不变。`practice/` 已被仓库根目录的 `.gitignore` 忽略。

### 0.2 连接 Vercel Blob Store

1. 在 Vercel Dashboard 创建或选择一个 Project。
2. 打开该 Project 的 Storage 页面并创建 Blob Store。
3. 选择 **Public**，因为页面会把 Blob URL 直接放进 `<img>`。
4. 将 Blob Store 连接到 Project。
5. 获取本地开发需要的环境变量。

把凭据写入 `practice/.env.local`：

```env
BLOB_READ_WRITE_TOKEN=your_real_token_here
```

也可以安装 Vercel CLI 后，在 `practice` 中执行：

```bash
vercel link
vercel env pull .env.local
```

Vercel 在 2026 年为新连接逐步采用 OIDC。如果 Dashboard 没有显示长期 Token，请使用 Dashboard 当前提供的 Project 连接方式和最新版 Vercel CLI。无论采用哪种方式，都不要把 `.env.local` 上传到 GitHub。

### 0.3 启动服务器并在 VS Code 中预览

```bash
npm run dev
```

不要添加 `--open`。在 VS Code 中按 `Ctrl + Alt + /` 打开 Integrated Browser，然后访问终端显示的 localhost 地址。端口通常是 `5173`，但应以终端实际地址为准。

初始页面已经有以下界面：

- 图片选择框和 Upload 按钮；
- 上传成功或失败提示；
- 上传图片预览；
- Load Gallery 按钮；
- Gallery 卡片和 Delete 按钮。

此时选择图片并点击 Upload，会看到 “Complete the Stage 1 upload code first”。这说明前端请求和后端接口骨架都已经连通，只有真正的 Blob 上传尚未实现。

### 0.4 课堂文件状态

| 文件 | 开始时的状态 | 课堂操作 |
| --- | --- | --- |
| `src/routes/+page.svelte` | 完整课堂界面和所有前端请求 | 无需修改 |
| `src/routes/api/blob/+server.ts` | POST、GET、DELETE 骨架及输入校验 | 只补三个 Blob SDK 调用 |
| `src/env.ts` | 已完成私有环境变量声明 | 无需修改 |
| `.env.example` | 凭据模板 | 无需修改 |

课堂现场不需要创建文件、文件夹，也不需要粘贴前端代码。

## Stage 1：Upload an Image

目标：选择一张图片，点击 Upload，使用 `put()` 上传并获得云端 URL。

打开 `src/routes/api/blob/+server.ts`。

### 1.1 加入两个导入

放在现有 `RequestHandler` 导入下面：

```ts
import { put } from '@vercel/blob';
import { BLOB_READ_WRITE_TOKEN } from '$app/env/private';
```

### 1.2 用 `put()` 替换临时响应

找到 POST 接口末尾带有 `Stage 1` 注释的临时响应，只把那段临时响应替换为：

```ts
const blob = await put(`tech-share/${file.name}`, file, {
  access: 'public',
  addRandomSuffix: true,
  token: BLOB_READ_WRITE_TOKEN
});

return Response.json({
  url: blob.url,
  pathname: blob.pathname
});
```

这就是 Stage 1 需要现场粘贴的主要代码。已有骨架已经负责读取 `FormData`，并限制为小于 4 MB 的 JPG、PNG 或 WebP。

`addRandomSuffix: true` 会避免同名文件互相覆盖。`tech-share/` 是这个 Demo 使用的 Blob 路径前缀。

保存后选择图片并点击 Upload。页面已有的前端会自动：

1. 把图片放入 `FormData`；
2. 向 `/api/blob` 发送 POST 请求；
3. 读取后端返回的 URL；
4. 显示成功提示和链接。

## Stage 2：Display the Image

目标：说明 Public Blob URL 可以直接作为网页图片地址。

这一阶段不修改代码。Stage 1 上传成功后，页面已经使用以下已有代码显示图片：

```svelte
<img class="preview" src={imageUrl} alt="Uploaded preview" />
```

现场可以点击 “Open uploaded file”，或复制 URL 在另一个标签页打开，并解释：

> The image is stored in Vercel Blob, not in our local project or browser memory.

因为 Blob Store 是 Public，浏览器可以直接读取这个 URL。前端只保存 URL，不保存图片文件本身。

## Stage 3：List All Images

目标：使用 `list()` 读取 `tech-share/` 中已经上传的图片。

前端的 Load Gallery 按钮和 `loadImages()` 请求已经准备好，只需要实现后端 GET。

### 3.1 修改 SDK 导入

把：

```ts
import { put } from '@vercel/blob';
```

改成：

```ts
import { list, put } from '@vercel/blob';
```

### 3.2 用 `list()` 替换空数组

在 GET 接口中找到带有 `Stage 3` 注释的 `return Response.json([]);`，将它替换为：

```ts
const { blobs } = await list({
  prefix: 'tech-share/',
  limit: 30,
  token: BLOB_READ_WRITE_TOKEN
});

return Response.json(
  blobs.map(({ url, pathname }) => ({
    url,
    pathname
  }))
);
```

保存后点击 Load Gallery。已有前端会请求 GET `/api/blob`，并把返回的每个 `url` 和 `pathname` 渲染成图片卡片。

上传几张图片、刷新页面后再次点击 Load Gallery。图片仍然存在，说明数据位于持久化云存储中，而不是只存在于当前浏览器状态。

## Stage 4：Delete an Image

目标：使用 `del()` 删除选中的 Blob。

每张 Gallery 卡片的 Delete 按钮和前端 DELETE 请求已经准备好，只需要实现后端删除操作。

### 4.1 修改 SDK 导入

把：

```ts
import { list, put } from '@vercel/blob';
```

改成：

```ts
import { del, list, put } from '@vercel/blob';
```

### 4.2 用 `del()` 替换临时响应

DELETE 接口已经读取并检查 `pathname`，确保它以 `tech-share/` 开头。找到带有 `Stage 4` 注释的临时响应，将它替换为：

```ts
await del(pathname, {
  token: BLOB_READ_WRITE_TOKEN
});

return Response.json({ success: true });
```

保存后点击任意图片的 Delete。已有前端会：

1. 把 `pathname` 发送给 DELETE `/api/blob`；
2. 等待删除完成；
3. 再次调用 `loadImages()`；
4. 立即刷新 Gallery。

Vercel CDN 或浏览器中的旧 URL 可能短暂保留缓存，但 Blob 已从列表中删除。

## Stage 5：Advanced Concepts

这一部分只讲解，不现场复制代码。

### Server Upload

```text
Browser → SvelteKit Server → Vercel Blob
```

- 实现简单，适合本次小图片 Demo。
- 文件先经过 Vercel Function。
- Vercel Function 的请求体上限是 4.5 MB，所以 Demo 主动限制为 4 MB。

### Client Upload

```text
Browser ───────────────→ Vercel Blob
   └── 请求上传授权 ──→ Server
```

- Server 只负责授权。
- Browser 直接把文件传给 Blob。
- 适合超过 4.5 MB 的图片、视频和其他大文件。

## 最终检查

在 `practice` 目录运行：

```bash
npm run check
npm run build
```

预期结果：

- `npm run check` 为 0 errors、0 warnings；
- `npm run build` 成功；
- Upload 会显示新图片和 Blob URL；
- Load Gallery 会显示 `tech-share/` 中的图片；
- Delete 会把图片从 Gallery 移除。

如果不需要逐步实现，可以直接运行完整的 `finial`：

Git Bash：

```bash
cd ../finial
npm install
cp .env.example .env.local
npm run dev
```

PowerShell：

```powershell
cd ../finial
npm install
Copy-Item .env.example .env.local
npm run dev
```

然后在 VS Code Integrated Browser 中打开终端显示的 localhost 地址。

## 课堂结束时的三句话

1. **What is Vercel Blob?** Cloud object storage for files such as images, videos, and documents.
2. **How do we use it?** `put()` to upload, `list()` to retrieve the file list, and `del()` to delete.
3. **Why do we need it?** It provides persistent file storage without managing our own storage infrastructure.

## Demo 的限制

这是课堂演示代码，没有身份验证、用户授权或限流。不要把上传与删除接口直接作为公开生产服务使用。
