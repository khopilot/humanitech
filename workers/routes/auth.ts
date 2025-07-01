import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { SignJWT } from 'jose';
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

// Helper function to hash password using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // Create a key from the password
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    data,
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  // Derive bits using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  
  // Convert to hex string with salt prepended
  const hashArray = new Uint8Array(derivedBits);
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return saltHex + ':' + hashHex;
}

// Helper function to verify password
async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const [saltHex, hashHex] = storedHash.split(':');
    if (!saltHex || !hashHex) return false;
  
  // Convert hex strings back to arrays
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
  
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  // Create a key from the password
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    data,
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  // Derive bits using same parameters
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  
  // Convert to hex and compare
  const hashArray = new Uint8Array(derivedBits);
  const computedHashHex = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return computedHashHex === hashHex;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
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