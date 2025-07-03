import { jwtVerify, SignJWT } from 'jose';

type RequestWithCookies = {
  cookies?:
    | {
        get?: (key: string) => string | { value: string } | undefined;
        token?: string | { value: string };
      }
    | Record<string, string>;
};

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

function getSecretKey() {
  return new TextEncoder().encode(JWT_SECRET);
}

export async function signJWT(user: {
  id: number;
  role: string;
  username: string;
}) {
  return await new SignJWT(user)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1d')
    .sign(getSecretKey());
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as { id: number; role: string; username: string };
  } catch {
    return null;
  }
}

function extractToken(req: RequestWithCookies): string | undefined {
  if (req.cookies && typeof req.cookies.get === 'function') {
    const cookie = req.cookies.get('token');
    return typeof cookie === 'string' ? cookie : cookie?.value;
  }
  if (
    req.cookies &&
    typeof req.cookies === 'object' &&
    typeof req.cookies.token === 'string'
  ) {
    return req.cookies.token;
  }
}

export async function getUserFromRequest(req: RequestWithCookies) {
  const token = extractToken(req);
  if (!token) {
    return null;
  }
  return await verifyJWT(token);
}
