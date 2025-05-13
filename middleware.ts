import { NextResponse } from 'next/server'

export function middleware(request: Request) {
  // Add a console log to track middleware execution
  console.log(`Middleware executed for: ${request.url}`)

  const headers = new Headers(request.headers)
  // Remove content-length as it's not reliable with edge functions
  headers.delete('content-length')

  return NextResponse.next({
    request: {
      headers,
    },
  })
}

export const config = {
  matcher: [
    '/api/upload',
    '/api/properties/:path*',
    '/tenant/property/:path*',
    '/api/favorites'
  ]
}
