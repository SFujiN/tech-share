# Finial：Cloud Photo Gallery 完整版

这份指南从 [`../demo`](../demo/) 开始，按课堂演示顺序逐步实现 Vercel Blob Cloud Photo Gallery。每完成一个 Stage，页面都会获得一个可以立即演示的新功能。

## 课堂流程

| Stage | 演示结果 | Vercel Blob 知识点 |
| --- | --- | --- |
| 0. Setup | 项目可以运行并连接 Blob Store | Blob Storage、环境变量 |
| 1. Upload | 上传图片并获得 URL | `put()` |
| 2. Display | 在页面显示云端图片 | Public URL |
| 3. List | 加载所有已上传图片 | `list()`、prefix |
| 4. Delete | 从 Gallery 删除图片 | `del()` |
| 5. Advanced | 只讲解，不现场实现 | Server Upload 与 Client Upload |

建议把 Stage 1–4 控制在 10–12 分钟，Stage 5 用 2–3 分钟解释架构。

## Stage 0：提前完成准备工作

这部分应在上课前完成，不要把创建项目和配置凭据占用课堂时间。

### 0.1 准备练习目录

在仓库根目录执行。请逐行输入，不要复制终端提示符 `$`，也不要在行末添加 `\`。

Git Bash：

```bash
cp -r demo practice
cd practice
npm install
cp .env.example .env.local
```

PowerShell：

```powershell
Copy-Item -Recurse demo practice
cd practice
npm install
Copy-Item .env.example .env.local
```

后面的所有代码都修改 `practice`，这样原始 `demo` 会保持不变。

`demo/src/env.ts` 已按当前 SvelteKit 3 的方式声明私有环境变量，因此后端可以从 `$app/env/private` 导入 Token，而不会把它发送到浏览器。

### 0.2 创建 Vercel Blob Store

1. 在 Vercel Dashboard 创建或选择一个 Project。
2. 打开该 Project 的 Storage 页面并创建 Blob Store。
3. 选择 **Public**，因为 Demo 需要把 Blob URL 直接放进 `<img>`。
4. 将 Blob Store 连接到 Project。
5. 获取本地开发所需的环境变量。

原对话采用 `BLOB_READ_WRITE_TOKEN`。把自己的值放进 `practice/.env.local`：

```env
BLOB_READ_WRITE_TOKEN=your_real_token_here
```

也可以安装 Vercel CLI 后，在 `practice` 中执行：

```bash
vercel link
vercel env pull .env.local
```

Vercel 在 2026 年为新连接逐步采用 OIDC。如果 Dashboard 没有显示长期 Token，请使用当前 Dashboard 提供的 Project 连接方式和最新版 Vercel CLI；`@vercel/blob` 会读取 Vercel 提供的环境凭据。

无论使用哪种连接方式，都不要把 `.env.local` 上传到 GitHub。

### 0.3 启动开发服务器

```bash
npm run dev -- --open
```

浏览器显示 “Ready for Stage 1” 后即可开始现场演示。

## Stage 1：Upload an Image

目标：选择一张图片，点击 Upload，并获得 Vercel Blob 返回的 URL。

### 1.1 创建后端接口

新建 `src/routes/api/blob/+server.ts`，复制以下代码：

```ts
import type { RequestHandler } from './$types';
import { put } from '@vercel/blob';
import { BLOB_READ_WRITE_TOKEN } from '$app/env/private';

export const POST: RequestHandler = async ({ request }) => {
  const form = await request.formData();
  const file = form.get('file');

  if (
    !(file instanceof File) ||
    !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
    file.size > 4 * 1024 * 1024
  ) {
    return Response.json(
      { error: 'Choose a JPG, PNG or WebP image under 4 MB' },
      { status: 400 }
    );
  }

  const blob = await put(`tech-share/${file.name}`, file, {
    access: 'public',
    addRandomSuffix: true,
    token: BLOB_READ_WRITE_TOKEN
  });

  return Response.json({
    url: blob.url,
    pathname: blob.pathname
  });
};
```

这段代码完成三件事：

1. 从 `FormData` 中读取文件。
2. 只接受小于 4 MB 的 JPG、PNG 和 WebP。
3. 使用 `put()` 上传到 `tech-share/`，并返回 URL 与 pathname。

`addRandomSuffix: true` 会避免同名图片互相覆盖。

### 1.2 替换前端页面

使用以下代码替换 `src/routes/+page.svelte`：

```svelte
<script lang="ts">
  let selectedFile = $state<File | null>(null);
  let imageUrl = $state('');
  let error = $state('');

  async function uploadImage() {
    if (!selectedFile) return;

    error = '';
    const form = new FormData();
    form.append('file', selectedFile);

    const response = await fetch('/api/blob', {
      method: 'POST',
      body: form
    });

    const data: { error?: string; url?: string } = await response.json();

    if (!response.ok) {
      error = data.error ?? 'Upload failed';
      return;
    }

    imageUrl = data.url ?? '';
  }
</script>

<h1>My Cloud Gallery</h1>

<input
  type="file"
  accept="image/jpeg,image/png,image/webp"
  onchange={(event) =>
    selectedFile = event.currentTarget.files?.[0] ?? null
  }
/>

<button onclick={uploadImage} disabled={!selectedFile}>
  Upload
</button>

{#if error}
  <p>{error}</p>
{/if}

{#if imageUrl}
  <p>Upload successful!</p>
  <a href={imageUrl} target="_blank" rel="noreferrer">
    Open uploaded file
  </a>
{/if}
```

现场选择一张小图片并点击 Upload，然后点击返回的链接。此时可以解释：

> The image is now stored in Vercel Blob instead of our local project.

## Stage 2：Display the Image

目标：把 Blob URL 直接用于 HTML `<img>`。

在 `+page.svelte` 的 `{#if imageUrl}` 中，放在链接后面：

```svelte
<img
  src={imageUrl}
    alt="Uploaded preview"
  width="320"
/>
```

完整的条件块变为：

```svelte
{#if imageUrl}
  <p>Upload successful!</p>
  <a href={imageUrl} target="_blank" rel="noreferrer">
    Open uploaded file
  </a>
  <img
    src={imageUrl}
    alt="Uploaded preview"
    width="320"
  />
{/if}
```

可以把 URL 复制到另一个标签页打开，说明图片不在浏览器临时状态或本地 `static` 文件夹中。

## Stage 3：List All Images

目标：把单张图片上传器扩展成 Gallery。

### 3.1 添加 GET 接口

把 `+server.ts` 的 SDK 导入改为：

```ts
import { list, put } from '@vercel/blob';
```

在文件末尾追加：

```ts
export const GET: RequestHandler = async () => {
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
};
```

### 3.2 添加前端状态和请求函数

在 `+page.svelte` 的 `<script>` 中，放在已有状态后面：

```ts
type GalleryImage = {
  url: string;
  pathname: string;
};

let images = $state<GalleryImage[]>([]);

async function loadImages() {
  const response = await fetch('/api/blob');

  if (!response.ok) {
    error = 'Failed to load images';
    return;
  }

  images = await response.json();
}
```

### 3.3 渲染 Gallery

在页面底部追加：

```svelte
<h2>My Gallery</h2>

<button onclick={loadImages}>
  Load Gallery
</button>

<div class="gallery">
  {#each images as photo (photo.pathname)}
    <div>
      <img
        src={photo.url}
        alt={photo.pathname}
        width="160"
      />
      <p>{photo.pathname}</p>
    </div>
  {/each}
</div>

<style>
  .gallery {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 20px;
  }
</style>
```

上传三张不同图片，点击 Load Gallery。刷新页面后再次点击，图片仍然存在，这一步用于解释浏览器状态与持久化云存储的区别。

## Stage 4：Delete an Image

目标：使用 `del()` 删除选中的 Blob。

### 4.1 添加 DELETE 接口

把 `+server.ts` 的 SDK 导入改为：

```ts
import { del, list, put } from '@vercel/blob';
```

在文件末尾追加：

```ts
export const DELETE: RequestHandler = async ({ request }) => {
  const { pathname } = await request.json();

  if (
    typeof pathname !== 'string' ||
    !pathname.startsWith('tech-share/')
  ) {
    return Response.json(
      { error: 'Invalid pathname' },
      { status: 400 }
    );
  }

  await del(pathname, {
    token: BLOB_READ_WRITE_TOKEN
  });

  return Response.json({ success: true });
};
```

pathname 检查可防止这个 Demo 接口删除 `tech-share/` 之外的 Blob。

### 4.2 添加前端删除函数

在 `+page.svelte` 的 `<script>` 中追加：

```ts
async function deleteImage(pathname: string) {
  const response = await fetch('/api/blob', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ pathname })
  });

  if (!response.ok) {
    error = 'Failed to delete image';
    return;
  }

  await loadImages();
}
```

在 Gallery 的图片信息后加入：

```svelte
<button onclick={() => deleteImage(photo.pathname)}>
  Delete
</button>
```

点击 Delete 后，前端会重新调用 `loadImages()`，因此 Gallery 会立即更新。Vercel CDN 和浏览器中的旧 URL 可能短暂保留缓存。

## Stage 5：Advanced Concepts

这一部分只讲解，不现场复制代码。

### Server Upload

```text
Browser → SvelteKit Server → Vercel Blob
```

- 实现简单，适合本次小图片 Demo。
- 文件先经过 Vercel Function。
- Vercel Function 的请求体上限是 4.5 MB，所以代码主动限制为 4 MB。

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

- `npm run check` 为 0 errors、0 warnings。
- `npm run build` 成功。
- 上传图片后可以打开 Blob URL。
- Load Gallery 可以显示 `tech-share/` 中的图片。
- Delete 会把图片从 Gallery 移除。

如果不需要现场逐步实现，可以直接运行当前 `finial` 目录：

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

## 课堂结束时的三句话

1. **What is Vercel Blob?** Cloud object storage for files such as images, videos, and documents.
2. **How do we use it?** `put()` to upload, `list()` to retrieve the file list, and `del()` to delete.
3. **Why do we need it?** It provides persistent file storage without managing our own storage infrastructure.

## Demo 的限制

这是课堂演示代码，没有身份验证、用户授权或限流。不要把上传与删除接口直接作为公开生产服务使用。
