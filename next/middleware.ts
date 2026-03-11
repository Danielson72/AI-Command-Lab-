import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

const ALLOWED_ORIGINS = [
  'https://sotsvc.com',
  'https://www.sotsvc.com',
  'https://bossofclean.com',
  'https://www.bossofclean.com',
  'https://trustedcleaningexpert.com',
  'https://www.trustedcleaningexpert.com',
  'https://dld-online.com',
  'https://www.dld-online.com',
  'http://localhost:3000',
]

export async function middleware(request: NextRequest) {
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/')
  const origin = request.headers.get('origin') ?? ''
  const isAllowed = ALLOWED_ORIGINS.includes(origin)

  // Handle CORS preflight for API routes
  if (isApiRoute && request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 })
    if (isAllowed) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    }
    return response
  }

  // Run Supabase session middleware (auth + route protection)
  const response = await updateSession(request)

  // Add CORS header to API responses
  if (isApiRoute && isAllowed) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
