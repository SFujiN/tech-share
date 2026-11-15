# Vercel Blob Cloud Photo Gallery Tech Share

这是一个用于课堂 Tech Share 的 SvelteKit 项目，演示如何使用 Vercel Blob 构建一个简单的云端图片库。

## 最终效果

完成后的页面支持：

1. 选择一张 JPG、PNG 或 WebP 图片；
2. 检查图片格式，并限制图片小于 4 MB；
3. 使用 `put()` 把图片上传到 Vercel Blob；
4. 使用 Blob 返回的 Public URL 显示图片；
5. 使用 `list()` 加载 `tech-share/` 路径下最多 30 张图片；
6. 使用 `del()` 从云端删除选中的图片。

## 仓库结构

```text
tech share/
├── demo/      课堂起点：完整前端，后端文件为空
├── finial/    最终版本：包含完整前端和后端
└── README.md  本项目唯一的说明文档
```

- [`demo/`](demo/)：课堂开始时复制的原始版本。
- [`finial/`](finial/)：完成所有阶段后的参考版本。
- `practice/`：你在本地创建的练习副本，已被 `.gitignore` 忽略。

> `finial` 是本项目已经约定使用的目录名称，因此保留这一拼写。

`demo` 和 `finial` 的前端相同。区别是：

- [`demo/src/routes/api/blob/+server.ts`](demo/src/routes/api/blob/+server.ts) 是提前创建好的空文件；
- [`finial/src/routes/api/blob/+server.ts`](finial/src/routes/api/blob/+server.ts) 是完成后的完整后端。

## 从 Demo 做到 Finial

课堂上一共分为四个阶段：

| Stage | 后端功能 | 核心内容 |
| --- | --- | --- |
| 1 | 接收并检查文件 | `request.formData()` |
| 2 | 上传图片 | `put()` |
| 3 | 读取图片列表 | `list()` |
| 4 | 删除图片 | `del()` |

所有 Stage 都只修改这个已经存在的文件：

```text
practice/src/routes/api/blob/+server.ts
```

课堂现场不需要创建任何新文件或文件夹，也不需要修改前端。

## Stage 0：课前准备

### 0.1 创建干净的 Practice

在仓库根目录执行以下命令。请逐行执行，不要复制终端提示符 `$`，也不要在行末添加 `\`。

删除旧 `practice` 会同时删除其中的 `.env.local` 和练习代码。如果里面有需要保留的凭据，请先记录。

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

后面的所有代码都写入 `practice`，这样原始 `demo` 会保持不变。

### 0.2 创建并连接 Vercel Blob Store

1. 在 Vercel Dashboard 创建或选择一个 Project。
2. 打开该 Project 的 Storage 页面。
3. 创建一个 Blob Store。
4. 选择 **Public**，因为页面需要把 Blob URL 直接放入 `<img>`。
5. 将 Blob Store 连接到 Project。
6. 获取本地开发需要的环境变量。

打开：

```text
practice/.env.local
```

填入自己的凭据：

```env
BLOB_READ_WRITE_TOKEN=your_real_token_here
```

也可以在 `practice` 中使用 Vercel CLI：

```bash
vercel link
vercel env pull .env.local
```

### 0.3 启动开发服务器

在 `practice` 中运行(这一步建议在vscode里新建终端执行)：

```bash
npm run dev
```

初始页面已经包含：

- 图片选择框；
- Upload 按钮；
- 上传状态和图片预览；
- Load Gallery 按钮；
- Gallery 图片卡片；
- Delete 按钮；
- 所有前端请求和页面样式。

此时后端文件是空的，所以按钮还不能完成对应的云端操作。

## Stage 1：接收并检查文件

### 粘贴位置

打开这个空文件：

```text
practice/src/routes/api/blob/+server.ts
```

直接从第一行开始粘贴以下完整代码：

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

### 这段代码做什么

- 创建 POST 后端接口；
- 使用 `request.formData()` 取得前端提交的文件；
- 只接受 JPG、PNG 和 WebP；
- 限制文件小于 4 MB；
- 暂时返回文件名和大小，证明服务器已经收到文件。

### 验证

保存文件，选择一张图片并点击 Upload。

页面应该显示类似：

```text
Received photo.jpg (123456 bytes)
```

这时图片只到达 SvelteKit 后端，还没有上传到 Vercel Blob。

## Stage 2：上传到 Vercel Blob

继续修改：

```text
practice/src/routes/api/blob/+server.ts
```

### 2.1 粘贴两个导入

找到文件第一行：

```ts
import type { RequestHandler } from './$types';
```

紧接着在它下面粘贴：

```ts
import { put } from '@vercel/blob';
import { BLOB_READ_WRITE_TOKEN } from '$app/env/private';
```

这两个导入分别提供：

- `put()`：把文件上传到 Vercel Blob；
- `BLOB_READ_WRITE_TOKEN`：服务器访问 Blob Store 的私有凭据。

### 2.2 替换 Stage 1 的临时响应

找到 POST 接口末尾的：

```ts
return Response.json({
  message: `Received ${file.name} (${file.size} bytes)`
});
```

删除这段代码，然后在同一位置粘贴：

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

### 这段代码做什么

- 使用 `put()` 上传文件；
- 把图片放在 `tech-share/` 路径下；
- 设置 `access: 'public'`，让浏览器可以直接显示图片；
- 使用随机后缀为同名文件生成不同 pathname，避免上传冲突；
- 把 Blob 的 `url` 和 `pathname` 返回给前端。

### 验证

保存文件，再次选择图片并点击 Upload。

页面应该显示 Upload successful、文件链接和图片预览。图片现在位于 Vercel Blob，而不是本地项目中。

## Stage 3：读取图片列表

继续修改：

```text
practice/src/routes/api/blob/+server.ts
```

### 3.1 修改 Blob SDK 导入

找到：

```ts
import { put } from '@vercel/blob';
```

替换为：

```ts
import { list, put } from '@vercel/blob';
```

这会在已有的 `put()` 之外，再导入读取 Blob 列表需要的 `list()`。

### 3.2 在文件末尾添加 GET 接口

滚动到 `+server.ts` 最底部，在 POST 接口结束的 `};` 后面另起一行，粘贴：

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

### 这段代码做什么

- 创建 GET 后端接口；
- 使用 `list()` 读取 `tech-share/` 路径下的文件；
- 最多读取 30 个 Blob；
- 只把前端需要的 `url` 和 `pathname` 返回。

### 验证

保存文件，点击页面上的 Load Gallery。页面应该显示已经上传的图片。刷新页面后再次点击，图片仍然存在。

## Stage 4：删除图片

继续修改：

```text
practice/src/routes/api/blob/+server.ts
```

### 4.1 修改 Blob SDK 导入

找到：

```ts
import { list, put } from '@vercel/blob';
```

替换为：

```ts
import { del, list, put } from '@vercel/blob';
```

这会加入删除 Blob 需要的 `del()`。

### 4.2 在文件末尾添加 DELETE 接口

滚动到 `+server.ts` 最底部，在 GET 接口结束的 `};` 后面另起一行，粘贴：

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

### 这段代码做什么

- 创建 DELETE 后端接口；
- 从前端请求中读取要删除的 `pathname`；
- 确保只能删除 `tech-share/` 路径下的文件；
- 使用 `del()` 删除对应 Blob；
- 返回删除成功结果。

### 验证

保存文件，点击 Load Gallery，然后点击任意图片卡片上的 Delete。前端会自动重新加载 Gallery，被删除的图片应该消失。

## 完成后的后端结构

完成 Stage 1–4 后，`practice/src/routes/api/blob/+server.ts` 应该依次包含：

```text
导入 RequestHandler、put、list、del 和私有 Token
│
├── POST    接收并上传图片
├── GET     读取图片列表
└── DELETE  删除指定图片
```

如果操作中出现问题，可以和完整参考文件比较：

[`finial/src/routes/api/blob/+server.ts`](finial/src/routes/api/blob/+server.ts)

## 安全说明

- `.env.local` 已被 Git 忽略；
- 不要把真实的 `BLOB_READ_WRITE_TOKEN` 写入代码、README、截图或 Git 提交；
- 仓库中的 `.env.example` 只有凭据占位符；
- 这是没有身份验证、用户授权或限流的课堂 Demo，不应直接作为公开生产上传接口使用。
