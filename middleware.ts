import arcjet, {
  createMiddleware,
  detectBot,
  fixedWindow,
  shield,
} from '@arcjet/next';
import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getRolePermissions } from '@/lib/roles';

const ARCJET_KEY = process.env.ARCJET_KEY;
if (!ARCJET_KEY) {
  throw new Error('ARCJET_KEY environment variable is not set');
}

const aj = arcjet({
  key: ARCJET_KEY,
  rules: [
    shield({ mode: 'DRY_RUN' }),
    detectBot({ mode: 'LIVE', allow: ['CATEGORY:SEARCH_ENGINE'] }),
    fixedWindow({ mode: 'LIVE', window: '10m', max: 50 }),
  ],
});
const arcjetMiddleware = createMiddleware(aj);

const publicRoutes = [
  '/login',
  '/register',
  '/',
  '/api/login',
  '/api/register',
];

function isPublicRoute(pathname: string) {
  return publicRoutes.some((route) => pathname === route);
}

export async function middleware(req: NextRequest, event: NextFetchEvent) {
  const arcjetResult = await arcjetMiddleware(req, event);
  if (!arcjetResult?.ok) {
    return arcjetResult;
  }

  if (isPublicRoute(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // ---- DEBUG: Print full cookie object and values
  const cookie = req.cookies.get('token');
  // console.log("MIDDLEWARE DEBUG: raw cookie object:", cookie);

  const token = typeof cookie === 'string' ? cookie : cookie?.value;
  // console.log("MIDDLEWARE DEBUG: token string for JWT:", token);

  // Await the result here
  const user = await getUserFromRequest({
    cookies: {
      get: () => token,
    },
  });
  // console.log("MIDDLEWARE DEBUG: Decoded user:", user);

  if (!user) {
    // console.log("MIDDLEWARE DEBUG: No user, redirecting to /login");
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (req.nextUrl.pathname.startsWith('/api')) {
    const permissions = getRolePermissions(user.role);
    if (req.method === 'DELETE' && !permissions.canDelete) {
      return NextResponse.json(
        { error: 'Not authorized: insufficient permissions' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
};
