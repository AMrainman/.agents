<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { usePlatform } from '@/shared/composables/usePlatform'
import { useTheme } from '@/shared/composables/useTheme'

type ButtonType = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default' | 'text'

interface Props {
  type?: ButtonType
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  block?: boolean
  round?: boolean
  plain?: boolean
  nativeType?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'small',
  nativeType: 'button',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const { isDesktop } = usePlatform()
const { theme } = useTheme()
const attrs = useAttrs()

const elType = computed(() => {
  const map: Record<string, '' | 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'text'> = {
    primary: 'primary',
    default: '',
    danger: 'danger',
    success: 'success',
    warning: 'warning',
    info: 'info',
    text: 'text',
  }
  return map[props.type]
})

const vanType = computed(() => {
  const map: Record<string, 'primary' | 'success' | 'danger' | 'warning' | 'default'> = {
    primary: 'primary',
    success: 'success',
    danger: 'danger',
    default: 'default',
    warning: 'warning',
    info: 'default',
    text: 'default',
  }
  return map[props.type]
})

const elSize = computed(() => {
  const map: Record<string, 'small' | 'default' | 'large'> = {
    small: 'small',
    medium: 'default',
    large: 'large',
  }
  return map[props.size]
})

const vanSize = computed(() => {
  const map: Record<string, 'small' | 'normal' | 'large'> = {
    small: 'small',
    medium: 'normal',
    large: 'large',
  }
  return map[props.size]
})

const sizeClass = computed(() => {
  const map: Record<string, string> = {
    small: 'h-8 px-3 text-sm rounded-md font-medium',
    medium: 'h-10 px-4 text-sm rounded-lg font-medium',
    large: 'h-11 px-5 text-base font-semibold rounded-lg',
  }
  return map[props.size]
})

const rootClass = computed(() => [sizeClass.value, { 'w-full': props.block }, attrs.class])

defineOptions({ inheritAttrs: false })
</script>

<template>
  <ElButton
    v-if="isDesktop"
    v-bind="attrs"
    :class="rootClass"
    :type="elType"
    :size="elSize"
    :disabled="disabled"
    :loading="loading"
    :round="round"
    :plain="plain"
    :native-type="nativeType"
    :dark="theme === 'dark'"
    @click="emit('click', $event)"
  >
    <slot />
  </ElButton>
  <VanButton
    v-else
    v-bind="attrs"
    :class="rootClass"
    :type="vanType"
    :size="vanSize"
    :disabled="disabled"
    :loading="loading"
    :block="block"
    :round="round"
    :plain="plain"
    :native-type="nativeType"
    @click="emit('click', $event)"
  >
    <slot />
  </VanButton>
</template>
