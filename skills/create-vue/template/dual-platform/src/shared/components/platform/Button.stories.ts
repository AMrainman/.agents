import type { Meta, StoryObj } from '@storybook/vue3'
import Button from './Button.vue'

const meta: Meta<typeof Button> = {
  title: 'Platform/Button',
  component: Button,
  argTypes: {
    type: {
      control: 'select',
      options: ['primary', 'success', 'warning', 'danger', 'info', 'default', 'text'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
  },
  // 桌面/移动渲染请使用 Storybook 顶部 toolbar 的 viewport 切换；
  // 主题切换请使用 Theme 开关（preview 已全局挂载日/夜模式与 MSW）
}

export default meta

type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    type: 'primary',
    size: 'medium',
    default: '主要按钮',
  },
}

export const Plain: Story = {
  args: {
    type: 'default',
    size: 'medium',
    default: '普通按钮',
  },
}
