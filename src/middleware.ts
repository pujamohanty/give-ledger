import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * A/B Testing Middleware
 *
 * Version A = main branch  → https://give-ledger.vercel.app  (50% of traffic)
 * Version B = version-b    → VERSION_B_HOST below             (50% of traffic)
 *
 * How it works:
 * 1. First visit: randomly assign variant A or B, set a 30-day cookie.
 * 2. Variant A: pass through to the main site as normal.
 * 3. Variant B: redirect to the Version B Vercel preview deployment.
 * 4. On every subsequent visit from a Variant B user to the main domain,
 *    the cookie is read and they are redirected to Version B again.
 *
 * Force a variant manually for QA:
 *   ?variant=a  →  forces Version A for this session
 *   ?variant=b  →  forces Version B for this session
 */

const VERSION_B_HOST = 'give-ledger-git-version-b-pujas-projects-e13211ca.vercel.app'

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // ── Skip non-page requests ──────────────────────────────────────────────
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.[a-zA-Z0-9]+$/) // static files (images, fonts, etc.)
  ) {
    return NextResponse.next()
  }

  // ── Manual variant override via query param ─────────────────────────────
  const forceVariant = request.nextUrl.searchParams.get('variant')
  if (forceVariant === 'a' || forceVariant === 'b') {
    if (forceVariant === 'b') {
      // Strip the ?variant param and redirect to Version B
      const url = new URL(pathname, `https://${VERSION_B_HOST}`)
      const response = NextResponse.redirect(url)
      response.cookies.set('ab-variant', 'b', {
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      })
      return response
    }
    // Force Version A — just set the cookie and continue
    const response = NextResponse.next()
    response.cookies.set('ab-variant', 'a', {
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })
    return response
  }

  // ── Read existing assignment ────────────────────────────────────────────
  const existingVariant = request.cookies.get('ab-variant')?.value
  const isNewVisitor = existingVariant !== 'a' && existingVariant !== 'b'

  const assignedVariant: 'a' | 'b' = isNewVisitor
    ? Math.random() < 0.5 ? 'a' : 'b'
    : existingVariant as 'a' | 'b'

  // ── Variant B → redirect to Version B deployment ────────────────────────
  if (assignedVariant === 'b') {
    const destination = new URL(pathname + search, `https://${VERSION_B_HOST}`)
    const response = NextResponse.redirect(destination)
    if (isNewVisitor) {
      response.cookies.set('ab-variant', 'b', {
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      })
    }
    return response
  }

  // ── Variant A → serve the main site normally ────────────────────────────
  const response = NextResponse.next()
  if (isNewVisitor) {
    response.cookies.set('ab-variant', 'a', {
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })
  }
  return response
}

export const config = {
  // Run on all routes except Next.js internals and static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
