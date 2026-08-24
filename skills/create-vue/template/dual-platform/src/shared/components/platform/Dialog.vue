<script setup lang="ts">
import { usePlatform } from '@/shared/composables/usePlatform'

interface Props {
  modelValue: boolean
  title?: string
  width?: string | number
  confirmText?: string
  cancelText?: string
  confirmLoading?: boolean
  confirmDisabled?: boolean
  cancelDisabled?: boolean
}

withDefaults(defineProps<Props>(), {
  width: '420px',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

const { isDesktop } = usePlatform()

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}

defineOptions({ inheritAttrs: false })
</script>

<template>
  <ElDialog
    v-if="isDesktop"
    v-bind="$attrs"
    :model-value="modelValue"
    :title="title"
    :width="width"
    align-center
    destroy-on-close
    @update:model-value="emit('update:modelValue', $event)"
  >
    <slot />
    <template #footer>
      <slot name="footer">
        <div v-if="confirmText || cancelText" class="flex justify-end gap-3">
          <Button v-if="cancelText" type="default" :disabled="cancelDisabled" @click="handleCancel">
            {{ cancelText }}
          </Button>
          <Button
            v-if="confirmText"
            type="primary"
            :loading="confirmLoading"
            :disabled="confirmDisabled"
            @click="handleConfirm"
          >
            {{ confirmText }}
          </Button>
        </div>
      </slot>
    </template>
  </ElDialog>
  <VanDialog
    v-else
    v-bind="$attrs"
    :show="modelValue"
    :title="title"
    :show-confirm-button="false"
    :show-cancel-button="false"
    :close-on-click-overlay="true"
    @update:show="emit('update:modelValue', $event)"
  >
    <div class="p-4">
      <slot />
    </div>
    <!-- 底部按钮：移动端等分（参考 showConfirmDialog），插槽内容也由统一容器承载 -->
    <div v-if="$slots.footer || confirmText || cancelText" class="flex gap-3 border-t border-border p-4 [&>*]:flex-1">
      <slot name="footer">
        <Button v-if="cancelText" type="default" :disabled="cancelDisabled" block @click="handleCancel">
          {{ cancelText }}
        </Button>
        <Button
          v-if="confirmText"
          type="primary"
          :loading="confirmLoading"
          :disabled="confirmDisabled"
          block
          @click="handleConfirm"
        >
          {{ confirmText }}
        </Button>
      </slot>
    </div>
  </VanDialog>
</template>
