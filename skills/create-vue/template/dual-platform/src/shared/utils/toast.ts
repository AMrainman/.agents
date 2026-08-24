import { showToast, type ToastType } from 'vant'
import { ElMessage } from 'element-plus'
import 'element-plus/theme-chalk/el-message.css'
import 'vant/lib/toast/style'
import { usePlatform } from '@/shared/composables/usePlatform'

export interface ToastOptions {
  type?: 'info' | 'success' | 'error' | 'warning' | 'primary'
  duration?: number
}

export function toast(message: string, options: ToastOptions = {}): Promise<void> {
  const { isDesktop } = usePlatform()

  return new Promise(resolve => {
    if (isDesktop.value) {
      ElMessage({
        message,
        type: 'info',
        ...options,
        onClose: () => resolve(),
      })
    } else {
      showToast({
        message,
        type: toVantType(options.type),
        onClose: () => resolve(),
        zIndex: 9999,
      })
    }
  })
}

function toVantType(type: NonNullable<ToastOptions['type']> = 'info'): ToastType {
  const map: Record<NonNullable<ToastOptions['type']>, ToastType> = {
    info: 'text',
    success: 'success',
    error: 'fail',
    warning: 'text',
    primary: 'text',
  }
  return map[type]
}
