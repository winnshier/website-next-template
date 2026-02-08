/**
 * CDN 资源路径工具
 *
 * 根据环境配置自动处理静态资源路径，支持 CDN 和本地服务器两种模式
 */

/**
 * 获取静态资源的完整 URL
 *
 * @param path - 资源路径，必须以 / 开头（如 /images/logo.png）
 * @returns 完整的资源 URL
 *
 * @example
 * ```tsx
 * import { getAssetUrl } from '@/lib/utils/cdn';
 *
 * // 开发环境或未配置 CDN
 * getAssetUrl('/images/logo.png')
 * // => '/images/logo.png' (走服务器)
 *
 * // 生产环境且配置了 CDN
 * getAssetUrl('/images/logo.png')
 * // => 'https://cdn.example.com/public/images/logo.png' (走 CDN)
 * ```
 */
export function getAssetUrl(path: string): string {
  // 参数验证
  if (!path) {
    console.warn('[getAssetUrl] 路径不能为空');
    return '';
  }

  if (!path.startsWith('/')) {
    console.warn(`[getAssetUrl] 路径必须以 / 开头，当前路径: ${path}`);
    return path;
  }

  // 获取 CDN 配置
  const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;

  // 如果没有配置 CDN，直接返回原路径（走服务器）
  if (!cdnUrl) {
    return path;
  }

  // 如果是 Next.js 内部资源（/_next/），直接拼接 CDN（Next.js 自动处理）
  if (path.startsWith('/_next/')) {
    return `${cdnUrl}${path}`;
  }

  // public 目录的资源，拼接 /public 前缀
  // 因为上传到 CDN 时，public 目录会保留目录结构
  return `${cdnUrl}/public${path}`;
}

/**
 * 获取图片资源 URL（getAssetUrl 的别名，语义更清晰）
 *
 * @param path - 图片路径，必须以 / 开头（如 /images/logo.png）
 * @returns 完整的图片 URL
 *
 * @example
 * ```tsx
 * import { getImageUrl } from '@/lib/utils/cdn';
 *
 * <img src={getImageUrl('/images/logo.png')} alt="Logo" />
 * ```
 */
export function getImageUrl(path: string): string {
  return getAssetUrl(path);
}

/**
 * 获取视频资源 URL（getAssetUrl 的别名，语义更清晰）
 *
 * @param path - 视频路径，必须以 / 开头（如 /videos/intro.mp4）
 * @returns 完整的视频 URL
 *
 * @example
 * ```tsx
 * import { getVideoUrl } from '@/lib/utils/cdn';
 *
 * <video src={getVideoUrl('/videos/intro.mp4')} />
 * ```
 */
export function getVideoUrl(path: string): string {
  return getAssetUrl(path);
}

/**
 * 批量获取资源 URL
 *
 * @param paths - 资源路径数组
 * @returns 完整的资源 URL 数组
 *
 * @example
 * ```tsx
 * import { getAssetUrls } from '@/lib/utils/cdn';
 *
 * const images = getAssetUrls([
 *   '/images/photo1.jpg',
 *   '/images/photo2.jpg',
 *   '/images/photo3.jpg',
 * ]);
 * ```
 */
export function getAssetUrls(paths: string[]): string[] {
  return paths.map(path => getAssetUrl(path));
}

/**
 * 检查是否启用了 CDN
 *
 * @returns 是否启用 CDN
 *
 * @example
 * ```tsx
 * import { isCdnEnabled } from '@/lib/utils/cdn';
 *
 * if (isCdnEnabled()) {
 *   console.log('CDN 已启用');
 * }
 * ```
 */
export function isCdnEnabled(): boolean {
  return !!process.env.NEXT_PUBLIC_CDN_URL;
}

/**
 * 获取 CDN 基础 URL
 *
 * @returns CDN 基础 URL，未配置则返回空字符串
 *
 * @example
 * ```tsx
 * import { getCdnBaseUrl } from '@/lib/utils/cdn';
 *
 * const cdnUrl = getCdnBaseUrl();
 * // => 'https://cdn.example.com' 或 ''
 * ```
 */
export function getCdnBaseUrl(): string {
  return process.env.NEXT_PUBLIC_CDN_URL || '';
}
