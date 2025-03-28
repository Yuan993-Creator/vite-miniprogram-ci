import chalk from 'chalk'

export enum LogLevel {
  INFO = 'info',
  DEBUG = 'debug',
  WARN = 'warn',
  ERROR = 'error',
  SILENT = 'silent'
}

export interface Logger {
  info: (...args: any[]) => void
  warn: (...args: any[]) => void
  error: (...args: any[]) => void
  debug: (...args: any[]) => void
  task: (...args: any[]) => void
  success: (...args: any[]) => void
  line: () => void
}

export enum processTypeEnum {
  START = 'start',
  CREATE = 'create',
  MODIFY = 'modify',
  UNLINK = 'unlink',
  ERROR = 'error',
  WARNING = 'warning',
  UNLINK_DIR = 'unlinkDir',
  REMIND = 'remind',
  COMPILE = 'compile',
  CONVERT = 'convert',
  COPY = 'copy',
  GENERATE = 'generate',
  COMPRESS = 'compress',
  REFERENCE = 'reference',
  MAGIC = 'magic',
}

interface TypeColor {
  [key: string]: any
}

type LevelFilter = (level: LogLevel) => boolean

// 日志样式
const processTypeColor: TypeColor = {
  [processTypeEnum.CREATE]: chalk.green,
  [processTypeEnum.MODIFY]: chalk.yellow,
  [processTypeEnum.UNLINK]: chalk.magenta,
  [processTypeEnum.UNLINK_DIR]: chalk.magenta,
  [processTypeEnum.ERROR]: chalk.red,
  [processTypeEnum.WARNING]: chalk.yellow,
  [processTypeEnum.REMIND]: chalk.green,
  [processTypeEnum.START]: chalk.cyan,
  [processTypeEnum.COMPILE]: chalk.cyan,
  [processTypeEnum.CONVERT]: chalk.cyan,
  [processTypeEnum.COPY]: chalk.cyan,
  [processTypeEnum.GENERATE]: chalk.cyan,
  [processTypeEnum.COMPRESS]: chalk.cyan,
  [processTypeEnum.REFERENCE]: chalk.cyan,
  [processTypeEnum.MAGIC]: chalk.cyan,
}

// 文字
const processTypeMsg: TypeColor = {
  [processTypeEnum.CREATE]: '创建',
  [processTypeEnum.MODIFY]: '修改',
  [processTypeEnum.UNLINK]: '删除',
  [processTypeEnum.UNLINK_DIR]: '删除目录',
  [processTypeEnum.WARNING]: '警告',
  [processTypeEnum.REMIND]: '提示',
  [processTypeEnum.ERROR]: '错误',
  [processTypeEnum.START]: '开始',
  [processTypeEnum.COMPILE]: '编译',
  [processTypeEnum.CONVERT]: '转换',
  [processTypeEnum.COPY]: '拷贝',
  [processTypeEnum.GENERATE]: '生成',
  [processTypeEnum.COMPRESS]: '压缩',
  [processTypeEnum.REFERENCE]: '引用',
  [processTypeEnum.MAGIC]: '魔法',
}

// 当前日志级别
let currentLogLevel: LogLevel = LogLevel.INFO

// 根据级别是否应该显示的过滤器
const levelFilters: Record<LogLevel, LevelFilter> = {
  [LogLevel.INFO]: (level: LogLevel) => level !== LogLevel.DEBUG,
  [LogLevel.WARN]: (level: LogLevel) => level !== LogLevel.DEBUG && level !== LogLevel.INFO,
  [LogLevel.ERROR]: (level: LogLevel) => level === LogLevel.ERROR,
  [LogLevel.DEBUG]: () => true,
  [LogLevel.SILENT]: () => false,
}

/**
 * 设置日志级别
 * @param {LogLevel} level - 日志级别: 'info' | 'debug' | 'warn' | 'error' | 'silent'
 */
export function setLogLevel(level: LogLevel): void {
  if (Object.values(LogLevel).includes(level)) {
    currentLogLevel = level
  } else {
    console.warn(`无效的日志级别: ${level}，将使用默认级别 'info'`)
    currentLogLevel = LogLevel.INFO
  }
}

/**
 * 创建一个日志记录器对象，包含不同级别的日志输出方法
 * @returns {Object} 包含不同日志级别方法的对象
 */
export function createLogger(): Logger {
  return {
    /**
     * 打印信息级别的日志
     */
    info(...args: any[]): void {
      if (levelFilters[currentLogLevel](LogLevel.INFO)) {
        console.log(chalk.cyan('[INFO]'), ...args)
      }
    },

    /**
     * 打印任务级别的日志
     */
    task(...args: any[]): void {
      if (levelFilters[currentLogLevel](LogLevel.INFO)) {
        console.log(chalk.magenta('[TASK]'), ...args)
      }
    },

    /**
     * 打印警告级别的日志
     */
    warn(...args: any[]): void {
      if (levelFilters[currentLogLevel](LogLevel.WARN)) {
        console.log(chalk.yellow('[WARN]'), ...args)
      }
    },

    /**
     * 打印错误级别的日志
     */
    error(...args: any[]): void {
      if (levelFilters[currentLogLevel](LogLevel.ERROR)) {
        console.log(chalk.red('[ERROR]'), ...args)
      }
    },

    /**
     * 打印调试级别的日志
     */
    debug(...args: any[]): void {
      if (levelFilters[currentLogLevel](LogLevel.DEBUG)) {
        console.log(chalk.gray('[DEBUG]'), ...args)
      }
    },

    /**
     * 打印成功信息
     */
    success(...args: any[]): void {
      if (levelFilters[currentLogLevel](LogLevel.INFO)) {
        console.log(chalk.green('[SUCCESS]'), ...args)
      }
    },

    /**
     * 打印一条分隔线
     */
    line(): void {
      console.log('-'.repeat(80))
    },
  }
}

/**
 * 打印处理过程日志
 * @param {string} processType - 处理类型，对应 processTypeEnum 枚举
 * @param {string} msg - 处理消息
 * @param {string} [extInfo] - 额外信息
 */
export function printLog(processType: processTypeEnum, msg: string, extInfo?: string): void {
  if (levelFilters[currentLogLevel](
    processType === processTypeEnum.ERROR
      ? LogLevel.ERROR
      : processType === processTypeEnum.WARNING
        ? LogLevel.WARN
        : LogLevel.INFO
  )) {
    const colorFunc = processTypeColor[processType] || chalk.white
    const prefix = processTypeMsg[processType] || '未知'

    const message = extInfo ? `${msg} ${extInfo}` : msg
    if (typeof colorFunc === 'function') {
      console.log(colorFunc(`[${prefix}] ${message}`))
    } else {
      console.log(`[${prefix}] ${message}`)
    }
  }
}

// 创建默认的日志记录器
export const logger = createLogger()
