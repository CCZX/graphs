/**
 * 获取分辨率
 * @returns
 */
export function getResolution() {
  return window.devicePixelRatio;
}

/**
 *
 * @returns
 */
export function isDev() {
  return import.meta.env.DEV;
}

/**
 *
 * @returns
 */
export function isProd() {
  return import.meta.env.PROD;
}
