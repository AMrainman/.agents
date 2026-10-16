import type { Meta, StoryObj } from '@storybook/vue3'
import ThemeToggle from './ThemeToggle.vue'

const meta: Meta<typeof ThemeToggle> = {
  title: 'Shared/ThemeToggle',
  component: ThemeToggle,
  // 主题切换请使用 Storybook 顶部 toolbar 的 Theme 开关（preview 已全局挂载日/夜模式）
}

export default meta

type Story = StoryObj<typeof ThemeToggle>

export const Default: Story = {}
