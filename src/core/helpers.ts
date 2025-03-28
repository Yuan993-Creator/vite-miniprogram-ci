import * as path from 'node:path'
import * as process from 'node:process'
import * as globLib from 'glob'
import chalk from 'chalk'
import { printLog, processTypeEnum } from '../utils/logger'

const glob = globLib.sync || globLib

interface Options {
  version?: string
  desc?: string
  [key: string]: any
}

/**
 * 解析项目路径
 * 如果提供的路径是相对路径，则相对于当前工作目录解析
 * @param {string} projectPath 项目路径
 * @returns {string} 解析后的项目路径
 */
export function resolveProjectPath(projectPath: string): string {
  if (!projectPath) {
    return process.cwd()
  }
  if (path.isAbsolute(projectPath)) {
    return projectPath
  }
  return path.resolve(process.cwd(), projectPath)
}

/**
 * 生成版本号
 * @param {Options} options 选项对象
 * @returns {string} 生成的版本号
 */
export function generateVersion(options: Options): string {
  if (options.version) {
    return options.version
  }

  // 尝试从运行目录下的package.json获取版本号
  try {
    const pkg = require(path.resolve(process.cwd(), 'package.json'))
    if (pkg && pkg.version) {
      return pkg.version
    }
  } catch (error) {
    printLog(processTypeEnum.ERROR, chalk.red('读取package.json失败，无法获取版本号'))
  }

  // 默认返回日期时间戳格式的版本号
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')

  return `${year}${month}${day}.${hour}${minute}`
}

/**
 * 生成描述
 * @param {Options} options 选项对象
 * @returns {string} 生成的描述信息
 */
export function generateDesc(options: Options): string {
  // 如果提供了描述，直接返回
  if (options.desc) {
    return options.desc
  }

  // 默认返回带时间的CI构建信息
  return `CI构建 ${new Date().toLocaleString()}`
}

/**
 * 查找文件
 * @param {string} pattern 文件匹配模式
 * @param {string} baseDir 基础目录
 * @returns {string[]} 匹配的文件列表
 */
export function findFiles(pattern: string, baseDir: string): string[] {
  return glob(pattern, { cwd: baseDir, absolute: true })
}
