import { Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from '~/components/layout/Header';
import { Sidebar } from '~/components/layout/Sidebar';
import { ProtectedRoute } from '~/components/auth/ProtectedRoute';
import { ErrorBoundary } from '~/components/ErrorBoundary';
import { Toaster } from '~/components/ui/toaster';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

export default function Layout() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ProtectedRoute>
          <div className="min-h-screen bg-background">
            <Header />
            
            <div className="flex">
              <Sidebar />
              
              <main className="flex-1 p-6">
                <ErrorBoundary>
                  <Outlet />
                </ErrorBoundary>
              </main>
            </div>
          </div>
          
          <Toaster />
        </ProtectedRoute>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}