/**
 * 小程序操作类型
 */
export enum ActionType {
  /** 自动打开预览工具 */
  OPEN = 'open',
  /** 预览小程序（上传代码，作为"开发版"小程序） */
  PREVIEW = 'preview',
  /** 上传小程序（上传代码，可设置为"体验版"小程序） */
  UPLOAD = 'upload',
}

/**
 * 小程序平台类型
 */
export enum PlatformType {
  /** 微信小程序 */
  WEAPP = 'weapp',
  // 以下平台待实现
  /** 支付宝小程序 */
  ALIPAY = 'alipay',
  /** 百度小程序 */
  SWAN = 'swan',
  /** 抖音小程序 */
  TIKTOK = 'tiktok',
}

/**
 * 微信小程序编译设置
 */
export interface WeappCompileSetting {
  /** 是否启用ES6转ES5 */
  es6?: boolean;
  /** 是否压缩代码 */
  minify?: boolean;
  /** 是否自动补全wxss */
  autoPrefixWXSS?: boolean;
  /** 其他编译选项 */
  [key: string]: any;
}

/**
 * 微信小程序配置选项
 */
export interface WeappConfig {
  /** 微信小程序appid */
  appid: string;
  /** 项目路径 */
  projectPath: string;
  /** 上传密钥路径 */
  privateKeyPath: string;
  /** 忽略文件 */
  ignores?: string[];
  /** 机器人ID */
  robot?: number;
  /** 编译设置 */
  setting?: WeappCompileSetting;
  /** 微信开发者工具安装路径 */
  devToolsInstallPath?: string;
}

/**
 * 小程序CI插件配置
 */
export interface MiniCIOptions {
  /** 平台类型 */
  type?: string;
  /** 操作类型 */
  action?: string;
  /** 日志级别 */
  logLevel?: string;
  /** 项目路径 */
  projectPath?: string;
  /** 版本号 */
  version?: string;
  /** 描述信息 */
  desc?: string;
  /** 环境变量 */
  env?: Record<string, any>;
  /** 微信小程序配置 */
  weapp?: WeappConfig;
  /** 支付宝小程序配置 */
  alipay?: any;
  /** 百度小程序配置 */
  swan?: any;
  /** 抖音小程序配置 */
  tiktok?: any;
  /** 其他配置选项 */
  [key: string]: any;
} 