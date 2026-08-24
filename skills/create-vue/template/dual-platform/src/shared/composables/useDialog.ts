import { ElMessageBox } from 'element-plus'
import { WarningFilled } from '@element-plus/icons-vue'
import { showConfirmDialog, closeDialog } from 'vant'
import 'element-plus/theme-chalk/el-message-box.css'
import 'vant/lib/dialog/style'
import { usePlatform } from '@/shared/composables/usePlatform'
import { toast } from '@/shared/utils/toast'

export interface DialogOptions {
  title?: string
  content?: string
  /** 传入 htmlContent 时，调用方必须确保内容已转义或来自可信来源，避免 XSS */
  htmlContent?: string
  cancelText?: string
  confirmText?: string
  showCancel?: boolean
  /** 危险操作（删除 / 取消 / 结束等）：确认按钮红色；桌面端另附 WarningFilled 红色警示图标（移动端函数式 API 无图标能力，放弃） */
  danger?: boolean
  beforeConfirm?: () => boolean | Promise<boolean | void> | void
}

function getMessage(options: DialogOptions): string {
  return options.htmlContent ?? options.content ?? ''
}

function openDesktopDialog(options: DialogOptions): Promise<'confirm'> {
  return new Promise<'confirm'>((resolve, reject) => {
    ElMessageBox.confirm(getMessage(options), options.title || '温馨提示', {
      confirmButtonText: options.confirmText || '确定',
      cancelButtonText: options.cancelText || '取消',
      showCancelButton: options.showCancel !== false,
      closeOnClickModal: false,
      closeOnPressEscape: false,
      dangerouslyUseHTMLString: !!options.htmlContent,
      ...(options.danger
        ? { icon: WarningFilled, confirmButtonClass: 'el-button--danger', customClass: 'app-dialog--danger' }
        : {}),
      beforeClose: async (action: 'confirm' | 'cancel' | 'close', instance, done) => {
        if (action === 'confirm') {
          if (typeof options.beforeConfirm === 'function') {
            instance.confirmButtonLoading = true
            try {
              const result = await options.beforeConfirm()
              if (result === false) return
            } catch {
              toast('操作失败，请重试', { type: 'error' })
              return
            } finally {
              instance.confirmButtonLoading = false
            }
          }
          done()
          resolve('confirm')
          return
        }
        done()
        reject(action === 'cancel' ? 'cancel' : 'close')
      },
    })
  })
}

function openMobileDialog(options: DialogOptions): Promise<'confirm'> {
  return new Promise<'confirm'>((resolve, reject) => {
    showConfirmDialog({
      title: options.title || '温馨提示',
      message: getMessage(options),
      allowHtml: !!options.htmlContent,
      showCancelButton: options.showCancel !== false,
      confirmButtonText: options.confirmText || '确定',
      cancelButtonText: options.cancelText || '取消',
      ...(options.danger ? { confirmButtonColor: 'var(--van-danger-color)' } : {}),
      closeOnClickOverlay: false,
      beforeClose: async (action: 'confirm' | 'cancel') => {
        if (action === 'confirm') {
          if (typeof options.beforeConfirm === 'function') {
            try {
              const result = await options.beforeConfirm()
              if (result === false) return false
            } catch {
              toast('操作失败，请重试', { type: 'error' })
              return false
            }
          }
        }
        return true
      },
    })
      .then(() => resolve('confirm'))
      .catch(() => reject('cancel'))
  })
}

export function useDialog() {
  function open(options: DialogOptions = {}): Promise<'confirm'> {
    const { platform } = usePlatform()
    if (platform.value === 'desktop') {
      return openDesktopDialog(options)
    }
    return openMobileDialog(options)
  }

  function close() {
    const { platform } = usePlatform()
    if (platform.value === 'desktop') {
      ElMessageBox.close()
      return
    }
    closeDialog()
  }

  return { open, close }
}
