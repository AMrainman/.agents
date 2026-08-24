import { computed, readonly, ref } from 'vue'

export type Platform = 'desktop' | 'mobile'

const DEFAULT_BREAKPOINT = 768

function getPlatform(breakpoint: number = DEFAULT_BREAKPOINT): Platform {
  if (typeof window === 'undefined') return 'desktop'
  const forced = import.meta.env.VITE_PLATFORM as string | undefined
  if (forced === 'desktop' || forced === 'mobile') return forced
  return window.innerWidth >= breakpoint ? 'desktop' : 'mobile'
}

// 模块级单例：全局共享同一份平台状态，避免重复注册 resize 监听
const platform = ref<Platform>(getPlatform())

if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => {
    platform.value = getPlatform()
  })
}

export function usePlatform() {
  const isDesktop = computed(() => platform.value === 'desktop')
  const isMobile = computed(() => platform.value === 'mobile')

  return {
    platform: readonly(platform),
    isDesktop,
    isMobile,
  }
}
