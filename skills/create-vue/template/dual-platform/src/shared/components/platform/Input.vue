<script setup lang="ts">
import { computed, useAttrs, useId } from 'vue'
import { usePlatform } from '@/shared/composables/usePlatform'

interface Props {
  modelValue: string
  placeholder?: string
  type?: 'text' | 'password' | 'tel' | 'number' | 'search' | 'url' | 'email' | 'textarea'
  inputmode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url'
  disabled?: boolean
  clearable?: boolean
  maxlength?: number | string
  rows?: number
  id?: string
  size?: 'small' | 'default' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'default',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
  input: [value: string]
  clear: []
  search: []
}>()

const attrs = useAttrs()
const fallbackId = useId()
const inputId = computed(() => props.id ?? fallbackId)
const { isDesktop } = usePlatform()

const rootClass = 'rounded-lg'

defineOptions({ inheritAttrs: false })

function handleInput(value: string) {
  emit('update:modelValue', value)
  emit('input', value)
}
</script>

<template>
  <ElInput
    v-if="isDesktop"
    v-bind="attrs"
    :id="inputId"
    :class="rootClass"
    :model-value="modelValue"
    :type="type"
    :inputmode="inputmode"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :maxlength="maxlength"
    :rows="rows"
    :size="size"
    @update:model-value="emit('update:modelValue', $event)"
    @input="emit('input', $event)"
    @blur="emit('blur', $event)"
    @focus="emit('focus', $event)"
    @clear="emit('clear')"
    @keyup.enter="emit('search')"
  >
    <template v-if="$slots.prefix" #prefix>
      <slot name="prefix" />
    </template>
  </ElInput>
  <VanField
    v-else
    v-bind="attrs"
    :id="inputId"
    :class="rootClass"
    :model-value="modelValue"
    :type="type"
    :inputmode="inputmode"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :maxlength="maxlength"
    :rows="rows"
    @update:model-value="handleInput"
    @blur="emit('blur', $event)"
    @focus="emit('focus', $event)"
    @clear="emit('clear')"
    @keypress.enter="emit('search')"
  >
    <template v-if="$slots.prefix" #left-icon>
      <slot name="prefix" />
    </template>
  </VanField>
</template>
