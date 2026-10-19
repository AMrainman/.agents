// 端适配选项
export const PLATFORM_OPTIONS = [
  { name: '仅 Web 端', value: 'web' },
  { name: '双端适配（桌面 + 移动 H5）', value: 'dual' },
]

// UI 库选项（单选；选择双端适配时自动锁定为 Element Plus + Vant）
export const UI_LIBRARIES = [
  { name: 'Element Plus', value: 'element-plus' },
  { name: 'Ant Design Vue', value: 'ant-design-vue' },
  { name: '其他', value: 'other' },
]

// 图标库选项（单选）
export const ICON_LIBRARIES = [
  { name: 'FontAwesome', value: 'fontawesome' },
  { name: 'Iconify', value: 'iconify' },
  { name: '其他', value: 'other' },
]

// unplugin-vue-components 各 UI 库的 resolver（具名导入）
export const UI_RESOLVER_IMPORTS = {
  'element-plus': 'ElementPlusResolver',
  'ant-design-vue': 'AntDesignVueResolver',
  vant: 'VantResolver',
}

// vite 环境（开发/构建）resolver 调用（含样式策略）
export const UI_RESOLVER_CALLS = {
  'element-plus': "ElementPlusResolver({ importStyle: 'css' })",
  // ant-design-vue 4.x 使用 cssinjs，关闭样式文件导入
  'ant-design-vue': 'AntDesignVueResolver({ importStyle: false })',
  vant: 'VantResolver({ importStyle: true })',
}

// vitest 环境 resolver 调用（jsdom 中无需解析样式文件）
export const UI_RESOLVER_TEST_CALLS = {
  'element-plus': 'ElementPlusResolver()',
  'ant-design-vue': 'AntDesignVueResolver()',
  vant: 'VantResolver()',
}

// UI 库依赖（dependencies）；element-plus / ant-design-vue 自动携带各自官方图标库
export const UI_LIBRARY_DEPS = {
  'element-plus': {
    'element-plus': '^2.14.4',
    '@element-plus/icons-vue': '^2.3.2',
  },
  'ant-design-vue': {
    'ant-design-vue': '^4.2.6',
    '@ant-design/icons-vue': '^7.0.1',
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
  iconify: {
    '@iconify/vue': '^4.3.0',
  },
}

export const UI_LIBRARY_NAMES = {
  'element-plus': 'Element Plus',
  'ant-design-vue': 'Ant Design Vue',
  vant: 'Vant',
}

export const ICON_LIBRARY_NAMES = {
  fontawesome: 'FontAwesome',
  iconify: 'Iconify',
}
