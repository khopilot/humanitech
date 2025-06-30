import { Hono } from 'hono';
import { z } from 'zod';
import { ClaudeService } from '../services/claude';
import { DatabaseService } from '../services/database';
import { DocumentParser } from '../services/parsers';
import type { Bindings, Variables } from '../types/bindings';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const uploadSchema = z.object({
  type: z.enum(['FIELD_REPORT', 'SURVEY_FORM', 'SOP_MANUAL', 'DONOR_REPORT', 'TRAINING_MATERIAL', 'HAZARD_SURVEY', 'INCIDENT_LOG']),
});

// Upload document
app.post('/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const user = c.get('user');

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return c.json({ error: 'File too large. Maximum size is 10MB' }, 400);
    }

    // Validate document type
    const validation = uploadSchema.safeParse({ type });
    if (!validation.success) {
      return c.json({ error: 'Invalid document type' }, 400);
    }

    const db = new DatabaseService(c.env.DB);
    const documentId = crypto.randomUUID();

    // Upload file to R2
    const fileKey = `documents/${user.id}/${documentId}/${file.name}`;
    await c.env.STORAGE.put(fileKey, file);
    const fileUrl = `${c.env.R2_PUBLIC_URL}/${fileKey}`;

    // Parse document content
    const parser = new DocumentParser();
    const parsedContent = await parser.parseFile(file);

    // Create document record
    await db.createDocument({
      id: documentId,
      title: file.name,
      content: parsedContent.raw,
      type: validation.data.type,
      fileUrl,
      fileSize: file.size,
      fileType: file.type,
      userId: user.id,
    });

    // Extract structured data using Claude in background
    const claudeService = new ClaudeService(c.env.ANTHROPIC_API_KEY);
    
    try {
      const extractedData = await claudeService.parseDocument(parsedContent.raw, type);
      await db.updateDocumentStatus(documentId, 'COMPLETED', {
        ...extractedData,
        parseMetadata: parsedContent.metadata
      });
    } catch (error) {
      console.error('Claude extraction error:', error);
      await db.updateDocumentStatus(documentId, 'FAILED', {
        error: 'AI extraction failed',
        parseMetadata: parsedContent.metadata
      });
    }

    return c.json({ 
      success: true,
      documentId,
      message: 'Document uploaded successfully. AI extraction in progress.' 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ error: 'Upload failed' }, 500);
  }
});

// Get documents
app.get('/', async (c) => {
  try {
    const user = c.get('user');
    const type = c.req.query('type');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');

    const db = new DatabaseService(c.env.DB);
    const documents = await db.getDocuments(user.id, type, limit, offset);
    
    return c.json({ documents });
  } catch (error) {
    console.error('Fetch documents error:', error);
    return c.json({ error: 'Failed to fetch documents' }, 500);
  }
});

// Get specific document
app.get('/:id', async (c) => {
  try {
    const user = c.get('user');
    const documentId = c.req.param('id');

    const db = new DatabaseService(c.env.DB);
    const document = await db.getDocumentById(documentId, user.id);
    
    if (!document) {
      return c.json({ error: 'Document not found' }, 404);
    }

    return c.json({ document });
  } catch (error) {
    console.error('Fetch document error:', error);
    return c.json({ error: 'Failed to fetch document' }, 500);
  }
});

// Delete document
app.delete('/:id', async (c) => {
  try {
    const user = c.get('user');
    const documentId = c.req.param('id');

    const db = new DatabaseService(c.env.DB);
    
    // Get document to check ownership and get file URL
    const document = await db.getDocumentById(documentId, user.id);
    if (!document) {
      return c.json({ error: 'Document not found' }, 404);
    }

    // Delete from R2 if file exists
    if (document.file_url) {
      const fileKey = document.file_url.split('/').slice(-3).join('/');
      await c.env.STORAGE.delete(fileKey);
    }

    // Delete from database
    await c.env.DB.prepare('DELETE FROM documents WHERE id = ? AND user_id = ?')
      .bind(documentId, user.id)
      .run();

    return c.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    return c.json({ error: 'Failed to delete document' }, 500);
  }
});

export { app as documentRoutes };