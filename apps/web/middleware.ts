import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define route patterns and required roles
const ROUTE_ROLES: Record<string, string[]> = {
  '/student': ['STUDENT'],
  '/faculty': ['FACULTY', 'HOD'],
  '/management': ['SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'HR_MANAGER', 'ACCOUNTANT'],
  '/parent': ['PARENT'],
};

interface JWTPayload {
  userId: string;
  role: string;
  exp: number;
}

// Minimal JWT decoding for Edge environments (no verification, just decoding payload)
function parseJwt(token: string): JWTPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Exclude API, static assets, and auth pages
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('accessToken')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = parseJwt(token);

  if (!payload || payload.exp * 1000 < Date.now()) {
    // Return to login if token is invalid or expired
    // Note: Refreshing logic generally happens via Axios interceptor on the client
    // For SSR/Middleware, we clear the cookie and force a re-login if access token fails.
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    return response;
  }

  const userRole = payload.role;

  // Check RBAC
  for (const [routePattern, allowedRoles] of Object.entries(ROUTE_ROLES)) {
    if (pathname.startsWith(routePattern)) {
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.rewrite(new URL('/403', request.url));
      }
      break; 
    }
  }

  // Token is valid and user has role permissions
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
