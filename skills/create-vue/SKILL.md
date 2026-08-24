---
description: "创建新项目时，生成 Vue 3 + TypeScript + Vite 项目骨架（内置 Router/MSW/ESLint/Prettier/Vitest/auto-import），支持选择端适配、UI 库与图标库"
disable-model-invocation: true
allowed-tools: Bash, Read, Write, Edit, AskUserQuestion
---

# create-vue

在当前目录生成一个 Vue 3 项目骨架。使用 `AskUserQuestion` 收集用户选择，然后调用生成脚本。

骨架**内置**（无需询问）：Vue Router、MSW、ESLint、Prettier、Vitest、unplugin-auto-import、unplugin-vue-components、Tailwind CSS + SCSS、Pinia、日/夜主题。

## 用法

```bash
/create-vue
```

## 执行步骤

1. **检查目录状态**：用 Bash 执行 `ls -la` 查看当前目录。若目录非空（除 `README.md` 外），向用户说明情况并等待用户决定是否继续。

2. **询问端适配**：调用一次 `AskUserQuestion`（单选）：

   ```json
   {
     "questions": [
       {
         "question": "目标端是？（双端适配将锁定 UI 库为 Element Plus + Vant，并生成 platform 基础组件与统一封装）",
         "header": "端适配",
         "multiSelect": false,
         "options": [
           { "label": "仅 Web 端", "description": "不生成平台适配层，业务代码直接使用所选 UI 库" },
           { "label": "双端适配（桌面 + 移动 H5）", "description": "生成 usePlatform / platform 基础组件 / useDialog / toast" }
         ]
       }
     ]
   }
   ```

3. **询问 UI 库与图标库**：再调用一次 `AskUserQuestion`（两个问题放在同一 `questions` 数组中）。
   - 若步骤 2 选择了**双端适配**：跳过 UI 库问题，只问图标库（UI 库自动锁定为 Element Plus + Vant）。
   - 若选择了**仅 Web 端**：UI 库问题为「Element Plus / Vant / 其他」，**推荐项（第一项）为 Element Plus**。
   - 图标库问题为「FontAwesome / Heroicons / Lucide / 其他」，**推荐项（第一项）为 FontAwesome**。
   - 两者均为单选（`multiSelect: false`）；「其他」表示不预装，由用户后续自行安装。

   **调用格式要求**：
   - 每次只能调用 `AskUserQuestion` 一次；顶层参数只能是 `questions` 数组，**不能**传顶层 `question`。
   - 数组内每个对象必须包含四个字段：`question`、`header`、`multiSelect`、`options`。
   - 每个 `options` 元素为 `{ label: '显示名称', description: '简短说明' }`。

4. **解析选项**：映射为：
   - `dualPlatform`: 布尔值（选择「双端适配」为 `true`）
   - `uiLibrary`: 字符串（双端适配时由脚本自动锁定，无需传有效值）
   - `iconLibrary`: 字符串

5. **向用户确认**：以文本形式列出解析后的配置，例如：
   "将生成以下配置：端适配 [仅 Web 端]，UI 库 [Element Plus]，图标库 [FontAwesome]。内置 Vue Router / MSW / ESLint / Prettier / Vitest / auto-import。确认请回复 y，修改请直接说明。"

6. **生成项目**：用户确认后，调用 Bash：

   ```bash
   node ~/.agents/skills/create-vue/index.js --options '<json>'
   ```

   其中 `<json>` 是步骤 4 构造的 JSON 字符串。

7. **报告结果**：生成完成后告知用户项目骨架已生成，并提示手动执行 `npm install` 与 `npm run dev`。
   - `package.json` 已内置 `postinstall` 脚本（`msw init public/ --save`），执行 `npm install` 后自动生成 `public/mockServiceWorker.js`，避免开发环境出现"应用启动失败"。

## 选项 JSON 示例

```json
{
  "dualPlatform": false,
  "uiLibrary": "element-plus",
  "iconLibrary": "fontawesome"
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
| UI 库 | Vant | `vant` |
| UI 库 | 其他 | `other` |
| 图标库 | FontAwesome | `fontawesome` |
| 图标库 | Heroicons | `heroicons` |
| 图标库 | Lucide | `lucide` |
| 图标库 | 其他 | `other` |

## 模板结构

```
skills/create-vue/template/
├── base/                  # 必选核心（含全部内置插件）
└── dual-platform/         # 双端适配附加文件（platform 组件 / usePlatform / useDialog / toast / HomeView 覆盖）
```

`vite.config.ts`、`vitest.config.ts`、`CLAUDE.md` 由 `lib/generate.js` 按选项动态生成；不选双端适配时会自动移除 `@tailwindcss/container-queries` 依赖与 tailwind 插件配置。

## 禁止行为

- 不要生成 Home / About 之外的任何业务页面或业务组件。
- 不要生成业务相关的 MSW handlers（只保留 `/api/health` 示例）。
