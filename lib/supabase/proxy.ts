import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function getRoleFromClaims(claims: unknown): string | undefined {
  // We sync public.profiles.role -> auth.users.raw_app_meta_data.role.
  // Supabase exposes raw_app_meta_data as claims.app_metadata.
  if (!claims || typeof claims !== 'object') return undefined

  const root = claims as Record<string, unknown>
  const appMetadata = root['app_metadata']
  if (!appMetadata || typeof appMetadata !== 'object') return undefined

  const role = (appMetadata as Record<string, unknown>)['role']
  return typeof role === 'string' ? role : undefined
}

function isAdmin(claims: unknown) {
  return getRoleFromClaims(claims) === 'admin'
}

function getNextParam(request: NextRequest) {
  // Preserve querystring so the app can redirect back accurately after login.
  return `${request.nextUrl.pathname}${request.nextUrl.search}`
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims()

  const claims = data?.claims
  const pathname = request.nextUrl.pathname
  const isDashboardRoute = pathname === '/dashboard' || pathname.startsWith('/dashboard/')
  const isAuthPage =
    pathname === '/auth/iniciar-sesion' ||
    pathname === '/auth/registrarse' ||
    pathname === '/auth/registro'
  const isAuthCallback = pathname === '/auth/callback'

  if (claims && isAuthPage && !isAuthCallback) {
    const url = request.nextUrl.clone()
    const next = url.searchParams.get('next')
    url.pathname = next && next.startsWith('/') ? next : '/'
    url.search = ''
    return NextResponse.redirect(url)
  }

  if (isDashboardRoute) {
    if (!claims) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/iniciar-sesion'
      url.searchParams.set('next', getNextParam(request))
      return NextResponse.redirect(url)
    }

    if (!isAdmin(claims)) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}