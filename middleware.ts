import { NextRequest, NextResponse } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

const locales = ['en', 'zh'];
const defaultLocale = 'en';

function getLocale(request: NextRequest): string {
  // 1. 检查cookie中的语言偏好
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // 2. 检测Accept-Language头
  const headers = { 'accept-language': request.headers.get('accept-language') || '' };
  const languages = new Negotiator({ headers }).languages();

  try {
    return match(languages, locales, defaultLocale);
  } catch {
    return defaultLocale;
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 检查路径是否已包含locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    // 路径已包含locale，刷新cookie并继续
    const locale = pathname.split('/')[1];
    const response = NextResponse.next();
    response.cookies.set('NEXT_LOCALE', locale, { maxAge: 31536000 }); // 1年
    return response;
  }

  // 重定向到带locale的路径
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  const response = NextResponse.redirect(request.nextUrl);
  response.cookies.set('NEXT_LOCALE', locale, { maxAge: 31536000 }); // 1年
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|videos).*)']
};
