import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { SignJWT } from 'jose';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../services/database';
import type { Bindings, Variables } from '../types/bindings';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['USER', 'IM_OFFICER', 'PROGRAM_MANAGER', 'ADMIN']).optional(),
});

// Helper function to hash password securely
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Helper function to verify password
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Helper function to create JWT
async function createToken(user: any, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  return await new SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(encoder.encode(secret));
}

// Login endpoint
app.post('/login', zValidator('json', loginSchema), async (c) => {
  try {
    const { email, password } = c.req.valid('json');
    const db = new DatabaseService(c.env.DB);
    
    const user = await db.getUserByEmail(email);
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const token = await createToken(user, c.env.JWT_SECRET);
    
    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// Register endpoint
app.post('/register', zValidator('json', registerSchema), async (c) => {
  try {
    const { email, password, name, role } = c.req.valid('json');
    const db = new DatabaseService(c.env.DB);
    
    // Check if user already exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return c.json({ error: 'User already exists' }, 409);
    }

    const userId = crypto.randomUUID();
    const passwordHash = await hashPassword(password);
    
    await db.createUser({
      id: userId,
      email,
      name,
      role,
      passwordHash,
    });

    const user = { id: userId, email, name, role: role || 'USER' };
    const token = await createToken(user, c.env.JWT_SECRET);
    
    return c.json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

// Profile endpoint (requires authentication)
app.get('/profile', async (c) => {
  const user = c.get('user');
  const db = new DatabaseService(c.env.DB);
  
  const userData = await db.getUserById(user.id);
  if (!userData) {
    return c.json({ error: 'User not found' }, 404);
  }
  
  return c.json({
    user: {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      createdAt: userData.created_at,
    }
  });
});

export { app as authRoutes };