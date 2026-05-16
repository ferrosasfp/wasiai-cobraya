// src/middleware.ts — auth + onboarding gate for Cobraya dapp.
// Next.js 14.2.5 — middleware uses request.cookies (sync) and ssr helpers.
import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

const AUTH_EXEMPT_PREFIXES = ['/login', '/signup', '/auth', '/~offline', '/pitch', '/demo'];
const ONBOARDING_PATH = '/onboarding';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // CRITICAL: refresh session (required by @supabase/ssr). Do not remove.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isBounceRoute = pathname === '/login' || pathname === '/signup';

  // R-3: every redirect must carry the refreshed auth cookies forward,
  // otherwise the next request loses the session.
  const redirectWithCookies = (url: URL) => {
    const r = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => r.cookies.set(cookie));
    return r;
  };

  const isAuthExempt =
    pathname === '/' ||
    AUTH_EXEMPT_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));

  // AC-1, CD-27: anon → /login (except splash and auth bounce routes).
  if (!user && !isAuthExempt) {
    return redirectWithCookies(new URL('/login', request.url));
  }

  // AC-3, CD-26: authed user on /login or /signup → /dashboard or /onboarding/step/1.
  if (isBounceRoute && user) {
    const { data: profile } = await supabase
      .from('cobraya_profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .maybeSingle(); // R-3: maybeSingle tolerates trigger race post-signUp
    if (profile?.onboarding_completed === true) {
      return redirectWithCookies(new URL('/dashboard', request.url));
    }
    return redirectWithCookies(new URL('/onboarding/step/1', request.url));
  }

  // AC-2, CD-28: authed user on /(app)/* but onboarding pending → /onboarding/step/1.
  if (
    user &&
    !isBounceRoute &&
    pathname !== '/' &&
    !pathname.startsWith(ONBOARDING_PATH)
  ) {
    const { data: profile } = await supabase
      .from('cobraya_profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .maybeSingle();
    if (profile?.onboarding_completed !== true) {
      return redirectWithCookies(new URL('/onboarding/step/1', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|manifest\\.json|sw\\.js|workbox-.*\\.js|icons/.*|splashes/.*|apple-touch-icon-.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
