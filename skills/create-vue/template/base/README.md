# Vue Project

基于 Vue 3 + Pinia + TypeScript + Vite + Tailwind CSS + SCSS 的项目骨架，内置 Vue Router、MSW、ESLint、Prettier、Vitest。

## 快速开始

```bash
npm install
npm run dev
```

访问终端输出的本地地址（默认 http://localhost:5173 ）。

## 脚本说明

- `npm run dev`：启动开发服务器
- `npm run build`：类型检查 + 生产构建
- `npm run type-check`：TypeScript 类型检查
- `npm run test`：运行 Vitest 测试
- `npm run test:watch`：监听模式运行测试
- `npm run lint`：运行 ESLint
- `npm run lint:fix`：自动修复 ESLint 问题
- `npm run format`：Prettier 格式化

## 目录结构

- `src/app/` — 应用入口与全局路由
- `src/layouts/` — 布局组件
- `src/features/` — 按业务功能组织
- `src/shared/` — 跨功能复用的组件、组合式函数、store、类型、工具与样式
- `src/mocks/` — MSW mock

更多约定见 `CLAUDE.md`。
