import { createMiddleware } from 'hono/factory';
import { jwtVerify } from 'jose';
import type { Bindings, Variables } from '../types/bindings';

export const authMiddleware = createMiddleware<{
  Bindings: Bindings;
  Variables: Variables;
}>(async (c, next) => {
  const authorization = c.req.header('Authorization');
  
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized - Missing or invalid token' }, 401);
  }

  const token = authorization.slice(7); // Remove 'Bearer ' prefix
  
  try {
    const secret = new TextEncoder().encode(c.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    if (!payload.sub || !payload.email) {
      return c.json({ error: 'Unauthorized - Invalid token payload' }, 401);
    }

    // Set user in context
    c.set('user', {
      id: payload.sub as string,
      email: payload.email as string,
      role: payload.role as string || 'USER',
    });

    await next();
  } catch (error) {
    console.error('Auth error:', error);
    return c.json({ error: 'Unauthorized - Token verification failed' }, 401);
  }
});