export const ENV = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isStaging: process.env.NEXT_PUBLIC_ENV === 'staging',
  isProduction: process.env.NEXT_PUBLIC_ENV === 'production',

  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || '',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || '',
  cdnUrl: process.env.NEXT_PUBLIC_CDN_URL || '',

  showDebugInfo: process.env.NEXT_PUBLIC_SHOW_DEBUG_INFO === 'true',
} as const;

export function getEnvironmentName(): string {
  if (ENV.isDevelopment) return 'Development';
  if (ENV.isStaging) return 'Staging';
  if (ENV.isProduction) return 'Production';
  return 'Unknown';
}
