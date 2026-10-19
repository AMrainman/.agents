---
description: "创建新项目时，生成 Vue 3 + TypeScript + Vite 项目骨架（内置 Router/MSW/Storybook/ESLint/Prettier/Vitest/auto-import/多环境构建），支持选择端适配、UI 库与图标库"
disable-model-invocation: true
allowed-tools: Bash, Read, Write, Edit
---

# create-vue

在当前目录生成一个 Vue 3 项目骨架。以文本对话收集用户选择，然后调用生成脚本。

骨架**内置**（无需询问）：Vue Router、MSW、ESLint、Prettier、Vitest、unplugin-auto-import、unplugin-vue-components、Tailwind CSS + SCSS、Pinia、日/夜主题、Storybook（MSW + 主题切换贯通）、多环境构建（dev/test/prod）。

## 用法

```bash
/create-vue [project-name]
```

- 带 `project-name`（如 `/create-vue vue3`）：在当前目录创建同名子目录并在其中生成项目；**若当前目录已存在同名文件或文件夹，直接结束创建并提示用户**。
- 不带 `project-name`：在当前目录直接生成（见步骤 1 的目录检查）。

## 执行步骤

1. **检查目录状态**：
   - 若命令带了项目名：用 Bash 执行 `ls -la <project-name>` 检查同名文件/文件夹是否已存在。已存在则提示用户「当前目录已存在名为 `<project-name>` 的文件或文件夹，创建已取消」并**直接结束**。
   - 若没带项目名：用 Bash 执行 `ls -la` 查看当前目录。若目录非空（除 `README.md` 外），向用户说明情况并等待用户决定是否继续。

2. **询问端适配**：以文本向用户提问（二选一），格式如下：

   > 目标端是？
   > 1. 仅 Web 端 —— 不生成平台适配层与响应式方案，业务代码直接使用所选 UI 库
   > 2. 双端适配（桌面 + 移动 H5）—— 容器查询响应式 + platform 基础组件 + useDialog / toast，锁定 UI 库为 Element Plus + Vant，并默认安装 `@element-plus/icons-vue`
   >
   > 直接回复序号或名称即可。

   等待用户回复后进入步骤 3。用户未作答或回复模糊时，按「仅 Web 端」处理并说明。

3. **询问 UI 库与图标库**：以文本一次性提出两个问题（编号列出选项并标注推荐），格式如下：

   > **Q1 目标 UI 库是？**（仅 Web 端时提问；双端适配跳过）
   > 1. Element Plus（推荐）
   > 2. Ant Design Vue
   > 3. 其他（不预装）
   >
   > 选 Element Plus / Ant Design Vue 会自动加载各自官方图标库 `@element-plus/icons-vue` / `@ant-design/icons-vue`。
   >
   > **Q2 图标库是？**
   > 1. FontAwesome（推荐）
   > 2. Iconify
   > 3. 其他（不预装）
   >
   > 可一起回复，如「1 + 1」；只答一部分时，未答的按推荐项处理并说明。

   等待用户回复。用户未作答或回复模糊时，全部按推荐项处理并说明。

4. **解析选项**：映射为：
   - `dualPlatform`: 布尔值（选择「双端适配」为 `true`）
   - `uiLibrary`: 字符串（双端适配时由脚本自动锁定，无需传有效值）
   - `iconLibrary`: 字符串

5. **向用户确认**：以文本形式列出解析后的配置，例如：
   "将生成以下配置：端适配 [仅 Web 端]，UI 库 [Element Plus]，图标库 [FontAwesome]。内置 Vue Router / MSW / ESLint / Prettier / Vitest / auto-import。确认请回复 y，修改请直接说明。"

6. **生成项目**：用户确认后，调用 Bash：

   ```bash
   node ~/.agents/skills/create-vue/index.js [project-name] --options '<json>'
   ```

   其中 `[project-name]` 为步骤 1 中用户给出的项目名（未提供则省略），`<json>` 是步骤 4 构造的 JSON 字符串。重名拦截由脚本自动完成。

7. **报告结果**：生成完成后告知用户项目骨架已生成（含 `AGENTS.md` 约定文件、`.storybook/` 配置与多环境 `.env`），并提示手动执行 `npm install` 与 `npm run dev`（另可用 `npm run storybook` 启动组件开发环境）。
   - `package.json` 已内置 `postinstall` 脚本（`msw init public/ --save`），执行 `npm install` 后自动生成 `public/mockServiceWorker.js`，避免开发环境出现"应用启动失败"。

## 选项 JSON 示例

```json
{
  "dualPlatform": false,
  "uiLibrary": "element-plus",
  "iconLibrary": "fontawesome"
}
```

仅 Web 端 + Ant Design Vue + Iconify 示例：

```json
{
  "dualPlatform": false,
  "uiLibrary": "ant-design-vue",
  "iconLibrary": "iconify"
}
```

双端适配示例（`uiLibrary` 会被脚本忽略并锁定为 Element Plus + Vant）：

```json
{
  "dualPlatform": true,
  "uiLibrary": "other",
  "iconLibrary": "fontawesome"
}
```

## 选项 value 对照表

| 分组 | 显示名称 | value |
|---|---|---|
| 端适配 | 仅 Web 端 | `dualPlatform: false` |
| 端适配 | 双端适配（桌面 + 移动 H5） | `dualPlatform: true` |
| UI 库 | Element Plus | `element-plus` |
| UI 库 | Ant Design Vue | `ant-design-vue` |
| UI 库 | 其他 | `other` |
| 图标库 | FontAwesome | `fontawesome` |
| 图标库 | Iconify | `iconify` |
| 图标库 | 其他 | `other` |

## 模板结构

```
skills/create-vue/template/
├── base/                  # 必选核心（含全部内置插件、.storybook/、多环境 .env、示例 story）
└── dual-platform/         # 双端适配附加文件（platform 组件 / usePlatform / useDialog / toast / HomeView 与 Button story 覆盖）
```

`vite.config.ts`、`vitest.config.ts`、`AGENTS.md` 由 `lib/generate.js` 按选项动态生成；不选双端适配时会自动移除 `@tailwindcss/container-queries` 依赖与 tailwind 插件配置，选双端适配时 `vite.config.ts` 会额外启用 basic-ssl（仅 dev serve 生效）。

## 禁止行为

- 不要生成 Home / About 之外的任何业务页面或业务组件。
- 不要生成业务相关的 MSW handlers（只保留 `/api/health` 示例）。
