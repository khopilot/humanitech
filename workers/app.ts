import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { secureHeaders } from "hono/secure-headers";
import { createRequestHandler } from "react-router";

import { authRoutes } from "./routes/auth";
import { documentRoutes } from "./routes/documents";
import { reportRoutes } from "./routes/reports";
import { chatRoutes } from "./routes/chat";
import { riskAnalysisRoutes } from "./routes/risk-analysis";
import { sopRoutes } from "./routes/sop";

import { authMiddleware } from "./middleware/auth";
import type { Bindings, Variables } from "./types/bindings";

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Middleware global
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', secureHeaders());

app.use('/api/*', cors({
  origin: (origin) => {
    const allowedOrigins = ['http://localhost:5173', 'https://your-frontend.workers.dev'];
    return allowedOrigins.includes(origin) || origin?.endsWith('.workers.dev');
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Routes publiques
app.route('/api/auth', authRoutes);

// Health check
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT 
  });
});

// Routes protégées
app.use('/api/documents/*', authMiddleware);
app.use('/api/reports/*', authMiddleware);
app.use('/api/chat/*', authMiddleware);
app.use('/api/risk-analysis/*', authMiddleware);
app.use('/api/sop/*', authMiddleware);
app.use('/api/analytics/*', authMiddleware);

app.route('/api/documents', documentRoutes);
app.route('/api/reports', reportRoutes);
app.route('/api/chat', chatRoutes);
app.route('/api/risk-analysis', riskAnalysisRoutes);
app.route('/api/sop', sopRoutes);

// Analytics endpoint
app.get('/api/analytics/stats', authMiddleware, async (c) => {
  const user = c.get('user');
  const { DatabaseService } = await import('./services/database');
  const db = new DatabaseService(c.env.DB);
  const stats = await db.getStatistics(user.id);
  return c.json(stats);
});

// React Router handler for all other routes
app.get("*", (c) => {
  const requestHandler = createRequestHandler(
    () => import("virtual:react-router/server-build"),
    import.meta.env.MODE,
  );

  return requestHandler(c.req.raw, {
    cloudflare: { env: c.env, ctx: c.executionCtx },
  });
});

export default app;
