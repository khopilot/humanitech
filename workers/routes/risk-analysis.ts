import { Hono } from 'hono';
import { z } from 'zod';
import { ClaudeService } from '../services/claude';
import { DatabaseService } from '../services/database';
import type { Bindings, Variables } from '../types/bindings';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const analyzeRiskSchema = z.object({
  area: z.string(),
  includeHistorical: z.boolean().optional(),
});

// Analyze risk for an area
app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const validation = analyzeRiskSchema.safeParse(body);
    
    if (!validation.success) {
      return c.json({ error: 'Invalid risk analysis parameters' }, 400);
    }

    const { area, includeHistorical } = validation.data;
    const user = c.get('user');
    const db = new DatabaseService(c.env.DB);
    
    // Fetch relevant documents for risk analysis
    const surveyData = await db.getDocuments(user.id, 'HAZARD_SURVEY');
    const incidentLogs = await db.getDocuments(user.id, 'INCIDENT_LOG');
    
    if (surveyData.length === 0 && incidentLogs.length === 0) {
      return c.json({ 
        error: 'Insufficient data for risk analysis. Please upload survey forms or incident logs.' 
      }, 404);
    }

    // Get historical assessments if requested
    let historicalAssessments = [];
    if (includeHistorical) {
      historicalAssessments = await db.getRiskAssessments(area);
    }

    // Perform risk assessment using Claude
    const claudeService = new ClaudeService(c.env.ANTHROPIC_API_KEY);
    const riskAssessment = await claudeService.assessRisk(
      surveyData,
      incidentLogs,
      area
    );

    // Save risk assessment
    const assessmentId = crypto.randomUUID();
    await db.createRiskAssessment({
      id: assessmentId,
      area,
      riskLevel: riskAssessment.level,
      factors: {
        surveyCount: surveyData.length,
        incidentCount: incidentLogs.length,
        historicalCount: historicalAssessments.length,
      },
      predictions: {
        analysis: riskAssessment.analysis,
        recommendations: riskAssessment.recommendations,
      },
      confidenceScore: 0.85, // This could be calculated based on data quality
      userId: user.id,
    });

    return c.json({
      assessmentId,
      area,
      riskLevel: riskAssessment.level,
      analysis: riskAssessment.analysis,
      recommendations: riskAssessment.recommendations,
      dataUsed: {
        surveyCount: surveyData.length,
        incidentCount: incidentLogs.length,
        historicalCount: historicalAssessments.length,
      },
    });
  } catch (error) {
    console.error('Risk analysis error:', error);
    return c.json({ error: 'Failed to analyze risk' }, 500);
  }
});

// Get risk assessments
app.get('/', async (c) => {
  try {
    const area = c.req.query('area');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');

    const db = new DatabaseService(c.env.DB);
    const assessments = await db.getRiskAssessments(area, limit, offset);
    
    return c.json({ assessments });
  } catch (error) {
    console.error('Fetch risk assessments error:', error);
    return c.json({ error: 'Failed to fetch risk assessments' }, 500);
  }
});

export { app as riskAnalysisRoutes };