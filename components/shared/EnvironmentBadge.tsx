'use client';

import { ENV, getEnvironmentName } from '@/lib/utils/env';

export function EnvironmentBadge() {
  // 只在非正式环境显示
  if (ENV.isProduction) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`
        px-3 py-1 rounded-full text-xs font-semibold shadow-lg
        ${ENV.isStaging ? 'bg-yellow-500 text-white' : 'bg-blue-500 text-white'}
      `}>
        {getEnvironmentName()}
      </div>
    </div>
  );
}
