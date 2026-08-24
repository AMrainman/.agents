// 端适配选项
export const PLATFORM_OPTIONS = [
  { name: '仅 Web 端', value: 'web' },
  { name: '双端适配（桌面 + 移动 H5）', value: 'dual' },
]

// UI 库选项（单选；选择双端适配时自动锁定为 Element Plus + Vant）
export const UI_LIBRARIES = [
  { name: 'Element Plus', value: 'element-plus' },
  { name: 'Vant', value: 'vant' },
  { name: '其他', value: 'other' },
]

// 图标库选项（单选）
export const ICON_LIBRARIES = [
  { name: 'FontAwesome', value: 'fontawesome' },
  { name: 'Heroicons', value: 'heroicons' },
  { name: 'Lucide', value: 'lucide' },
  { name: '其他', value: 'other' },
]

// UI 库依赖（dependencies）
export const UI_LIBRARY_DEPS = {
  'element-plus': {
    'element-plus': '^2.14.4',
    '@element-plus/icons-vue': '^2.3.2',
  },
  vant: {
    vant: '^4.9.0',
  },
}

// 图标库依赖（dependencies）
export const ICON_LIBRARY_DEPS = {
  fontawesome: {
    '@fortawesome/fontawesome-svg-core': '^6.5.0',
    '@fortawesome/free-solid-svg-icons': '^6.5.0',
    '@fortawesome/vue-fontawesome': '^3.0.6',
  },
  heroicons: {
    '@heroicons/vue': '^2.1.5',
  },
  lucide: {
    'lucide-vue-next': '^1.0.0',
  },
}

export const UI_LIBRARY_NAMES = {
  'element-plus': 'Element Plus',
  vant: 'Vant',
}

export const ICON_LIBRARY_NAMES = {
  fontawesome: 'FontAwesome',
  heroicons: 'Heroicons',
  lucide: 'Lucide',
}
