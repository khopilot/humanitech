// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  USER = 'USER',
  IM_OFFICER = 'IM_OFFICER',
  PROGRAM_MANAGER = 'PROGRAM_MANAGER',
  ADMIN = 'ADMIN'
}

export interface LoginResponse {
  user: User;
  token: string;
  csrfToken?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

// Document Types
export interface Document {
  id: string;
  title: string;
  content: string;
  type: DocumentType;
  fileUrl?: string;
  fileSize?: number;
  fileType?: string;
  extractedData?: Record<string, any>;
  status: DocumentStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export enum DocumentType {
  FIELD_REPORT = 'FIELD_REPORT',
  SURVEY_FORM = 'SURVEY_FORM',
  SOP_MANUAL = 'SOP_MANUAL',
  DONOR_REPORT = 'DONOR_REPORT',
  TRAINING_MATERIAL = 'TRAINING_MATERIAL',
  HAZARD_SURVEY = 'HAZARD_SURVEY',
  INCIDENT_LOG = 'INCIDENT_LOG'
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

// Report Types
export interface Report {
  id: string;
  title: string;
  content: string;
  type: ReportType;
  metadata?: ReportMetadata;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export enum ReportType {
  DONOR_REPORT = 'DONOR_REPORT',
  PROGRESS_REPORT = 'PROGRESS_REPORT',
  RISK_ASSESSMENT = 'RISK_ASSESSMENT',
  OPERATIONAL_PLAN = 'OPERATIONAL_PLAN'
}

export interface ReportMetadata {
  donorName?: string;
  dateRange?: DateRange;
  totalDocuments?: number;
  keyMetrics?: Record<string, number>;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface GenerateReportRequest {
  reportType: ReportType;
  dataSource: string;
  donorSpecific?: string;
  dateRange?: DateRange;
}

// Chat Types
export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface Chat {
  id: string;
  title?: string;
  messages: ChatMessage[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageRequest {
  messages: ChatMessage[];
  chatId?: string;
}

export interface ChatResponse {
  response: string;
  chatId: string;
}

// Risk Analysis Types
export interface RiskAssessment {
  id: string;
  area: string;
  riskLevel: RiskLevel;
  factors: RiskFactors;
  predictions?: RiskPredictions;
  confidenceScore?: number;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface RiskFactors {
  historicalIncidents: number;
  hazardDensity: number;
  populationProximity: number;
  infrastructureImportance: number;
  environmentalFactors: string[];
}

export interface RiskPredictions {
  nextIncidentProbability: number;
  recommendedPriority: number;
  estimatedClearanceTime: number;
}

export interface RiskAnalysisRequest {
  area: string;
  includeHistorical?: boolean;
}

export interface RiskAnalysisResponse {
  level: RiskLevel;
  analysis: string;
  recommendations: string[];
}

// SOP Types
export interface SOP {
  id: string;
  title: string;
  content: string;
  imasStandards: string[];
  category: SOPCategory;
  version: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export enum SOPCategory {
  SURVEY = 'SURVEY',
  CLEARANCE = 'CLEARANCE',
  DISPOSAL = 'DISPOSAL',
  SAFETY = 'SAFETY',
  TRAINING = 'TRAINING',
  REPORTING = 'REPORTING'
}

export interface GenerateSOPRequest {
  topic: string;
  category: SOPCategory;
  imasStandards: string[];
}

// Analytics Types
export interface AnalyticsStats {
  documentsProcessed: number;
  reportsGenerated: number;
  riskAssessments: number;
  sopsCreated: number;
  activeUsers?: number;
  averageProcessingTime?: number;
}

export interface ActivityItem {
  id: string;
  description: string;
  timestamp: string;
  type: ActivityType;
  userId: string;
  metadata?: Record<string, any>;
}

export enum ActivityType {
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  REPORT_GENERATED = 'REPORT_GENERATED',
  RISK_ASSESSED = 'RISK_ASSESSED',
  SOP_CREATED = 'SOP_CREATED',
  CHAT_INTERACTION = 'CHAT_INTERACTION'
}

// Pagination
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

// Common Error Response
export interface ErrorResponse {
  error: string;
  message?: string;
  details?: Record<string, any>;
}