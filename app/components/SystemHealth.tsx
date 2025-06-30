import { useQuery } from '@tanstack/react-query';
import { apiClient } from '~/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '~/components/ui/button';

interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  environment: 'development' | 'production';
}

export function SystemHealth() {
  const { data: health, isLoading, error, refetch } = useQuery<HealthResponse>({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await apiClient.get('/health');
      return response.data;
    },
    refetchInterval: 60000, // Check every minute
    retry: 1,
  });

  const getStatusIcon = () => {
    if (isLoading) return <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />;
    if (error) return <XCircle className="h-5 w-5 text-destructive" />;
    if (health?.status === 'healthy') return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    return <AlertCircle className="h-5 w-5 text-yellow-500" />;
  };

  const getStatusText = () => {
    if (isLoading) return 'Vérification...';
    if (error) return 'Hors ligne';
    if (health?.status === 'healthy') return 'Opérationnel';
    return 'Dégradé';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">État du système</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          disabled={isLoading}
          className="h-8 w-8"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <div className="flex-1">
            <p className="text-sm font-medium">{getStatusText()}</p>
            {health && (
              <p className="text-xs text-muted-foreground">
                {health.environment === 'production' ? 'Production' : 'Développement'}
                {' • '}
                {new Date(health.timestamp).toLocaleTimeString('fr-FR')}
              </p>
            )}
          </div>
        </div>
        
        {error && (
          <div className="mt-2 text-xs text-destructive">
            Impossible de contacter le serveur
          </div>
        )}
      </CardContent>
    </Card>
  );
}