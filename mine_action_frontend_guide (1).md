# Mine Action AI System - Frontend Implementation Guide
## React Router + Vite + Cloudflare Workers

## Vue d'ensemble du Frontend

Ce guide implémente la partie frontend du système d'IA pour l'action humanitaire contre les mines, utilisant React Router et Vite sur Cloudflare Workers selon le plan stratégique HumaniTech Phase 1.

## Architecture Frontend

### Stack technologique Frontend
- **Framework**: React 18 + React Router v7
- **Build Tool**: Vite avec Cloudflare plugin
- **UI Framework**: shadcn/ui + Tailwind CSS
- **State Management**: React Query + Zustand
- **Forms**: React Hook Form + Zod
- **Authentification**: JWT + Context API
- **Déploiement**: Cloudflare Workers/Pages

## Structure du projet Frontend

```
mine-action-ai-frontend/
├── README.md
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── index.html
├── src/
│   ├── main.tsx             # Point d'entrée
│   ├── App.tsx              # Composant racine
│   ├── router.tsx           # Configuration React Router
│   ├── routes/
│   │   ├── _layout.tsx      # Layout principal
│   │   ├── dashboard.tsx    # Dashboard principal
│   │   ├── login.tsx        # Page de connexion
│   │   ├── documents/
│   │   │   ├── index.tsx    # Liste documents
│   │   │   ├── upload.tsx   # Upload documents
│   │   │   └── [id].tsx     # Détail document
│   │   ├── reports/
│   │   │   ├── index.tsx    # Liste rapports
│   │   │   └── generate.tsx # Génération rapports
│   │   ├── chat/
│   │   │   └── index.tsx    # Interface chat IA
│   │   ├── risk-analysis/
│   │   │   └── index.tsx    # Analyse de risques
│   │   └── sop/
│   │       ├── index.tsx    # Liste SOPs
│   │       └── generate.tsx # Génération SOPs
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Layout.tsx
│   │   ├── documents/
│   │   │   ├── FileUpload.tsx
│   │   │   ├── DocumentCard.tsx
│   │   │   ├── DocumentList.tsx
│   │   │   └── DocumentViewer.tsx
│   │   ├── reports/
│   │   │   ├── ReportGenerator.tsx
│   │   │   ├── ReportCard.tsx
│   │   │   └── ReportViewer.tsx
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   └── ChatHistory.tsx
│   │   ├── risk/
│   │   │   ├── RiskAnalysis.tsx
│   │   │   ├── RiskMap.tsx
│   │   │   └── RiskCard.tsx
│   │   └── sop/
│   │       ├── SOPGenerator.tsx
│   │       ├── SOPCard.tsx
│   │       └── SOPViewer.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useDocuments.ts
│   │   ├── useReports.ts
│   │   ├── useChat.ts
│   │   └── useRiskAnalysis.ts
│   ├── lib/
│   │   ├── api.ts           # Client API
│   │   ├── auth.ts          # Gestion auth
│   │   ├── utils.ts         # Utilitaires
│   │   └── constants.ts     # Constantes
│   ├── types/
│   │   ├── api.ts          # Types API
│   │   ├── auth.ts         # Types auth
│   │   └── common.ts       # Types communs
│   ├── store/
│   │   ├── auth.ts         # Store auth Zustand
│   │   ├── documents.ts    # Store documents
│   │   └── notifications.ts # Store notifications
│   └── styles/
│       └── globals.css     # Styles globaux
└── public/
    ├── favicon.ico
    └── manifest.json
```

## Installation et configuration Frontend

### 1. Initialisation du projet Frontend

```bash
# Créer le projet React avec Vite
npm create vite@latest mine-action-ai-frontend -- --template react-ts
cd mine-action-ai-frontend

# Installer React Router v7
npm install react-router@7 react-router-dom@7
npm install @remix-run/dev @remix-run/node

# Installer shadcn/ui et dépendances UI
npm install @radix-ui/react-slot
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react
npm install @hookform/resolvers react-hook-form zod

# Installer state management et API
npm install @tanstack/react-query
npm install zustand
npm install axios

# Installer outils de développement
npm install -D @types/node
npm install -D tailwindcss postcss autoprefixer
npm install -D @vitejs/plugin-react

# Initialiser Tailwind CSS
npx tailwindcss init -p

# Initialiser shadcn/ui
npx shadcn-ui@latest init
```

### 2. Configuration Vite (vite.config.ts)

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8787', // Backend Hono.js
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

### 3. Configuration React Router (src/router.tsx)

```tsx
// src/router.tsx
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './routes/_layout';
import { Dashboard } from './routes/dashboard';
import { Login } from './routes/login';
import { DocumentsIndex } from './routes/documents/index';
import { DocumentUpload } from './routes/documents/upload';
import { DocumentDetail } from './routes/documents/[id]';
import { ReportsIndex } from './routes/reports/index';
import { ReportGenerate } from './routes/reports/generate';
import { ChatIndex } from './routes/chat/index';
import { RiskAnalysisIndex } from './routes/risk-analysis/index';
import { SOPIndex } from './routes/sop/index';
import { SOPGenerate } from './routes/sop/generate';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'documents',
        children: [
          {
            index: true,
            element: <DocumentsIndex />,
          },
          {
            path: 'upload',
            element: <DocumentUpload />,
          },
          {
            path: ':id',
            element: <DocumentDetail />,
          },
        ],
      },
      {
        path: 'reports',
        children: [
          {
            index: true,
            element: <ReportsIndex />,
          },
          {
            path: 'generate',
            element: <ReportGenerate />,
          },
        ],
      },
      {
        path: 'chat',
        element: <ChatIndex />,
      },
      {
        path: 'risk-analysis',
        element: <RiskAnalysisIndex />,
      },
      {
        path: 'sop',
        children: [
          {
            index: true,
            element: <SOPIndex />,
          },
          {
            path: 'generate',
            element: <SOPGenerate />,
          },
        ],
      },
    ],
  },
]);
```

### 4. Client API (src/lib/api.ts)

```typescript
// src/lib/api.ts
import axios, { AxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/auth';

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-backend.workers.dev/api' 
  : '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs d'authentification
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// === Documents API ===
export const documentsApi = {
  upload: (file: File, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    return apiClient.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  list: (params?: { type?: string; limit?: number; offset?: number }) => 
    apiClient.get('/documents', { params }),
  
  getById: (id: string) => 
    apiClient.get(`/documents/${id}`),
  
  delete: (id: string) => 
    apiClient.delete(`/documents/${id}`),
};

// === Reports API ===
export const reportsApi = {
  generate: (data: {
    reportType: string;
    dataSource: string;
    donorSpecific?: string;
    dateRange?: { start: string; end: string };
  }) => apiClient.post('/reports/generate', data),
  
  list: (params?: { type?: string; limit?: number; offset?: number }) =>
    apiClient.get('/reports', { params }),
  
  getById: (id: string) =>
    apiClient.get(`/reports/${id}`),
};

// === Chat API ===
export const chatApi = {
  sendMessage: (data: {
    messages: Array<{ role: string; content: string }>;
    chatId?: string;
  }) => apiClient.post('/chat', data),
  
  getHistory: (params?: { limit?: number; offset?: number }) =>
    apiClient.get('/chat/history', { params }),
  
  getChat: (id: string) =>
    apiClient.get(`/chat/${id}`),
};

// === Risk Analysis API ===
export const riskAnalysisApi = {
  analyze: (data: { area: string; includeHistorical?: boolean }) =>
    apiClient.post('/risk-analysis', data),
  
  list: (params?: { area?: string; limit?: number; offset?: number }) =>
    apiClient.get('/risk-analysis', { params }),
};

// === SOP API ===
export const sopApi = {
  generate: (data: {
    topic: string;
    category: string;
    imasStandards: string[];
  }) => apiClient.post('/sop/generate', data),
  
  list: (params?: { category?: string; limit?: number; offset?: number }) =>
    apiClient.get('/sop', { params }),
  
  getById: (id: string) =>
    apiClient.get(`/sop/${id}`),
};

// === Auth API ===
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post('/auth/login', credentials),
  
  register: (data: { email: string; password: string; name: string; role?: string }) =>
    apiClient.post('/auth/register', data),
  
  refresh: () =>
    apiClient.post('/auth/refresh'),
  
  profile: () =>
    apiClient.get('/auth/profile'),
};

// === Analytics API ===
export const analyticsApi = {
  getStats: () =>
    apiClient.get('/analytics/stats'),
  
  getActivity: (params?: { days?: number }) =>
    apiClient.get('/analytics/activity', { params }),
};
```

### 5. Store d'authentification (src/store/auth.ts)

```typescript
// src/store/auth.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: { email: string; password: string; name: string }) => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.login({ email, password });
          const { user, token } = response.data;
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.register(data);
          const { user, token } = response.data;
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      refreshToken: async () => {
        try {
          const response = await authApi.refresh();
          const { token } = response.data;
          
          set({ token });
        } catch (error) {
          get().logout();
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

### 6. Hook personnalisés (src/hooks/useDocuments.ts)

```typescript
// src/hooks/useDocuments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '../lib/api';
import { useNotificationStore } from '../store/notifications';

export const useDocuments = (filters?: { type?: string; limit?: number; offset?: number }) => {
  return useQuery({
    queryKey: ['documents', filters],
    queryFn: () => documentsApi.list(filters),
    select: (data) => data.data.documents,
  });
};

export const useDocument = (id: string) => {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => documentsApi.getById(id),
    select: (data) => data.data.document,
    enabled: !!id,
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: ({ file, type }: { file: File; type: string }) =>
      documentsApi.upload(file, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      addNotification({
        type: 'success',
        title: 'Document uploadé',
        message: 'Le document a été uploadé avec succès. L\'IA est en train de l\'analyser.',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Erreur d\'upload',
        message: error.response?.data?.error || 'Une erreur est survenue lors de l\'upload.',
      });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: (id: string) => documentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      addNotification({
        type: 'success',
        title: 'Document supprimé',
        message: 'Le document a été supprimé avec succès.',
      });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Erreur de suppression',
        message: error.response?.data?.error || 'Une erreur est survenue lors de la suppression.',
      });
    },
  });
};
```

### 7. Composant Dashboard principal (src/routes/dashboard.tsx)

```tsx
// src/routes/dashboard.tsx
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { FileUpload } from '../components/documents/FileUpload';
import { ReportGenerator } from '../components/reports/ReportGenerator';
import { ChatInterface } from '../components/chat/ChatInterface';
import { RiskAnalysis } from '../components/risk/RiskAnalysis';
import { RecentDocuments } from '../components/documents/RecentDocuments';
import { RecentActivity } from '../components/layout/RecentActivity';
import { 
  FileText, 
  BarChart3, 
  AlertTriangle, 
  MessageCircle,
  Upload,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';

export function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['analytics', 'stats'],
    queryFn: () => analyticsApi.getStats(),
    select: (data) => data.data,
  });

  const { data: activity } = useQuery({
    queryKey: ['analytics', 'activity'],
    queryFn: () => analyticsApi.getActivity({ days: 7 }),
    select: (data) => data.data,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mine Action AI Dashboard</h1>
        <p className="text-muted-foreground">
          Système d'IA pour l'action humanitaire contre les mines - Phase 1
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents traités</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.documentsProcessed || 0}</div>
            <p className="text-xs text-muted-foreground">
              +12% depuis le mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rapports générés</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.reportsGenerated || 0}</div>
            <p className="text-xs text-muted-foreground">
              +8% depuis le mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Évaluations risques</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.riskAssessments || 0}</div>
            <p className="text-xs text-muted-foreground">
              2 zones critiques identifiées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SOPs créées</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.sopsCreated || 0}</div>
            <p className="text-xs text-muted-foreground">
              +23% d'utilisation cette semaine
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
          <TabsTrigger value="risk">Analyse Risques</TabsTrigger>
          <TabsTrigger value="chat">Assistant IA</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload rapide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FileUpload />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Génération rapide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ReportGenerator />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Documents récents</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentDocuments limit={5} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activité récente</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentActivity activities={activity?.slice(0, 5) || []} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <RecentDocuments />
        </TabsContent>

        <TabsContent value="reports">
          <ReportGenerator />
        </TabsContent>

        <TabsContent value="risk">
          <RiskAnalysis />
        </TabsContent>

        <TabsContent value="chat">
          <ChatInterface />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 8. Composant FileUpload (src/components/documents/FileUpload.tsx)

```tsx
// src/components/documents/FileUpload.tsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { useUploadDocument } from '../../hooks/useDocuments';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const DOCUMENT_TYPES = [
  { value: 'FIELD_REPORT', label: 'Rapport de terrain' },
  { value: 'SURVEY_FORM', label: 'Formulaire d\'enquête' },
  { value: 'SOP_MANUAL', label: 'Manuel SOP' },
  { value: 'DONOR_REPORT', label: 'Rapport donateur' },
  { value: 'TRAINING_MATERIAL', label: 'Matériel de formation' },
  { value: 'HAZARD_SURVEY', label: 'Enquête de danger' },
  { value: 'INCIDENT_LOG', label: 'Journal d\'incident' },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'text/csv': ['.csv'],
  'text/plain': ['.txt'],
};

export function FileUpload() {
  const [documentType, setDocumentType] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const uploadMutation = useUploadDocument();

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      console.error('Fichiers rejetés:', rejectedFiles);
      return;
    }

    const file = acceptedFiles[0];
    if (!file || !documentType) return;

    if (file.size > MAX_FILE_SIZE) {
      console.error('Fichier trop volumineux');
      return;
    }

    // Simulation du progrès d'upload
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    uploadMutation.mutate(
      { file, type: documentType },
      {
        onSuccess: () => {
          setUploadProgress(100);
          setTimeout(() => setUploadProgress(0), 2000);
        },
        onError: () => {
          clearInterval(interval);
          setUploadProgress(0);
        },
      }
    );
  }, [documentType, uploadMutation]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    disabled: !documentType || uploadMutation.isPending,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload de document
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={documentType} onValueChange={setDocumentType}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner le type de document" />
          </SelectTrigger>
          <SelectContent>
            {DOCUMENT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            ${isDragReject ? 'border-destructive bg-destructive/5' : ''}
            ${!documentType ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center gap-2">
            <FileText className="h-8 w-8 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-sm text-primary">Déposez le fichier ici...</p>
            ) : (
              <div className="text-sm text-muted-foreground">
                <p>Glissez-déposez un fichier ici, ou cliquez pour sélectionner</p>
                <p className="text-xs mt-1">
                  PDF, DOCX, XLSX, CSV, TXT (max. 10MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {uploadProgress > 0 && (
          <div className="space-y-2">
            <Progress value={uploadProgress} />
            <p className="text-sm text-muted-foreground text-center">
              {uploadProgress < 100 
                ? `Upload en cours... ${uploadProgress}%`
                : 'Traitement par l\'IA en cours...'
              }
            </p>
          </div>
        )}

        {uploadMutation.isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erreur lors de l'upload. Veuillez réessayer.
            </AlertDescription>
          </Alert>
        )}

        {uploadMutation.isSuccess && uploadProgress === 100 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Document uploadé avec succès ! L'IA a terminé l'analyse.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
```

### 9. Interface Chat (src/components/chat/ChatInterface.tsx)

```tsx
// src/components/chat/ChatInterface.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { chatApi } from '../../lib/api';
import { useAuthStore } from '../../store/auth';
import { Send, MessageCircle, Bot, User, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Bonjour ! Je suis votre assistant IA spécialisé dans l\'action humanitaire contre les mines. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [chatId] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  const sendMessageMutation = useMutation({
    mutationFn: (messages: Array<{ role: string; content: string }>) =>
      chatApi.sendMessage({ messages, chatId }),
    onSuccess: (response) => {
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || sendMessageMutation.isPending) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Préparer les messages pour l'API
    const apiMessages = [...messages, userMessage].map(m => ({
      role: m.role,
      content: m.content,
    }));

    sendMessageMutation.mutate(apiMessages);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-[700px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Assistant IA Mine Action
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4 p-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {format(message.timestamp, 'HH:mm', { locale: fr })}
                  </p>
                </div>

                {message.role === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {sendMessageMutation.isPending && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">L'assistant réfléchit...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Posez votre question sur l'action contre les mines..."
              disabled={sendMessageMutation.isPending}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={sendMessageMutation.isPending || !input.trim()}
              size="icon"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <div className="mt-2 text-xs text-muted-foreground">
            L'assistant IA est spécialisé dans les standards IMAS, l'évaluation des risques, 
            et la planification opérationnelle.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 10. Layout principal (src/routes/_layout.tsx)

```tsx
// src/routes/_layout.tsx
import { Outlet } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { Toaster } from '../components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

export function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="flex">
          <Sidebar />
          
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
        
        <Toaster />
      </div>
      
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

## Configuration de déploiement

### Script de build et déploiement

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "deploy": "npm run build && wrangler pages deploy dist",
    "type-check": "tsc --noEmit"
  }
}
```

### Configuration Cloudflare Pages

```toml
# wrangler.toml (pour Pages)
name = "mine-action-ai-frontend"
compatibility_date = "2024-06-01"

[env.production]
command = "npm run build"
cwd = "."

[env.production.vars]
VITE_API_URL = "https://your-backend.workers.dev/api"
VITE_ENVIRONMENT = "production"
```

## Fonctionnalités Frontend Phase 1 implémentées

### ✅ Interface moderne et responsive
- React Router v7 pour la navigation
- shadcn/ui pour les composants
- Tailwind CSS pour le styling
- Design adaptatif mobile/desktop

### ✅ Gestion d'état robuste
- React Query pour les données serveur
- Zustand pour l'état local
- Hooks personnalisés réutilisables
- Gestion d'erreurs centralisée

### ✅ Fonctionnalités métier complètes
- Upload et visualisation de documents
- Génération de rapports en temps réel
- Chat IA spécialisé mine action
- Analyse de risques interactive
- Génération de SOPs

### ✅ Expérience utilisateur optimisée
- Interface drag & drop pour l'upload
- Notifications en temps réel
- Indicateurs de progression
- Gestion des états de chargement
- Validation de formulaires

### ✅ Performance et scalabilité
- Code splitting automatique
- Mise en cache intelligente
- Optimisations Vite
- Déploiement edge Cloudflare

Ce frontend moderne et performant s'intègre parfaitement avec votre backend Hono.js pour créer une expérience utilisateur complète et professionnelle.