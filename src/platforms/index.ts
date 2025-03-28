import { WeappCI } from './weapp/WeappCI'
// import { AlipayCI } from './alipay/AlipayCI.js'
// import { SwanCI } from './swan/SwanCI.js'
// import { TiktokCI } from './tiktok/TiktokCI.js'
import BaseCI from '../core/BaseCi'
import type { ConfigOptions } from '../core/config'

interface CIMap {
  [key: string]: typeof WeappCI
}

const PLATFORM_MAP: CIMap = {
  weapp: WeappCI,
  // alipay: AlipayCI,
  // swan: SwanCI,
  // tiktok: TiktokCI,
}

/**
 * 创建特定平台的CI实例
 */
export function createPlatformCIFactory(platform: string, options: ConfigOptions): BaseCI {
  const CIClass = PLATFORM_MAP[platform]

  if (!CIClass) {
    throw new Error(`不支持的小程序平台: ${platform}`)
  }

  return new CIClass(options)
}

/**
 * 获取支持的平台列表
 */
export function getSupportedPlatforms(): string[] {
  return Object.keys(PLATFORM_MAP)
}
