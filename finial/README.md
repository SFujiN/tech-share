# Finial：Cloud Photo Gallery 完整版

这份指南从 [`../demo`](../demo/) 开始。前端已经全部准备好，课堂上只修改一个后端文件：

```text
src/routes/api/blob/+server.ts
```

这个文件在 `demo` 中是空的。Stage 1–4 会按顺序把完整后端代码粘贴进去。

## 四个阶段

| Stage | 后端功能 | 核心内容 |
| --- | --- | --- |
| 1 | 接收并检查文件 | `request.formData()` |
| 2 | 上传图片 | `put()` |
| 3 | 读取图片列表 | `list()` |
| 4 | 删除图片 | `del()` |

## Stage 0：课前准备

### 0.1 重新创建练习副本

在仓库根目录运行。删除旧 `practice` 会同时删除其中的 `.env.local`，需要保留凭据时请先记录。

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
Remove-Item -Recurse -Force practice -ErrorAction SilentlyContinue
Copy-Item -Recurse demo practice
cd practice
npm install
Copy-Item .env.example .env.local
```

后面的操作全部在 `practice` 中完成，原始 `demo` 不修改。

### 0.2 配置 Vercel Blob

1. 在 Vercel Dashboard 创建或选择一个 Project。
2. 在 Storage 页面创建 Public Blob Store。
3. 将 Blob Store 连接到 Project。
4. 把凭据写入 `practice/.env.local`：

```env
BLOB_READ_WRITE_TOKEN=your_real_token_here
```

也可以使用 Vercel CLI：

```bash
vercel link
vercel env pull .env.local
```

不要把 `.env.local` 上传到 GitHub。

### 0.3 启动并在 VS Code 中预览

```bash
npm run dev
```

在 VS Code 中按 `Ctrl + Alt + /` 打开 Integrated Browser，访问终端显示的 localhost 地址。不要添加 `--open`。

初始页面已经有 Upload、图片预览、Load Gallery 和 Delete 等全部前端界面。此时后端文件为空，所以按钮暂时不能完成对应操作。

## Stage 1：接收并检查文件

打开空文件 `src/routes/api/blob/+server.ts`，粘贴以下代码：

```ts
import type { RequestHandler } from './$types';

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

  return Response.json({
    message: `Received ${file.name} (${file.size} bytes)`
  });
};
```

这段代码负责：

- 从前端提交的 `FormData` 中取得文件；
- 只接受 JPG、PNG 和 WebP；
- 限制文件小于 4 MB；
- 暂时返回文件名和大小，证明后端已经收到文件。

保存后选择一张图片并点击 Upload。页面会显示后端返回的 `Received ...` 信息，但图片还没有上传到云端。

## Stage 2：上传到 Vercel Blob

在文件顶部的 `RequestHandler` 导入下面加入：

```ts
import { put } from '@vercel/blob';
import { BLOB_READ_WRITE_TOKEN } from '$app/env/private';
```

然后把 Stage 1 末尾的：

```ts
return Response.json({
  message: `Received ${file.name} (${file.size} bytes)`
});
```

替换为：

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

这段代码负责：

- 使用 `put()` 把文件上传到 Vercel Blob；
- 把文件放在 `tech-share/` 路径下；
- 使用随机后缀避免同名文件互相覆盖；
- 把公开 URL 返回给前端。

保存后再次点击 Upload。已有前端会显示上传成功信息、文件链接和图片预览。

## Stage 3：读取图片列表

把 Blob SDK 导入：

```ts
import { put } from '@vercel/blob';
```

改成：

```ts
import { list, put } from '@vercel/blob';
```

然后在文件末尾追加：

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

这段代码负责：

- 使用 `list()` 读取 `tech-share/` 下的 Blob；
- 最多读取 30 个文件；
- 只把前端需要的 `url` 和 `pathname` 返回。

保存后点击 Load Gallery，已有前端会把返回的图片显示成 Gallery。

## Stage 4：删除图片

把 Blob SDK 导入：

```ts
import { list, put } from '@vercel/blob';
```

改成：

```ts
import { del, list, put } from '@vercel/blob';
```

然后在文件末尾追加：

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

这段代码负责：

- 从前端取得要删除的 `pathname`；
- 确保只能删除 `tech-share/` 下的文件；
- 使用 `del()` 删除对应 Blob；
- 返回成功结果。

保存后点击图片卡片上的 Delete。已有前端会删除图片，然后自动重新加载 Gallery。

## 最终检查

在 `practice` 中运行：

```bash
npm run check
npm run build
```

预期结果：

- `npm run check` 为 0 errors、0 warnings；
- `npm run build` 成功；
- Upload 可以上传并预览图片；
- Load Gallery 可以读取所有图片；
- Delete 可以删除指定图片。

完整后端代码可以对照：

```text
finial/src/routes/api/blob/+server.ts
```

## 课堂总结

```text
request.formData() → 接收文件
put()              → 上传文件
list()             → 读取文件
del()              → 删除文件
```

这是课堂演示代码，没有身份验证、用户授权或限流，不应直接作为公开生产接口使用。
