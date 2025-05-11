import { NextResponse } from 'next/server'

export function middleware(request: Request) {
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
  matcher: '/api/upload'
}
