import { NextResponse } from 'next/server'

export function middleware(request: Request) {
  // Get the requested URL and check for case issues
  const url = new URL(request.url)
  const pathname = url.pathname
  
  // Skip middleware for all API endpoints to prevent connection pool issues
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  const headers = new Headers(request.headers)
  // Remove content-length as it's not reliable with edge functions
  headers.delete('content-length')
  
  // Convert any uppercase paths to lowercase
  if (pathname.toLowerCase() !== pathname) {
    const correctedUrl = new URL(request.url)
    correctedUrl.pathname = pathname.toLowerCase()
    return NextResponse.redirect(correctedUrl)
  }

  return NextResponse.next({
    request: {
      headers,
    },
  })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|api/|favicon.ico).*)',
  ]
}
