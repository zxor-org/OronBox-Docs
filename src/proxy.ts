import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';
import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware';
import { i18n } from '@/lib/i18n';

const i18nMiddleware = createI18nMiddleware(i18n);

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;
  // the web build lives in public/web (fetched at build time); Next does not
  // serve directory index.html from public, so rewrite /web to the file
  if (pathname === '/web' || pathname === '/web/') {
    return NextResponse.rewrite(new URL('/web/index.html', request.url));
  }
  return i18nMiddleware(request, event);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|og|.*\\..*).*)'],
};
