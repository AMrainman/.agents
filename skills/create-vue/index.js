#!/usr/bin/env node
import { existsSync } from 'fs'
import { join, resolve } from 'path'
import { generateProject } from './lib/generate.js'

function parseProjectName() {
  const args = process.argv.slice(2)
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--options') {
      i++ // 跳过 --options 的 JSON 值
      continue
    }
    if (!args[i].startsWith('--')) return args[i]
  }
  return null
}

function parseOptionsArg() {
  const idx = process.argv.indexOf('--options')
  if (idx === -1 || !process.argv[idx + 1]) return null
  try {
    return JSON.parse(process.argv[idx + 1])
  } catch {
    console.error('无法解析 --options 参数')
    process.exit(1)
  }
}

function main() {
  const projectName = parseProjectName()
  const options = parseOptionsArg()

  if (projectName && (projectName.includes('/') || projectName.includes('\\') || /^\.+$/.test(projectName))) {
    console.error(`项目名称不合法：${projectName}（不允许包含路径分隔符或为 "." / ".."）`)
    process.exit(1)
  }

  const targetDir = projectName ? resolve(process.cwd(), projectName) : process.cwd()

  if (projectName && existsSync(targetDir)) {
    console.error(`当前目录已存在名为 ${projectName} 的文件或文件夹，创建已取消`)
    process.exit(1)
  }

  if (!options) {
    console.error('请通过 --options 传入生成选项，例如：')
    console.error(
      `node index.js my-app --options '{"dualPlatform":false,"uiLibrary":"element-plus","iconLibrary":"fontawesome"}'`
    )
    process.exit(1)
  }

  console.log(`正在生成项目...${projectName ? `（目录：${projectName}）` : ''}`)
  generateProject(targetDir, options).then(
    () => {
      console.log('项目骨架生成完成')
      console.log(projectName ? `请进入目录：cd ${projectName}` : '')
      console.log('请手动安装依赖：npm install')
      console.log('然后启动开发服务器：npm run dev')
    },
    err => {
      console.error(err)
      process.exit(1)
    }
  )
}

main()
