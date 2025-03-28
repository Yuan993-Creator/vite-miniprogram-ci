import { deepMerge } from '../utils/object'

export interface ConfigOptions {
  logLevel?: string
  projectPath?: string
  robot?: number
  setting?: {
    es6?: boolean
    minify?: boolean
    autoPrefixWXSS?: boolean
    [key: string]: any
  }
  [key: string]: any
}

export interface PlatformConfig {
  type: string
  [key: string]: any
}

// 默认配置
const DEFAULT_CONFIG: ConfigOptions = {
  logLevel: 'info',
  projectPath: process.cwd(),
  robot: 1,
  setting: {
    es6: true,
    minify: true,
    autoPrefixWXSS: true,
  },
}

// 平台特定默认配置
const PLATFORM_DEFAULT_CONFIG: Record<string, PlatformConfig> = {
  weapp: {
    type: 'miniProgram',
    // 微信小程序默认配置
  },
  alipay: {
    type: 'miniProgram',
    // 支付宝小程序默认配置
  },
  swan: {
    type: 'miniProgram',
    // 百度小程序默认配置
  },
  tiktok: {
    type: 'miniProgram',
    // 抖音小程序默认配置
  },
}

/**
 * 创建合并了默认值的配置对象
 */
export function createConfig(userConfig: ConfigOptions = {}, platform: string): ConfigOptions {
  const platformDefaults = PLATFORM_DEFAULT_CONFIG[platform] || {}

  return deepMerge({}, DEFAULT_CONFIG, platformDefaults, userConfig)
}

/**
 * 验证配置是否有效
 */
export function validateConfig(config: ConfigOptions, platform: string): boolean {
  const requiredFields = ['appid']

  requiredFields.forEach((field) => {
    if (!config[platform][field]) {
      throw new Error(`缺少必要配置: ${field}`)
    }
  })

  return true
}
