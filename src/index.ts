// 导入所需的Node.js内置模块和第三方依赖
import minimist from 'minimist'
import { createPlatformCIFactory, getSupportedPlatforms } from './platforms/index'
import { createConfig, validateConfig } from './core/config'
import { resolveProjectPath, generateDesc, generateVersion } from './core/helpers'
import { logger, setLogLevel, LogLevel } from './utils/logger'
import type { Plugin } from 'vite'
import { MiniCIOptions, ActionType, PlatformType } from './types'

// 定义小程序操作类型的枚举常量
const EnumAction = Object.freeze({
  /** 自动打开预览工具 */
  open: ActionType.OPEN,
  /** 预览小程序（上传代码，作为"开发版"小程序） */
  preview: ActionType.PREVIEW,
  /** 上传小程序（上传代码，可设置为"体验版"小程序） */
  upload: ActionType.UPLOAD,
})

// 定义小程序操作类型
type ActionTypeKey = keyof typeof EnumAction

/**
 * 执行小程序相关操作
 * @param {string} platform - 平台类型,如 weapp(微信小程序)、qywx(企业微信小程序)
 * @param {string} action - 操作类型,对应EnumAction中的值
 * @param {string} projectPath - 项目路径
 */
const doAction = (platform: string, action: ActionType, projectPath: string, options: MiniCIOptions): void => {
  try {
    // 检验平台是否支持
    const supportedPlatforms = getSupportedPlatforms()
    if (!supportedPlatforms.includes(platform)) {
      logger.warn(`暂时不支持 "${platform}" 平台`)
      throw new Error(`不支持的平台: ${platform}`)
    }
    // 获取当前工作目录
    const resolvedProjectPath = resolveProjectPath(projectPath)
    logger.debug('项目路径:', resolvedProjectPath)

    // 创建配置
    const ciConfig = createConfig(
      {
        ...options,
        projectPath: resolvedProjectPath,
        version: generateVersion(options),
        desc: generateDesc(options),
      },
      platform,
    )
    // 验证配置
    validateConfig(ciConfig, platform)

    // 创建CI实例
    const ci = createPlatformCIFactory(platform, ciConfig)
    // 设置项目路径
    ci.setProjectPath(resolvedProjectPath)
    // 初始化CI实例
    ci.init()

    // 根据操作类型执行相应的CI命令
    switch (action) {
      case ActionType.OPEN:
        ci.open && ci.open()
        break
      case ActionType.UPLOAD:
        logger.task('上传小程序')
        ci.upload()
        break
      case ActionType.PREVIEW:
        logger.task('预览小程序')
        ci.preview()
        break
      default:
        logger.error(`不支持的操作类型: ${action}`)
        throw new Error(`不支持的操作类型: ${action}`)
    }
  } catch (error) {
    logger.error((error as Error).message || error)
    throw error
  }
}

/**
 * 启动CI流程的主函数
 * 解析命令行参数并执行相应的操作
 */
const bootstrap = (options: MiniCIOptions = {}): void => {
  try {
    // 设置日志级别
    if (options.logLevel) {
      setLogLevel(options.logLevel as LogLevel)
    }

    // 解析命令行参数
    const args = minimist(process.argv.slice(2), {
      string: ['projectPath', 'type', 'action'],
      default: {
        projectPath: options.projectPath || '',
        ...options.env,
      },
      alias: {
        type: 'type',
        action: 'action',
      },
    })

    // 合并插件配置和环境变量
    const mergedArgs: MiniCIOptions = {
      ...options,
      ...args,
      type: args.type || args._?.find((arg: string) => arg.startsWith('type='))?.split('=')[1],
      action: args.action || args._?.find((arg: string) => arg.startsWith('action='))?.split('=')[1],
    }

    const action = mergedArgs.action as ActionType
    if (action) {
      logger.line()
      logger.info('🚀 开始小程序CI流程...')
      doAction(mergedArgs.type as string, action, mergedArgs.projectPath || '', mergedArgs)
      logger.success('✅ CI流程完成')
      logger.line()
    }
  } catch (error) {
    logger.error('CI流程失败:', error)
    throw error
  }
}

/**
 * Vite插件入口
 */
export default function vitePluginMiniCi(options: MiniCIOptions): Plugin {
  return {
    name: 'vite-plugin-mini-ci',
    apply: 'build',
    closeBundle: {
      sequential: true,
      async handler() {
        try {
          bootstrap(options)
        } catch (error) {
          logger.error('CI流程失败:', error)
          throw error
        }
      },
    },
  }
}
