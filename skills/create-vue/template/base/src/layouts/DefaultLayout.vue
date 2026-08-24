<script setup lang="ts">
import ThemeToggle from '@/shared/components/ThemeToggle.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-background text-text">
    <header class="border-b border-border bg-surface">
      <nav class="mx-auto flex w-full max-w-5xl items-center gap-6 px-4 py-3">
        <RouterLink to="/" class="text-sm font-medium text-text-secondary hover:text-text" active-class="text-primary">
          首页
        </RouterLink>
        <RouterLink
          to="/about"
          class="text-sm font-medium text-text-secondary hover:text-text"
          active-class="text-primary"
        >
          关于
        </RouterLink>
        <div class="ml-auto">
          <ThemeToggle />
        </div>
      </nav>
    </header>
    <main class="flex flex-1 flex-col">
      <slot />
    </main>
  </div>
</template>
