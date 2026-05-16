// src/lib/supabase/server.ts
// Next.js 14.2.5 — cookies() is SYNCHRONOUS. Do NOT await.
// (R-2 / DD-B: copying Luma's await cookies() compiles but breaks at runtime
//  with `cookieStore.getAll is not a function`.)
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies(); // SYNC — no await

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component context: cookies are read-only. Safe to ignore;
            // middleware refresh path handles writes.
          }
        },
      },
    },
  );
}
