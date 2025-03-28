/* eslint-disable no-console */
import * as crypto from 'node:crypto'
import * as os from 'node:os'
import * as path from 'node:path'
import fs from 'fs-extra'
import chalk from 'chalk'
import * as shell from 'shelljs'
import { printLog, processTypeEnum } from '../../utils/logger'
import BaseCI from '../../core/BaseCi'
import { getNpmPkgSync } from '../../utils/npm'
import {
  generateQrcodeImageFile,
  printQrcode2Terminal,
  readQrcodeImageContent,
  getUserHomeDir,
} from '../../utils'
import type { CIOptions } from '../../core/BaseCi'

interface WeappProjectConfig {
  type: string
  projectPath: string
  appid: string
  privateKeyPath: string
  ignores?: string[]
}

interface WeappUploadResult {
  subPackageInfo?: {
    name: string
    size: number
  }[]
}

/**
 * 微信小程序CI工具类
 * @extends BaseCI
 */
export class WeappCI extends BaseCI {
  private instance: any // miniprogram-ci 实例类型
  private devToolsInstallPath: string
  private ci: any // miniprogram-ci 模块类型

  constructor(pluginOpts: CIOptions) {
    super(pluginOpts)
    this.instance = null
    /** 微信开发者安装路径 */
    this.devToolsInstallPath = ''
    /** 微信小程序CI实例 */
    this.ci = null
  }

  /**
   * 初始化微信小程序CI配置
   * @throws {Error} 当weapp配置缺失或miniprogram-ci依赖未安装时抛出错误
   */
  init(): void {
    const appPath = process.cwd()
    if (!this.pluginOpts.weapp) {
      throw new Error('请为"unicore-mini-ci"插件配置 "weapp" 选项')
    }
    try {
      this.ci = getNpmPkgSync('miniprogram-ci', appPath)
    } catch (error) {
      this.logError('请安装依赖：miniprogram-ci', error as Error)
      throw new Error('Dependency miniprogram-ci is not installed')
    }
    // 设置开发者工具安装路径
    this.devToolsInstallPath =
      this.pluginOpts.weapp.devToolsInstallPath || this.getDefaultDevToolsPath()
    delete this.pluginOpts.weapp.devToolsInstallPath

    // 配置微信小程序项目信息
    const weappConfig = this.getWeappConfig(appPath)
    const privateKeyPath = path.isAbsolute(weappConfig.privateKeyPath)
      ? weappConfig.privateKeyPath
      : path.join(appPath, weappConfig.privateKeyPath)
    if (!fs.pathExistsSync(privateKeyPath)) {
      throw new Error(`"weapp.privateKeyPath"选项配置的路径不存在,本次上传终止:${privateKeyPath}`)
    }
    this.instance = new this.ci.Project(weappConfig)
  }

  /**
   * 获取默认的微信开发者工具安装路径
   * @returns {string} 返回默认的安装路径
   */
  getDefaultDevToolsPath(): string {
    return process.platform === 'darwin'
      ? '/Applications/wechatwebdevtools.app'
      : 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具'
  }

  /**
   * 获取微信小程序的配置信息
   * @param {string} appPath - 应用程序的当前工作目录路径
   * @returns {Object} 返回微信小程序的配置信息对象
   */
  getWeappConfig(appPath: string): WeappProjectConfig {
    return {
      type: 'miniProgram',
      projectPath: this.pluginOpts.weapp.projectPath,
      appid: this.pluginOpts.weapp.appid,
      privateKeyPath: this.pluginOpts.weapp.privateKeyPath,
      ignores: this.pluginOpts.weapp.ignores,
    }
  }

  /**
   * 打印错误日志
   * @param {string} message - 错误信息
   * @param {Error} error - 错误对象
   */
  logError(message: string, error: Error): void {
    console.log(error)
    printLog(processTypeEnum.ERROR, chalk.red(message))
  }

  /**
   * 打开微信开发者工具
   * @async
   */
  async open(): Promise<void> {
    if (!(await fs.pathExists(this.devToolsInstallPath))) {
      printLog(processTypeEnum.ERROR, '微信开发者工具安装路径不存在', this.devToolsInstallPath)
      return
    }
    const cliPath = path.join(
      this.devToolsInstallPath,
      os.platform() === 'win32' ? '/cli.bat' : '/Contents/MacOS/cli',
    )
    const isWindows = os.platform() === 'win32'
    const errMesg =
      '工具的服务端口已关闭。要使用命令行调用工具，请打开工具 -> 设置 -> 安全设置，将服务端口开启。详细信息: https://developers.weixin.qq.com/miniprogram/dev/devtools/cli.html '
    const ideStatusFile = path.join(
      getUserHomeDir(),
      isWindows
        ? `/AppData/Local/微信开发者工具/User Data/${crypto.createHash('md5').update(this.devToolsInstallPath).digest('hex')}/Default/.ide-status`
        : `/Library/Application Support/微信开发者工具/${crypto.createHash('md5').update(this.devToolsInstallPath).digest('hex')}/Default/.ide-status`,
    )
    console.log('ideStatusFile', ideStatusFile)
    if (!(await fs.pathExists(ideStatusFile))) {
      printLog(processTypeEnum.ERROR, errMesg)
      return
    }
    const ideStatus = await fs.readFile(ideStatusFile, 'utf-8')
    if (ideStatus === 'Off') {
      printLog(processTypeEnum.ERROR, errMesg)
      return
    }

    if (!(await fs.pathExists(cliPath))) {
      printLog(processTypeEnum.ERROR, '命令行工具路径不存在', cliPath)
    }
    printLog(processTypeEnum.START, '微信开发者工具...', this.projectPath)

    shell.exec(`${cliPath} open --project ${this.projectPath}`)
  }

  /**
   * 预览小程序
   * 上传代码到微信后台并生成预览二维码
   * @async
   */
  async preview(): Promise<void> {
    try {
      printLog(processTypeEnum.START, '上传开发版代码到微信后台并预览')
      const previewQrcodePath = path.join(this.projectPath || '', 'preview.jpg')
      const uploadResult = await this.ci.preview({
        project: this.instance,
        version: this.version,
        desc: this.desc,
        onProgressUpdate: undefined,
        robot: this.pluginOpts.weapp.robot,
        setting: this.pluginOpts.weapp.setting,
        qrcodeFormat: 'image',
        qrcodeOutputDest: previewQrcodePath,
      })
      if (uploadResult.subPackageInfo) {
        const allPackageInfo = uploadResult.subPackageInfo.find((item: any) => item.name === '__FULL__')
        const mainPackageInfo = uploadResult.subPackageInfo.find((item: any) => item.name === '__APP__')
        const extInfo = `本次上传${allPackageInfo.size / 1024}kb ${mainPackageInfo ? ',其中主包' + mainPackageInfo.size / 1024 + 'kb' : ''}`
        console.log(chalk.green(`开发版上传成功 ${new Date().toLocaleString()} ${extInfo}\n`))
      }
      let qrContent
      try {
        qrContent = await readQrcodeImageContent(previewQrcodePath)
        console.log('qrContent', qrContent)
        await printQrcode2Terminal(qrContent)
        printLog(
          processTypeEnum.REMIND,
          `预览二维码已生成，存储在:"${previewQrcodePath}",二维码内容是：${qrContent}`,
        )
      } catch (error) {
        printLog(processTypeEnum.ERROR, chalk.red(`获取预览二维码失败：${(error as Error).message}`))
      }
    } catch (error) {
      printLog(
        processTypeEnum.ERROR,
        chalk.red(`上传失败 ${new Date().toLocaleString()} \n${(error as Error).message}`),
      )
    }
  }

  /**
   * 上传小程序
   * 上传代码到微信后台并生成体验版二维码
   * @async
   */
  async upload(): Promise<void> {
    try {
      printLog(processTypeEnum.START, '上传体验版代码到微信后台')
      printLog(
        processTypeEnum.REMIND,
        `本次上传版本号为："${this.version}"，上传描述为："${this.desc}"`,
      )
      const uploadResult = await this.ci.upload({
        project: this.instance,
        version: this.version,
        desc: this.desc,
        onProgressUpdate: console.log,
        robot: this.pluginOpts.weapp.robot,
        setting: this.pluginOpts.weapp.setting,
      })
      console.log('*****************************')
      if (uploadResult.subPackageInfo) {
        const allPackageInfo = uploadResult.subPackageInfo.find((item: any) => item.name === '__FULL__')
        const mainPackageInfo = uploadResult.subPackageInfo.find((item: any) => item.name === '__APP__')
        const extInfo = `本次上传${allPackageInfo.size / 1024}kb ${mainPackageInfo ? ',其中主包' + mainPackageInfo.size / 1024 + 'kb' : ''}`
        console.log(chalk.green(`上传成功 ${new Date().toLocaleString()} ${extInfo}\n`))
      }

      const uploadQrcodePath = path.join(this.projectPath || '', 'upload.png')
      try {
        // 体验码规则： https://open.weixin.qq.com/sns/getexpappinfo?appid=xxx&path=入口路径.html#wechat-redirect
        const qrContent = `https://open.weixin.qq.com/sns/getexpappinfo?appid=${this.pluginOpts.weapp.appid}#wechat-redirect`
        await printQrcode2Terminal(qrContent)
        await generateQrcodeImageFile(uploadQrcodePath, qrContent)
        printLog(
          processTypeEnum.REMIND,
          `体验版二维码已生成，存储在:"${uploadQrcodePath}",二维码内容是："${qrContent}"`,
        )
        printLog(processTypeEnum.REMIND, `可能需要您前往微信后台，将当前上传版本设置为"体验版"`)
        printLog(
          processTypeEnum.REMIND,
          `若本次上传的robot机器人和上次一致，并且之前已经在微信后台设置其为"体验版"，则本次无需再次设置`,
        )
        process.exit(0) // 成功退出
      } catch (error) {
        // 实际读取二维码时有极小概率会读取失败，待观察
        printLog(processTypeEnum.ERROR, chalk.red(`体验二维码生成失败：${(error as Error).message}`))
      }
    } catch (error) {
      console.log('error', error)
      printLog(
        processTypeEnum.ERROR,
        chalk.red(`上传失败 ${new Date().toLocaleString()} \n${(error as Error).message}`),
      )
      process.exit(1) // 失败退出
    }
  }
}
