import { NextResponse } from 'next/server'

/**
 * Collapse duplicate slashes in the path and redirect to the canonical URL.
 *
 * A URL like https://begoodshop.in//how-it-works was being served from a stale
 * edge cache, so it returned an old build of the page - including copy that has
 * since been corrected. Any link with an accidental double slash (for example a
 * site URL stored with a trailing slash and then joined to a path) would land
 * there. Redirecting makes the canonical page the only one reachable.
 */
export function middleware(request) {
  const { pathname, search } = request.nextUrl

  if (pathname.includes('//')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace(/\/{2,}/g, '/')
    return NextResponse.redirect(url, 308)
  }

  return NextResponse.next()
}

export const config = {
  // Skip Next internals and static files; everything else is normalised.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
