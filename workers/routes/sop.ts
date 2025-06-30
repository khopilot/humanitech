import { Hono } from 'hono';
import { z } from 'zod';
import { ClaudeService } from '../services/claude';
import { DatabaseService } from '../services/database';
import type { Bindings, Variables } from '../types/bindings';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const generateSOPSchema = z.object({
  topic: z.string(),
  category: z.string(),
  imasStandards: z.array(z.string()),
});

// Generate SOP
app.post('/generate', async (c) => {
  try {
    const body = await c.req.json();
    const validation = generateSOPSchema.safeParse(body);
    
    if (!validation.success) {
      return c.json({ error: 'Invalid SOP parameters' }, 400);
    }

    const { topic, category, imasStandards } = validation.data;
    const user = c.get('user');
    const db = new DatabaseService(c.env.DB);
    
    // Generate SOP using Claude
    const claudeService = new ClaudeService(c.env.ANTHROPIC_API_KEY);
    const sopContent = await claudeService.generateSOP(
      topic,
      imasStandards,
      category
    );

    // Save SOP to database
    const sopId = crypto.randomUUID();
    await db.createSOP({
      id: sopId,
      title: topic,
      content: sopContent,
      imasStandards,
      category,
      userId: user.id,
    });

    return c.json({
      success: true,
      sopId,
      content: sopContent,
    });
  } catch (error) {
    console.error('SOP generation error:', error);
    return c.json({ error: 'Failed to generate SOP' }, 500);
  }
});

// Get SOPs
app.get('/', async (c) => {
  try {
    const user = c.get('user');
    const category = c.req.query('category');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');

    const db = new DatabaseService(c.env.DB);
    const sops = await db.getSOPs(user.id, category, limit, offset);
    
    return c.json({ sops });
  } catch (error) {
    console.error('Fetch SOPs error:', error);
    return c.json({ error: 'Failed to fetch SOPs' }, 500);
  }
});

// Get specific SOP
app.get('/:id', async (c) => {
  try {
    const user = c.get('user');
    const sopId = c.req.param('id');

    const db = new DatabaseService(c.env.DB);
    const sops = await db.getSOPs(user.id);
    const sop = sops.find(s => s.id === sopId);
    
    if (!sop) {
      return c.json({ error: 'SOP not found' }, 404);
    }

    return c.json({ sop });
  } catch (error) {
    console.error('Fetch SOP error:', error);
    return c.json({ error: 'Failed to fetch SOP' }, 500);
  }
});

export { app as sopRoutes };