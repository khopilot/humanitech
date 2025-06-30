import { Hono } from 'hono';
import { z } from 'zod';
import { ClaudeService } from '../services/claude';
import { DatabaseService } from '../services/database';
import type { Bindings, Variables } from '../types/bindings';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const chatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })),
  chatId: z.string().optional(),
});

// Send message to chat
app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const validation = chatSchema.safeParse(body);
    
    if (!validation.success) {
      return c.json({ error: 'Invalid chat data' }, 400);
    }

    const { messages, chatId } = validation.data;
    const user = c.get('user');
    const db = new DatabaseService(c.env.DB);
    
    // Generate response using Claude
    const claudeService = new ClaudeService(c.env.ANTHROPIC_API_KEY);
    const response = await claudeService.chatResponse(messages, {
      role: user.role,
    });

    // Update messages with Claude's response
    const updatedMessages = [
      ...messages,
      { role: 'assistant' as const, content: response }
    ];

    // Save or update chat
    const finalChatId = chatId || crypto.randomUUID();
    await db.createOrUpdateChat({
      id: finalChatId,
      messages: updatedMessages,
      userId: user.id,
      title: messages[0]?.content.slice(0, 50) || 'New Chat',
    });

    return c.json({
      chatId: finalChatId,
      response,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return c.json({ error: 'Failed to process chat message' }, 500);
  }
});

// Get chat history
app.get('/history', async (c) => {
  try {
    const user = c.get('user');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');

    const db = new DatabaseService(c.env.DB);
    const chats = await db.getChats(user.id, limit, offset);
    
    return c.json({ chats });
  } catch (error) {
    console.error('Fetch chat history error:', error);
    return c.json({ error: 'Failed to fetch chat history' }, 500);
  }
});

// Get specific chat
app.get('/:id', async (c) => {
  try {
    const user = c.get('user');
    const chatId = c.req.param('id');

    const db = new DatabaseService(c.env.DB);
    const chat = await db.getChatById(chatId, user.id);
    
    if (!chat) {
      return c.json({ error: 'Chat not found' }, 404);
    }

    return c.json({ chat });
  } catch (error) {
    console.error('Fetch chat error:', error);
    return c.json({ error: 'Failed to fetch chat' }, 500);
  }
});

export { app as chatRoutes };