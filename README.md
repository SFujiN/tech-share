# Svelte 技术分享

这个仓库把课堂展示代码和个人调试代码分开保存：

- `demo/`：完成 SvelteKit 初始化后的最原始代码，适合课堂上从这里开始演示。
- `finial/`：完成姓名绑定、猫咪知识请求、加载与错误状态、列表渲染和计数器组件后的最终代码。

> 目录名 `finial` 按本次项目约定保留。

## 快速开始

需要先安装 Node.js 和 npm。

### 运行课堂初始版本

```powershell
cd demo
npm install
npm run dev -- --open
```

### 运行最终版本

```powershell
cd finial
npm install
npm run dev -- --open
```

浏览器会打开终端中显示的本地地址。开发服务器运行期间，保存代码后页面会自动刷新。

## 从 `demo` 做到 `finial`

请阅读 [`finial/README.md`](finial/README.md)。里面按照课堂演示顺序列出了每一步、需要复制的完整代码，以及最后的检查命令。

## 常用命令

以下命令需要在 `demo` 或 `finial` 目录中运行：

```powershell
npm run dev      # 启动开发服务器
npm run check    # 检查 Svelte 和 TypeScript
npm run build    # 创建生产构建
npm run preview  # 本地预览生产构建
```
