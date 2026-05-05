import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Basic in-memory rate limiter for the demo (in production, use Upstash Redis)
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();

export async function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  
  // Security Layer 1: Rate Limiting
  const limit = 100; // requests
  const windowMs = 60 * 1000; // 1 minute
  
  if (ip !== 'unknown') {
    const now = Date.now();
    const clientRecord = rateLimitMap.get(ip);
    
    if (!clientRecord || now > clientRecord.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    } else {
      clientRecord.count++;
      if (clientRecord.count > limit) {
        // Log this aggressive behavior to console (in prod, we write to BlockedIp DB via a background job to avoid blocking the request)
        console.warn(`[SECURITY] Rate limit exceeded for IP: ${ip}. Possible brute force or DDoS.`);
        
        return new NextResponse(
          JSON.stringify({ error: "Too Many Requests. Your IP has been temporarily flagged." }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  }

  // Security Layer 2: Basic WAF Headers
  const response = NextResponse.next();
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
