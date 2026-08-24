<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface HealthResp {
  code: number
  data: { status: string }
}

// 演示 MSW 拦截：开发环境下 /api/health 由 src/mocks/handlers.ts 提供
const health = ref('加载中...')

onMounted(async () => {
  try {
    const res = await fetch('/api/health')
    const json = (await res.json()) as HealthResp
    health.value = json.data.status
  } catch {
    health.value = '请求失败'
  }
})
</script>

<template>
  <div class="mx-auto flex w-full max-w-5xl flex-col px-4 py-6">
    <h1 class="mb-4 text-2xl font-bold text-text">首页</h1>
    <p class="text-text-secondary">欢迎来到 Vue 项目骨架。</p>
    <p class="mt-2 text-sm text-text-muted">
      MSW 健康检查：
      <span class="font-medium text-text">{{ health }}</span>
    </p>
  </div>
</template>
