import Jimp from 'jimp'
import jsQR from 'jsqr'
import * as QRCode from 'qrcode'
import * as os from 'node:os'

/**
 * 读取出二维码图片中的文本内容
 * @param {string} imagePath 图片路径
 * @returns {Promise<string>}
 */
export async function readQrcodeImageContent(imagePath: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const image = await Jimp.read(imagePath)
      const scanData = jsQR(
        new Uint8ClampedArray(image.bitmap.data),
        image.bitmap.width,
        image.bitmap.height
      )
      if (scanData) {
        resolve(scanData.data)
      } else {
        reject(new Error('扫描器 jsqr 未能识别出二维码内容'))
      }
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * 将文本内容转换成二维码输出在控制台上
 * @param {string} content
 */
export async function printQrcode2Terminal(content: string): Promise<void> {
  const terminalStr = await QRCode.toString(content, { type: 'terminal', small: true })
  // eslint-disable-next-line no-console
  console.log(terminalStr)
}

/**
 * 生成二维码图片到指定目录
 * @param {string} path
 * @param {string} content
 */
export async function generateQrcodeImageFile(path: string, content: string): Promise<void> {
  await QRCode.toFile(path, content, {
    errorCorrectionLevel: 'L',
    type: 'png',
  })
}
/**
 * 获取用户主目录路径
 * 优先使用 os.homedir() 方法，如果不可用则使用自定义 homedir() 函数
 * @returns {string} 用户主目录的完整路径
 */
export function getUserHomeDir(): string {
  /**
   * 根据不同操作系统获取用户主目录路径
   * @returns {string} 用户主目录路径
   */
  function homedir(): string {
    const env = process.env
    const home = env.HOME
    const user = env.LOGNAME || env.USER || env.LNAME || env.USERNAME

    // Windows 系统
    if (process.platform === 'win32') {
      return env.USERPROFILE || (env.HOMEDRIVE || '') + (env.HOMEPATH || '') || home || ''
    }

    // macOS 系统
    if (process.platform === 'darwin') {
      return home || (user ? '/Users/' + user : '')
    }

    // Linux 系统
    if (process.platform === 'linux') {
      return home || (process.getuid?.() === 0 ? '/root' : user ? '/home/' + user : '')
    }

    return home || ''
  }
  return typeof os.homedir === 'function' ? os.homedir() : homedir()
}
