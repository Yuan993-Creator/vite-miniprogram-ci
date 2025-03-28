import * as path from 'node:path'
import * as process from 'node:process'
import fs from 'fs-extra'

export interface CIOptions {
  projectPath?: string
  version?: string
  desc?: string
  [key: string]: any
}

class BaseCI {
  protected pluginOpts: CIOptions
  protected version: string
  protected desc: string
  protected projectPath?: string

  /**
   * @param {CIOptions} pluginOpts 传入的插件选项
   */
  constructor(pluginOpts: CIOptions) {
    this.pluginOpts = pluginOpts
    const appPath = process.cwd()
    const packageInfo = JSON.parse(
      fs.readFileSync(path.join(appPath, 'package.json'), {
        encoding: 'utf8',
      }),
    )
    this.version = pluginOpts.version || packageInfo?.version
    this.desc = pluginOpts.desc || `CI构建自动构建于${new Date().toLocaleTimeString()}`
    // console.log('this.desc', this)
  }

  /**
   * @param {string} path
   */
  setProjectPath(path: string): void {
    this.projectPath = path
  }

  /** 初始化函数，new实例化后会被立即调用一次 */
  init(): void {
    throw new Error('Must implement init method')
  }

  /** 打开小程序项目 */
  open(): void {
    throw new Error('Must implement open method')
  }

  /** 上传小程序 */
  upload(): void {
    throw new Error('Must implement upload method')
  }

  /** 预览小程序 */
  preview(): void {
    throw new Error('Must implement preview method')
  }
}

export default BaseCI
