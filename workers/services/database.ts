import type { Bindings } from '../types/bindings';

export class DatabaseService {
  constructor(private db: D1Database) {}

  // === USERS ===
  async createUser(data: {
    id: string;
    email: string;
    name?: string;
    role?: string;
    passwordHash: string;
  }) {
    return await this.db.prepare(`
      INSERT INTO users (id, email, name, role, password_hash)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      data.id,
      data.email,
      data.name || null,
      data.role || 'USER',
      data.passwordHash
    ).run();
  }

  async getUserByEmail(email: string) {
    return await this.db.prepare(`
      SELECT * FROM users WHERE email = ?
    `).bind(email).first();
  }

  async getUserById(id: string) {
    return await this.db.prepare(`
      SELECT id, email, name, role, created_at FROM users WHERE id = ?
    `).bind(id).first();
  }

  // === DOCUMENTS ===
  async createDocument(data: {
    id: string;
    title: string;
    content: string;
    type: string;
    fileUrl?: string;
    fileSize?: number;
    fileType?: string;
    extractedData?: any;
    userId: string;
  }) {
    return await this.db.prepare(`
      INSERT INTO documents (id, title, content, type, file_url, file_size, file_type, extracted_data, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.id,
      data.title,
      data.content,
      data.type,
      data.fileUrl || null,
      data.fileSize || null,
      data.fileType || null,
      JSON.stringify(data.extractedData || {}),
      data.userId
    ).run();
  }

  async updateDocumentStatus(id: string, status: string, extractedData?: any) {
    return await this.db.prepare(`
      UPDATE documents 
      SET status = ?, extracted_data = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(
      status,
      JSON.stringify(extractedData || {}),
      id
    ).run();
  }

  async getDocuments(userId: string, type?: string, limit = 50, offset = 0) {
    const query = type
      ? `SELECT * FROM documents WHERE user_id = ? AND type = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`
      : `SELECT * FROM documents WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    
    const params = type ? [userId, type, limit, offset] : [userId, limit, offset];
    
    const { results } = await this.db.prepare(query).bind(...params).all();
    
    return results.map(doc => ({
      ...doc,
      extractedData: JSON.parse(doc.extracted_data as string || '{}')
    }));
  }

  async getDocumentById(id: string, userId: string) {
    const result = await this.db.prepare(`
      SELECT * FROM documents WHERE id = ? AND user_id = ?
    `).bind(id, userId).first();

    if (result) {
      return {
        ...result,
        extractedData: JSON.parse(result.extracted_data as string || '{}')
      };
    }
    return null;
  }

  // === REPORTS ===
  async createReport(data: {
    id: string;
    title: string;
    content: string;
    type: string;
    metadata?: any;
    userId: string;
  }) {
    return await this.db.prepare(`
      INSERT INTO reports (id, title, content, type, metadata, user_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      data.id,
      data.title,
      data.content,
      data.type,
      JSON.stringify(data.metadata || {}),
      data.userId
    ).run();
  }

  async getReports(userId: string, type?: string, limit = 50, offset = 0) {
    const query = type
      ? `SELECT * FROM reports WHERE user_id = ? AND type = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`
      : `SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    
    const params = type ? [userId, type, limit, offset] : [userId, limit, offset];
    
    const { results } = await this.db.prepare(query).bind(...params).all();
    
    return results.map(report => ({
      ...report,
      metadata: JSON.parse(report.metadata as string || '{}')
    }));
  }

  // === RISK ASSESSMENTS ===
  async createRiskAssessment(data: {
    id: string;
    area: string;
    riskLevel: string;
    factors: any;
    predictions?: any;
    confidenceScore?: number;
    userId?: string;
  }) {
    return await this.db.prepare(`
      INSERT INTO risk_assessments (id, area, risk_level, factors, predictions, confidence_score, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.id,
      data.area,
      data.riskLevel,
      JSON.stringify(data.factors),
      JSON.stringify(data.predictions || {}),
      data.confidenceScore || null,
      data.userId || null
    ).run();
  }

  async getRiskAssessments(area?: string, limit = 50, offset = 0) {
    const query = area
      ? `SELECT * FROM risk_assessments WHERE area = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`
      : `SELECT * FROM risk_assessments ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    
    const params = area ? [area, limit, offset] : [limit, offset];
    
    const { results } = await this.db.prepare(query).bind(...params).all();
    
    return results.map(assessment => ({
      ...assessment,
      factors: JSON.parse(assessment.factors as string || '{}'),
      predictions: JSON.parse(assessment.predictions as string || '{}')
    }));
  }

  // === CHATS ===
  async createOrUpdateChat(data: {
    id: string;
    title?: string;
    messages: any[];
    userId: string;
  }) {
    return await this.db.prepare(`
      INSERT OR REPLACE INTO chats (id, title, messages, user_id, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      data.id,
      data.title || null,
      JSON.stringify(data.messages),
      data.userId
    ).run();
  }

  async getChats(userId: string, limit = 20, offset = 0) {
    const { results } = await this.db.prepare(`
      SELECT id, title, created_at, updated_at FROM chats 
      WHERE user_id = ? 
      ORDER BY updated_at DESC 
      LIMIT ? OFFSET ?
    `).bind(userId, limit, offset).all();
    
    return results;
  }

  async getChatById(id: string, userId: string) {
    const result = await this.db.prepare(`
      SELECT * FROM chats WHERE id = ? AND user_id = ?
    `).bind(id, userId).first();

    if (result) {
      return {
        ...result,
        messages: JSON.parse(result.messages as string || '[]')
      };
    }
    return null;
  }

  // === SOPs ===
  async createSOP(data: {
    id: string;
    title: string;
    content: string;
    imasStandards: string[];
    category: string;
    version?: string;
    userId: string;
  }) {
    return await this.db.prepare(`
      INSERT INTO sops (id, title, content, imas_standards, category, version, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.id,
      data.title,
      data.content,
      JSON.stringify(data.imasStandards),
      data.category,
      data.version || '1.0',
      data.userId
    ).run();
  }

  async getSOPs(userId: string, category?: string, limit = 50, offset = 0) {
    const query = category
      ? `SELECT * FROM sops WHERE user_id = ? AND category = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`
      : `SELECT * FROM sops WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    
    const params = category ? [userId, category, limit, offset] : [userId, limit, offset];
    
    const { results } = await this.db.prepare(query).bind(...params).all();
    
    return results.map(sop => ({
      ...sop,
      imasStandards: JSON.parse(sop.imas_standards as string || '[]')
    }));
  }

  // === ANALYTICS ===
  async getStatistics(userId: string) {
    const [documentsCount, reportsCount, riskAssessmentsCount, sopCount] = await Promise.all([
      this.db.prepare(`SELECT COUNT(*) as count FROM documents WHERE user_id = ?`).bind(userId).first(),
      this.db.prepare(`SELECT COUNT(*) as count FROM reports WHERE user_id = ?`).bind(userId).first(),
      this.db.prepare(`SELECT COUNT(*) as count FROM risk_assessments WHERE user_id = ?`).bind(userId).first(),
      this.db.prepare(`SELECT COUNT(*) as count FROM sops WHERE user_id = ?`).bind(userId).first(),
    ]);

    return {
      documentsProcessed: documentsCount?.count || 0,
      reportsGenerated: reportsCount?.count || 0,
      riskAssessments: riskAssessmentsCount?.count || 0,
      sopsCreated: sopCount?.count || 0,
    };
  }
}