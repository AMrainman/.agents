import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  // Storybook 9+ 已内置 docs/controls/actions/viewport 等 essential 插件，无需单独安装
  addons: [],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
}

export default config
