import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin route protection
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    // Check if user has admin token/session
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      // Redirect to admin login if no token
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // In a real implementation, you would verify the token and check admin role
    // For now, we'll let the client-side auth handle the verification
  }

  // Redirect admin users from regular login to admin login
  if (pathname === '/login') {
    const userAgent = request.headers.get('user-agent') || ''
    const referer = request.headers.get('referer') || ''
    
    // You could add logic here to detect admin access patterns
    // For now, we'll let users choose their login method
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/login'
  ]
}
