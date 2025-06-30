export interface Bindings {
  DB: D1Database;
  STORAGE: R2Bucket;
  ANTHROPIC_API_KEY: string;
  JWT_SECRET: string;
  ENVIRONMENT: 'development' | 'production';
  CORS_ORIGINS: string;
  R2_PUBLIC_URL: string;
}

export interface Variables {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ParsedDocument {
  raw: string;
  structured?: any;
  metadata?: {
    pageCount?: number;
    wordCount?: number;
    extractedAt: string;
  };
}