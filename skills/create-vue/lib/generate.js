import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'
import {
  UI_LIBRARY_DEPS,
  ICON_LIBRARY_DEPS,
  UI_LIBRARY_NAMES,
  ICON_LIBRARY_NAMES,
  UI_RESOLVER_IMPORTS,
  UI_RESOLVER_CALLS,
  UI_RESOLVER_TEST_CALLS,
} from './choices.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const TEMPLATE_ROOT = resolve(__dirname, '../template')

/**
 * options 结构：
 * {
 *   dualPlatform: boolean,                              // 双端适配（桌面 + 移动 H5）
 *   uiLibrary: 'element-plus' | 'ant-design-vue' | 'other', // dualPlatform 时忽略，自动锁定 EP + Vant
 *   iconLibrary: 'fontawesome' | 'iconify' | 'other'
 * }
 */
export async function generateProject(targetDir, options) {
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true })
  }

  const dual = !!options.dualPlatform
  const uiLibraries = dual ? ['element-plus', 'vant'] : options.uiLibrary && options.uiLibrary !== 'other' ? [options.uiLibrary] : []
  const iconLibrary = options.iconLibrary && options.iconLibrary !== 'other' ? options.iconLibrary : null

  copyBase(targetDir)
  patchPackageJson(targetDir, { dual, uiLibraries, iconLibrary })
  patchTailwindConfig(targetDir, { dual })
  patchEslintConfig(targetDir, { dual })
  patchStylesIndex(targetDir, { uiLibraries })
  generateViteConfig(targetDir, { dual, uiLibraries })
  generateVitestConfig(targetDir, { uiLibraries })
  generateAgentsMd(targetDir, { dual, uiLibraries, iconLibrary })

  if (dual) {
    cpSync(join(TEMPLATE_ROOT, 'dual-platform', 'src'), join(targetDir, 'src'), { recursive: true, force: true })
  }
}

function copyBase(targetDir) {
  cpSync(join(TEMPLATE_ROOT, 'base'), targetDir, { recursive: true })
}

function patchPackageJson(targetDir, { dual, uiLibraries, iconLibrary }) {
  const pkgPath = join(targetDir, 'package.json')
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))

  for (const ui of uiLibraries) {
    Object.assign(pkg.dependencies, UI_LIBRARY_DEPS[ui])
  }
  if (iconLibrary) {
    Object.assign(pkg.dependencies, ICON_LIBRARY_DEPS[iconLibrary])
  }
  if (dual) {
    // 双端真机调试（摄像头/麦克风等能力要求安全上下文）需要开发服务支持 HTTPS
    pkg.devDependencies['@vitejs/plugin-basic-ssl'] = '^2.3.0'
  } else {
    delete pkg.devDependencies['@tailwindcss/container-queries']
  }

  pkg.dependencies = sortKeys(pkg.dependencies)
  pkg.devDependencies = sortKeys(pkg.devDependencies)
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
}

function sortKeys(obj) {
  return Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)))
}

function patchTailwindConfig(targetDir, { dual }) {
  if (dual) return
  const configPath = join(targetDir, 'tailwind.config.ts')
  const content = readFileSync(configPath, 'utf-8')
    .replace("import containerQueries from '@tailwindcss/container-queries'\n", '')
    .replace('  plugins: [containerQueries],\n', '')
  writeFileSync(configPath, content)
}

const DUAL_ESLINT_BLOCK = `
  {
    name: 'app/restrict-ui-direct-import',
    // 业务代码禁止直接引入 element-plus / vant 的函数式 API，必须经由统一封装；
    // 封装层（src/shared）不受限。allowTypeImports 保持 import type 可用。
    files: ['src/features/**/*.{ts,mts,tsx,vue}', 'src/app/**/*.{ts,mts,tsx,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'element-plus',
              importNames: ['ElMessage', 'ElMessageBox', 'ElNotification', 'ElLoading'],
              allowTypeImports: true,
              message: '请使用 @/shared/utils/toast 的 toast / @/shared/composables/useDialog 的 useDialog',
            },
            {
              name: 'vant',
              importNames: [
                'showToast',
                'showFailToast',
                'showSuccessToast',
                'showLoadingToast',
                'showDialog',
                'showConfirmDialog',
                'Dialog',
                'Toast',
              ],
              allowTypeImports: true,
              message: '请使用 @/shared/utils/toast 的 toast / @/shared/composables/useDialog 的 useDialog',
            },
          ],
        },
      ],
    },
  },`

function patchEslintConfig(targetDir, { dual }) {
  const configPath = join(targetDir, 'eslint.config.js')
  const content = readFileSync(configPath, 'utf-8')
  const replaced = dual
    ? content.replace('  // __DUAL_RESTRICT_IMPORTS__', DUAL_ESLINT_BLOCK)
    : content.replace('\n  // __DUAL_RESTRICT_IMPORTS__', '')
  writeFileSync(configPath, replaced)
}

function patchStylesIndex(targetDir, { uiLibraries }) {
  if (!uiLibraries.includes('element-plus')) return
  const indexPath = join(targetDir, 'src/shared/styles/index.css')
  const content = readFileSync(indexPath, 'utf-8')
  writeFileSync(
    indexPath,
    content +
      "\n/* Element Plus 暗色变量：html.dark 作用域下覆盖 --el-*，导入后 EP 组件才能随 .dark 类切换日夜间 */\n@import 'element-plus/theme-chalk/dark/css-vars.css';\n"
  )
}

function generateViteConfig(targetDir, { dual, uiLibraries }) {
  const hasElementPlus = uiLibraries.includes('element-plus')
  const resolverImports = uiLibraries.map(ui => UI_RESOLVER_IMPORTS[ui]).filter(Boolean)

  const imports = [
    "import { defineConfig } from 'vite'",
    "import vue from '@vitejs/plugin-vue'",
    "import { resolve } from 'path'",
    "import AutoImport from 'unplugin-auto-import/vite'",
    "import Components from 'unplugin-vue-components/vite'",
  ]
  if (resolverImports.length) {
    imports.push(`import { ${resolverImports.join(', ')} } from 'unplugin-vue-components/resolvers'`)
  }
  if (dual) {
    imports.push("import basicSsl from '@vitejs/plugin-basic-ssl'")
  }

  const componentsResolvers = uiLibraries.map(ui => UI_RESOLVER_CALLS[ui]).filter(Boolean)

  const pluginLines = [
    ...(dual
      ? [
          '    // 仅在开发服务时生成自签证书启用 HTTPS（便于手机通过 https://<本机IP> 真机调试）',
          '    ...(isServe ? [basicSsl()] : []),',
        ]
      : []),
    '    vue(),',
    '    AutoImport({',
    "      imports: ['vue', 'vue-router', 'pinia'],",
    "      dts: 'src/auto-imports.d.ts',",
    "      dirs: ['src/shared/composables', 'src/shared/stores'],",
    '      vueTemplate: true,',
    '      eslintrc: {',
    '        enabled: true,',
    '      },',
    ...(hasElementPlus ? ['      resolvers: [ElementPlusResolver()],'] : []),
    '    }),',
    '    Components({',
    "      dirs: ['src/shared/components'],",
    "      dts: 'src/components.d.ts',",
    '      deep: true,',
    ...(componentsResolvers.length ? [`      resolvers: [${componentsResolvers.join(', ')}],`] : []),
    '    }),',
  ]

  const configBody = [
    '  css: {',
    '    preprocessorOptions: {',
    '      scss: {',
    '        // 自动注入全局变量与 mixin，组件 <style lang="scss"> 中可直接使用，无需手动引入',
    '        additionalData:',
    '          \'@use "@/shared/styles/scss/variables" as *;@use "@/shared/styles/scss/mixins" as *;\',',
    '      },',
    '    },',
    '  },',
    '  plugins: [',
    ...pluginLines,
    '  ],',
    '  resolve: {',
    '    alias: {',
    "      '@': resolve(import.meta.dirname, 'src'),",
    '    },',
    '  },',
  ].join('\n')

  // 双端适配时包一层函数：serve（dev/preview）启用 basicSsl，build 时忽略
  const content = dual
    ? `${imports.join('\n')}

export default defineConfig(({ command }) => {
  // serve = vite / vite preview；build = vite build。仅开发服务启用 HTTPS
  const isServe = command === 'serve'

  return {
${configBody}
  }
})
`
    : `${imports.join('\n')}

export default defineConfig({
${configBody}
})
`

  writeFileSync(join(targetDir, 'vite.config.ts'), content)
}

function generateVitestConfig(targetDir, { uiLibraries }) {
  const hasElementPlus = uiLibraries.includes('element-plus')
  const hasUi = uiLibraries.length > 0

  const imports = [
    "import { resolve } from 'path'",
    "import { defineConfig } from 'vitest/config'",
    "import vue from '@vitejs/plugin-vue'",
  ]
  if (hasUi) {
    imports.push("import Components from 'unplugin-vue-components/vite'")
    const resolverImports = uiLibraries.map(ui => UI_RESOLVER_IMPORTS[ui]).filter(Boolean)
    imports.push(`import { ${resolverImports.join(', ')} } from 'unplugin-vue-components/resolvers'`)
  }

  const resolvers = uiLibraries.map(ui => UI_RESOLVER_TEST_CALLS[ui]).filter(Boolean)
  const noExternal = uiLibraries.map(ui => `'${ui}'`)

  const cssIgnorePlugin = `
/**
 * 测试环境忽略 .css 导入（UI 库组件样式在 jsdom 中无需解析）。
 * 不拦 .vue 虚拟样式请求（含 ?vue 查询），否则 vite:vue 取不到源文件描述符。
 */
const cssIgnorePlugin = {
  name: 'css-ignore',
  enforce: 'pre' as const,
  resolveId(id: string) {
    if (id.endsWith('.css') && !id.includes('?vue')) {
      return '\\0css-ignore:' + id
    }
  },
  load(id: string) {
    if (id.startsWith('\\0css-ignore:')) {
      return ''
    }
  },
}
`

  const plugins = hasUi
    ? `    vue(),
    cssIgnorePlugin,
    // 测试内渲染真实的 UI 库组件（不启用 AutoImport，避免注入 import 竞争 <script setup> 宏编译；
    // 组件需显式 import vue api）
    Components({
      resolvers: [${resolvers.join(', ')}],
      // 不生成 dts；类型声明由 vite.config 生成的 src/components.d.ts 提供
      dts: false,
    }),`
    : '    vue(),'

  const content = `${imports.join('\n')}
${hasUi ? cssIgnorePlugin : ''}
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        // 与 vite.config 一致：自动注入全局变量与 mixin，保证组件内 scss 在测试中可编译
        additionalData: '@use "@/shared/styles/scss/variables" as *;@use "@/shared/styles/scss/mixins" as *;',
      },
    },
  },
  plugins: [
${plugins}
  ],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
    },
  },${hasUi ? `\n  ssr: {\n    noExternal: [${noExternal.join(', ')}],\n  },` : ''}
  test: {
    environment: 'jsdom',
    // 使用绝对路径避免嵌套在其他 vitest 项目下时相对路径解析错误
    setupFiles: [resolve(import.meta.dirname, 'vitest.setup.ts')],
    globals: true,
  },
})
`

  writeFileSync(join(targetDir, 'vitest.config.ts'), content)
}

function generateAgentsMd(targetDir, { dual, uiLibraries, iconLibrary }) {
  const stack = [
    'Vue 3 + Pinia + TypeScript + Vite + Tailwind CSS + SCSS + Vue Router + MSW + Storybook + ESLint + Prettier + Vitest',
    ...uiLibraries.map(ui => UI_LIBRARY_NAMES[ui]),
    ...(iconLibrary ? [ICON_LIBRARY_NAMES[iconLibrary]] : []),
  ].join(' + ')

  const lines = [
    '# AGENTS.md',
    '',
    'This file provides guidance to AI coding assistants (pi / Claude Code / etc.) when working with code in this repository.',
    '',
    '## 项目概述',
    '',
    `基于 ${stack} 的项目骨架${dual ? '（桌面 / 移动 H5 双端）' : '（仅 Web 端）'}。`,
    '',
    '## 常用命令',
    '',
    '```bash',
    'npm run dev',
    'npm run type-check',
    'npm run build          # 等价于 build:prod',
    'npm run build:dev      # 加载 .env.development',
    'npm run build:test     # 加载 .env.test',
    'npm run build:prod     # 加载 .env.production',
    'npm run test',
    'npm run lint',
    'npm run lint:fix',
    'npm run format',
    'npm run storybook      # 组件开发环境（端口 6006）',
    'npm run build-storybook',
    '```',
    '',
    '## 目录结构',
    '',
    '- `src/app/` — 应用入口（main.ts bootstrap）与全局路由（router.ts）',
    '- `src/layouts/` — 布局组件（DefaultLayout）',
    '- `src/features/` — 按业务功能组织，每个功能按需包含 `api/`、`components/`、`composables/`、`stores/`、`types/`、`utils/`、`views/`',
    '- `src/shared/` — 跨功能复用的组件、组合式函数、store、常量、类型、工具与样式',
    ...(dual ? ['- `src/shared/components/platform/` — 双端自适应基础组件（element-plus / vant 封装）'] : []),
    '- `src/mocks/` — MSW mock（browser.ts / server.ts / handlers.ts）',
    '- `.storybook/` — Storybook 配置（preview 已全局加载 MSW 与日/夜主题切换）',
    '- `.env.development` / `.env.test` / `.env.production` — 多环境构建变量（`VITE_*` 前缀）',
    '',
    '## 关键约定',
    '',
    '### 视图就近目录化与弹窗拆分',
    '',
    '- `features/<feature>/components/` 只放**跨视图复用**的组件；仅被单个视图使用的弹窗、抽屉等独立区块，拆分后就近放在视图自己的目录下。',
    '- 简单视图保持 `views/` 下平铺单文件，这是默认形态；需要拆出弹窗等独立区块时（多个弹窗、单文件行数明显膨胀是典型信号）就地目录化：',
    '',
    '```',
    'views/',
    '  user-management/',
    '    UserManagementView.vue   # 视图：列表 + 行操作编排 + 弹窗打开/刷新',
    '    components/              # 页面私有组件（自治弹窗等）',
    '      EditUserDialog.vue',
    '    __tests__/               # 视图级测试',
    '```',
    '',
    '- 拆分出的弹窗做成**自治组件**：自持表单状态与校验，直调 feature `api/` 原始接口；成功/失败的 toast 均在弹窗内完成；成功后 `emit(\'update:modelValue\', false)` 关闭自己并 `emit(\'saved\')` 通知视图刷新列表。',
    '- ⚠️ feature 组合式函数若为每次调用独立实例（非 Pinia store），弹窗**不得**自行实例化它来调 mutation——列表刷新会打在弹窗自己的实例上，视图列表不会更新。',
    '- 弹窗组件命名动词前置：`EditUserDialog.vue`、`AddUserDialog.vue`。',
    '- 测试就近放置：视图级 spec 放 `views/<view-name>/__tests__/`；弹窗 spec 放其 `components/__tests__/`。',
    '',
    '### 图标使用',
    '',
    ...(dual
      ? [
          '- 图标一律使用图标库，禁止在 `.vue` 模板中内联 `<svg>` 自绘图标。',
          '- 通用图标（双端均可用）：`@element-plus/icons-vue`，经 `<el-icon>` 渲染；移动端语义图标（如返回箭头）可用 vant 字体图标。',
          '- 需要跨端的基础图标，封装到 `src/shared/components/platform/` 下的基础组件内统一处理。',
          '- 其他图标场景使用所选图标库' +
            (iconLibrary ? `（${ICON_LIBRARY_NAMES[iconLibrary]}）。` : '，按需自行安装。'),
        ]
      : [
          '- 图标一律使用图标库，禁止在 `.vue` 模板中内联 `<svg>` 自绘图标。' +
            (iconLibrary ? `本项目已预装 ${ICON_LIBRARY_NAMES[iconLibrary]}。` : ''),
        ]),
    '- 图标库确实没有对应图标时，允许使用图片资源（`src/**/assets`），并在代码注释中说明原因。',
    '- 例外：`src/shared/components/ThemeToggle.vue` 为骨架自带基础组件，其内联 SVG 属豁免；新写业务代码不得效仿。',
    '',
  ]

  if (dual) {
    lines.push(
      '### 容器自适应',
      '',
      '本项目采用“容器查询 (Container Queries)”作为组件自适应的核心机制，视口查询 (Media Queries) 仅保留用于页面骨架布局。',
      '',
      '- 组件内部严禁使用 `md:`、`lg:`、`xl:` 等视口断点修饰符。',
      '- 需要响应式的 UI 组件必须拥有容器上下文：父容器添加 `@container`，组件内部使用 `@sm:`、`@md:` 等容器断点（@xs ~ @7xl）。',
      '- 错误示例：`<div class="grid grid-cols-1 md:grid-cols-3">`',
      '- 正确示例：`<div class="@container"><div class="grid grid-cols-1 @md:grid-cols-3">`',
      '- 生成新组件时默认假设其需要自适应，主动为父容器添加 `@container`。',
      '- 拒绝使用 `!important` 覆盖响应式样式；组件在不同布局位置有显著形态变化时，优先容器查询而非额外 props。',
      '',
      '### 基础组件（`src/shared/components/platform/`）',
      '',
      '- 基础组件命名为 `Button.vue`、`Input.vue`、`Dialog.vue` 等简单命名。',
      '- 通过 `usePlatform()`（`src/shared/composables/usePlatform.ts`）判断 isDesktop / isMobile，分别渲染 element-plus / vant 组件；一方无类似组件则直接放弃该方。',
      '- 基础组件 props 保持与 element-plus 一致；vant 参数差异在组件内部抹平。',
      '- 新增基础组件的 props 命名不要用生僻字。',
      '',
      '### 统一封装（业务代码禁止绕过）',
      '',
      '- 确认弹窗：`useDialog()`（`src/shared/composables/useDialog.ts`），禁止直接使用 `ElMessageBox`、vant `showConfirmDialog`。',
      '- 轻提示：`toast()`（`src/shared/utils/toast.ts`），禁止直接使用 `ElMessage`、vant `showToast`。',
      '- 平台判断：`usePlatform()`。',
      '- UI 组件一律优先使用 `src/shared/components/platform/` 下的基础组件；新增需求先扩展基础组件，不要在业务代码直接引入 element-plus / vant 的组件与函数式 API（ESLint `no-restricted-imports` 已强制拦截函数式 API）。',
      ''
    )
  }

  const darkModeLines = [
    '### 日间/夜间模式',
    '',
    '- Tailwind 配置 `darkMode: \'class\'`，主题类挂载在 `document.documentElement`。',
    '- 默认跟随系统偏好；手动切换后读取 `localStorage`。',
    '- 统一通过 `themeStore.setTheme()` 或 `useTheme()` 切换主题。',
  ]
  if (uiLibraries.includes('element-plus')) {
    darkModeLines.push(
      '- Element Plus 暗色变量已由 `src/shared/styles/index.css` 自动导入（`element-plus/theme-chalk/dark/css-vars.css`），EP 组件随 `.dark` 类自动切换，无需手动处理。'
    )
  }
  if (uiLibraries.includes('ant-design-vue')) {
    darkModeLines.push('- Ant Design Vue 4.x 为 cssinjs，暗色需在根节点用 `ConfigProvider` 配置 theme algorithm，骨架未内置，需自行接入。')
  }
  if (uiLibraries.includes('vant')) {
    darkModeLines.push('- Vant 暗色需 `ConfigProvider theme="dark"`（双端项目的移动侧），骨架未内置，需自行接入。')
  }
  darkModeLines.push('')
  lines.push(...darkModeLines)

  lines.push(
    '### MSW Mock',
    '',
    '- 开发环境自动注册 MSW worker（main.ts 中 `enableMocking`）。',
    '- REST handlers 放在 `src/mocks/handlers.ts`（骨架仅保留 `/api/health` 示例）。',
    '- 测试环境在 `vitest.setup.ts` 中启用 `msw/node` server。',
    '- Storybook 在 `.storybook/preview.ts` 中全局加载 MSW，story 内请求直接打到 mock。',
    '- `public/mockServiceWorker.js` 由 `postinstall`（`msw init`）自动生成，必须存在。',
    '',
    '### Storybook',
    '',
    '- `npm run storybook` 启动组件开发环境（端口 6006）。',
    '- preview 已全局加载 MSW worker 与日/夜主题切换 toolbar（顶部 Theme 开关），无需在单个 story 中重复处理。',
    '- story 与组件就近放置：`<Component>.stories.ts` 与组件同目录。',
    '',
    '### 多环境构建',
    '',
    '- `build:dev` / `build:test` / `build:prod` 分别加载 `.env.development` / `.env.test` / `.env.production`。',
    '- 环境变量统一以 `VITE_` 前缀暴露，经 `import.meta.env.VITE_*` 读取；骨架占位变量为 `VITE_API_BASE_URL`。',
    '',
    '### 代码规范',
    '',
    '- 优先使用命名导出。',
    '- 异步操作必须有错误处理。',
    '- 代码必须优雅。',
    '- CSS 优先使用 Tailwind 原子类，复杂效果再用组件内 `<style lang="scss" scoped>`。',
    '',
    '### SCSS 样式',
    '',
    '- 全局变量与 mixin 位于 `src/shared/styles/scss/`（variables.scss / mixins.scss），经 vite `additionalData` 自动注入，组件内直接使用，禁止手动 import。',
    '- 颜色禁止硬编码，统一使用 `rgb(var(--color-*))`（底层是 theme.css 的 CSS 变量），否则日间/夜间模式失效。',
    '- 注入文件中只允许定义变量与 mixin，禁止写产生 CSS 输出的规则。',
    ''
  )

  writeFileSync(join(targetDir, 'AGENTS.md'), lines.join('\n'))
}
