# Demo：初始化后的课堂起点

这个目录只包含一个已经完成初始化、可以直接运行的 SvelteKit 项目，不包含课堂后续要添加的业务代码。

## 课堂开始前

```powershell
npm install
npm run dev -- --open
```

如果浏览器显示 “Welcome to SvelteKit”，说明初始化成功。

## 这个目录是怎样初始化的

在一个空目录中执行下面的命令，可以创建相同配置的项目：

```powershell
npx sv@1.3.0 create --template minimal --types ts --no-install demo
cd demo
npm install
```

所用配置：

- SvelteKit minimal 模板
- TypeScript
- npm
- 不额外安装其他功能

课堂上需要添加的代码和完整步骤请查看 [`../finial/README.md`](../finial/README.md)。
