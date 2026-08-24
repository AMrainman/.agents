<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Button from '@/shared/components/platform/Button.vue'
import Input from '@/shared/components/platform/Input.vue'
import { useDialog } from '@/shared/composables/useDialog'
import { toast } from '@/shared/utils/toast'

interface HealthResp {
  code: number
  data: { status: string }
}

// 演示 MSW 拦截：开发环境下 /api/health 由 src/mocks/handlers.ts 提供
const health = ref('加载中...')
const name = ref('')
const dialog = useDialog()

onMounted(async () => {
  try {
    const res = await fetch('/api/health')
    const json = (await res.json()) as HealthResp
    health.value = json.data.status
  } catch {
    health.value = '请求失败'
  }
})

async function handleSubmit() {
  try {
    await dialog.open({ title: '确认提交', content: `确定要提交「${name.value || '空内容'}」吗？` })
    await toast('提交成功', { type: 'success' })
  } catch {
    // 用户取消，无需处理
  }
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-5xl flex-col px-4 py-6">
    <h1 class="mb-4 text-2xl font-bold text-text">首页</h1>
    <p class="text-text-secondary">欢迎来到 Vue 项目骨架（桌面 / 移动 H5 双端）。</p>
    <p class="mt-2 text-sm text-text-muted">
      MSW 健康检查：
      <span class="font-medium text-text">{{ health }}</span>
    </p>

    <!-- platform 基础组件 + 统一封装示例 -->
    <div class="mt-6 flex max-w-sm flex-col gap-3">
      <Input v-model="name" placeholder="请输入内容" clearable />
      <Button type="primary" @click="handleSubmit">提交（弹确认框 + toast）</Button>
    </div>
  </div>
</template>
