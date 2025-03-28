import { createRequire } from 'module'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
/** 缓存已解析的npm包路径 */
const npmCached: Record<string, string> = {}

// 处理不同模块格式的情况
const getRequire = () => {
  try {
    // ESM 模式
    const __filename = fileURLToPath(import.meta.url)
    return createRequire(__filename)
  } catch (error) {
    // CommonJS 模式
    return require
  }
}

/**
 * 同步解析npm包的路径
 * @param {string} pluginName - npm包名
 * @param {string} root - 项目根目录路径
 * @returns {string} npm包的绝对路径
 */
export function resolveNpmSync(pluginName: string, root: string): string {
  const req = getRequire()
  const resolvePath = req('resolve')
  if (!npmCached[pluginName]) {
    npmCached[pluginName] = resolvePath.sync(pluginName, { basedir: root })
  }
  return npmCached[pluginName]
}

/**
 * 同步获取npm包
 * @param {string} name - 包名
 * @param {string} searchPath - 搜索路径
 * @returns {any} 导入的包
 * @throws {Error} 当找不到包时抛出错误
 */
export function getNpmPkgSync(name: string, searchPath: string): any {
  try {
    // 首先尝试从项目目录导入
    const projectImport = path.join(searchPath, 'node_modules', name)
    try {
      return require(projectImport)
    } catch (error) {
      // 如果从项目目录导入失败，尝试直接导入（全局安装）
      return require(name)
    }
  } catch (error) {
    // 如果导入失败，抛出错误
    throw new Error(`无法导入包 ${name}，请确保它已安装。错误: ${(error as Error).message}`)
  }
}

/**
 * 异步获取npm包
 * @param {string} name - 包名
 * @param {string} searchPath - 搜索路径
 * @returns {Promise<any>} 导入的包
 */
export async function getNpmPkg(name: string, searchPath: string): Promise<any> {
  try {
    // 首先尝试从项目目录导入
    const projectImport = path.join(searchPath, 'node_modules', name)
    try {
      return await import(projectImport)
    } catch (error) {
      // 如果从项目目录导入失败，尝试直接导入（全局安装）
      return await import(name)
    }
  } catch (error) {
    // 如果导入失败，抛出错误
    throw new Error(`无法导入包 ${name}，请确保它已安装。错误: ${(error as Error).message}`)
  }
}
