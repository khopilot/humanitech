import { Hono } from 'hono';
import { z } from 'zod';
import { ClaudeService } from '../services/claude';
import { DatabaseService } from '../services/database';
import type { Bindings, Variables } from '../types/bindings';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const generateReportSchema = z.object({
  reportType: z.enum(['DONOR_REPORT', 'PROGRESS_REPORT', 'RISK_ASSESSMENT', 'OPERATIONAL_PLAN']),
  dataSource: z.string(),
  donorSpecific: z.string().optional(),
  dateRange: z.object({
    start: z.string(),
    end: z.string(),
  }).optional(),
});

// Generate report
app.post('/generate', async (c) => {
  try {
    const body = await c.req.json();
    const validation = generateReportSchema.safeParse(body);
    
    if (!validation.success) {
      return c.json({ error: 'Invalid report parameters' }, 400);
    }

    const { reportType, dataSource, donorSpecific, dateRange } = validation.data;
    const user = c.get('user');
    const db = new DatabaseService(c.env.DB);
    
    // Fetch relevant documents based on dataSource
    const documents = await db.getDocuments(user.id, dataSource);
    
    if (documents.length === 0) {
      return c.json({ error: 'No documents found for report generation' }, 404);
    }

    // Generate report using Claude
    const claudeService = new ClaudeService(c.env.ANTHROPIC_API_KEY);
    const reportContent = await claudeService.generateReport(
      documents,
      reportType,
      donorSpecific,
      dateRange
    );

    // Save report to database
    const reportId = crypto.randomUUID();
    await db.createReport({
      id: reportId,
      title: `${reportType} - ${new Date().toISOString().split('T')[0]}`,
      content: reportContent,
      type: reportType,
      metadata: {
        dataSource,
        donorSpecific,
        dateRange,
        documentCount: documents.length,
      },
      userId: user.id,
    });

    return c.json({
      success: true,
      reportId,
      content: reportContent,
    });
  } catch (error) {
    console.error('Report generation error:', error);
    return c.json({ error: 'Failed to generate report' }, 500);
  }
});

// Get reports
app.get('/', async (c) => {
  try {
    const user = c.get('user');
    const type = c.req.query('type');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');

    const db = new DatabaseService(c.env.DB);
    const reports = await db.getReports(user.id, type, limit, offset);
    
    return c.json({ reports });
  } catch (error) {
    console.error('Fetch reports error:', error);
    return c.json({ error: 'Failed to fetch reports' }, 500);
  }
});

// Get specific report
app.get('/:id', async (c) => {
  try {
    const user = c.get('user');
    const reportId = c.req.param('id');

    const db = new DatabaseService(c.env.DB);
    const report = await db.getReports(user.id).then(reports => 
      reports.find(r => r.id === reportId)
    );
    
    if (!report) {
      return c.json({ error: 'Report not found' }, 404);
    }

    return c.json({ report });
  } catch (error) {
    console.error('Fetch report error:', error);
    return c.json({ error: 'Failed to fetch report' }, 500);
  }
});

export { app as reportRoutes };