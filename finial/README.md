# Finial：从 Demo 到最终代码

这个目录是可直接运行和调试的最终版本。它演示了：

- 使用 `$state` 创建响应式状态
- 使用 `bind:value` 完成输入框双向绑定
- 使用 `{#each}` 渲染数组
- 使用 `{#if}` 显示错误信息
- 使用 `fetch` 调用外部 API
- 使用 `onMount` 在页面加载后自动执行逻辑
- 使用 `$props` 创建带参数和回调的组件

下面从 `demo` 开始，一步一步做到当前状态。

## 第 0 步：准备一份 Demo

在仓库根目录执行：

```powershell
Copy-Item -Recurse demo practice
cd practice
npm install
npm run dev -- --open
```

后续步骤都在 `practice` 目录中操作。开发服务器可以保持运行，保存文件后浏览器会自动刷新。

## 第 1 步：添加姓名输入和响应式状态

打开 `src/routes/+page.svelte`，先用下面的代码替换原内容：

```svelte
<script lang="ts">
  let name = $state('');
</script>

<input placeholder="Enter your name" bind:value={name} />
<span>{name}</span>
```

输入框通过 `bind:value={name}` 与 `name` 双向绑定。输入内容变化时，旁边的 `<span>` 会立即更新。

## 第 2 步：准备猫咪知识列表

在 `<script>` 中加入：

```ts
let facts = $state<string[]>([]);
```

在 `<span>` 后加入：

```svelte
<ul>
  {#each facts as fact}
    <li>{fact}</li>
  {/each}
</ul>
```

`string[]` 明确表示列表里只保存字符串，也能让 `npm run check` 正确通过。

## 第 3 步：请求 API，并处理加载和错误状态

在 `<script>` 中继续加入下面的状态和函数：

```ts
let loading = $state(false);
let error = $state('');

async function addFact() {
  loading = true;
  error = '';

  try {
    const response = await fetch('https://catfact.ninja/fact');

    if (!response.ok) {
      throw new Error('Failed to fetch cat fact');
    }

    const data: { fact: string } = await response.json();
    facts = [...facts, data.fact];
  } catch {
    error = 'Could not load a cat fact.';
  } finally {
    loading = false;
  }
}
```

在列表后加入错误提示和按钮：

```svelte
{#if error}
  <p>{error}</p>
{/if}

<button onclick={addFact} disabled={loading}>
  {loading ? 'Loading...' : 'Add New Fact'}
</button>
```

按钮请求期间会被禁用，避免连续重复点击。无论请求成功还是失败，`finally` 都会结束加载状态。

## 第 4 步：页面打开时自动加载一条内容

把下面的导入放在 `<script>` 最上方：

```ts
import { onMount } from 'svelte';
```

再把下面的代码放在 `addFact` 函数后：

```ts
onMount(() => {
  addFact();
});
```

现在页面第一次在浏览器中挂载时，会自动请求一条猫咪知识。

## 第 5 步：核对页面的完整代码

完成前四步后，`src/routes/+page.svelte` 应与下面完全一致：

```svelte
<script lang="ts">
  import { onMount } from 'svelte';

  let name = $state('');
  let facts = $state<string[]>([]);
  let loading = $state(false);
  let error = $state('');

  async function addFact() {
    loading = true;
    error = '';

    try {
      const response = await fetch('https://catfact.ninja/fact');

      if (!response.ok) {
        throw new Error('Failed to fetch cat fact');
      }

      const data: { fact: string } = await response.json();
      facts = [...facts, data.fact];
    } catch {
      error = 'Could not load a cat fact.';
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    addFact();
  });
</script>

<input placeholder="Enter your name" bind:value={name} />
<span>{name}</span>

<ul>
  {#each facts as fact}
    <li>{fact}</li>
  {/each}
</ul>

{#if error}
  <p>{error}</p>
{/if}

<button onclick={addFact} disabled={loading}>
  {loading ? 'Loading...' : 'Add New Fact'}
</button>
```

## 第 6 步：添加计数器组件

新建 `src/routes/PopGoes.svelte`，复制下面的完整代码：

```svelte
<script lang="ts">
  let { max = 10, onpop = () => {} } = $props();
  let count = $state(0);

  function increment() {
    count++;

    if (count > max) {
      count = max;
      onpop();
    }
  }
</script>

<button onclick={increment}>{count}</button>
```

这个组件接收两个属性：

- `max`：计数上限，默认是 `10`。
- `onpop`：超过上限时执行的回调，默认不执行任何操作。

当前最终页面保留了这个独立组件用于课堂讲解，没有在 `+page.svelte` 中渲染它。如果要临时展示，在页面脚本中导入它：

```ts
import PopGoes from './PopGoes.svelte';
```

然后在页面末尾添加：

```svelte
<PopGoes max={5} onpop={() => alert('Pop!')} />
```

## 第 7 步：检查最终结果

先停止开发服务器，或另外打开一个终端，在项目目录运行：

```powershell
npm run check
npm run build
```

预期结果：

- `npm run check` 显示 `0 errors and 0 warnings`。
- `npm run build` 成功完成构建。

之后重新启动调试服务器：

```powershell
npm run dev -- --open
```

如果外部 API 暂时无法访问，页面会显示 `Could not load a cat fact.`；这说明错误处理正常工作。

## 直接运行这个最终目录

如果不需要从 Demo 重做，直接在当前 `finial` 目录执行：

```powershell
npm install
npm run dev -- --open
```
