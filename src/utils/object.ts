/**
 * 检查对象是否为普通对象
 * @param {any} obj - 要检查的对象
 * @returns {boolean} 如果是普通对象则返回true，否则返回false
 */
export function isPlainObject(obj: any): boolean {
  if (typeof obj !== 'object' || obj === null) return false

  let proto = obj
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto)
  }

  return Object.getPrototypeOf(obj) === proto
}

/**
 * 深度合并对象
 * @param {object} target - 目标对象
 * @param {...object} sources - 源对象
 * @returns {object} 合并后的对象
 */
export function deepMerge<T extends object, S extends object>(target: T, ...sources: S[]): T {
  if (!sources.length) return target
  const source = sources.shift()

  if (source === undefined) return target

  if (isPlainObject(target) && isPlainObject(source)) {
    for (const key in source) {
      // @ts-ignore
      if (isPlainObject(source[key])) {
        // @ts-ignore
        if (!target[key]) Object.assign(target, { [key]: {} })
        // @ts-ignore
        deepMerge(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return deepMerge(target, ...sources)
}

/**
 * 判断是否为对象
 */
export function isObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
}

/**
 * 获取对象指定路径的值
 */
export function get(obj, path, defaultValue) {
  const keys = path.split('.')
  let result = obj

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue
    }
    result = result[key]
  }

  return result === undefined ? defaultValue : result
}
