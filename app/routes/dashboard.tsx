import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { analyticsApi } from '~/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { FileText } from 'lucide-react/dist/esm/icons/file-text';
import { BarChart3 } from 'lucide-react/dist/esm/icons/bar-chart-3';
import { AlertTriangle } from 'lucide-react/dist/esm/icons/alert-triangle';
import { MessageCircle } from 'lucide-react/dist/esm/icons/message-circle';
import { TrendingUp } from 'lucide-react/dist/esm/icons/trending-up';
import { Users } from 'lucide-react/dist/esm/icons/users';
import { Clock } from 'lucide-react/dist/esm/icons/clock';
import { Activity } from 'lucide-react/dist/esm/icons/activity';
import type { AnalyticsStats, ActivityItem } from '~/types/api';

interface StatCard {
  title: string;
  value: number | string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<AnalyticsStats>({
    queryKey: ['analytics', 'stats'],
    queryFn: async () => {
      const response = await analyticsApi.getStats();
      return response.data;
    },
  });

  const { data: activity } = useQuery<ActivityItem[]>({
    queryKey: ['analytics', 'activity'],
    queryFn: async () => {
      const response = await analyticsApi.getActivity({ days: 7 });
      return response.data;
    },
  });

  const statCards = useMemo<StatCard[]>(() => [
    {
      title: 'Documents traités',
      value: stats?.documentsProcessed || 0,
      description: '+12% depuis le mois dernier',
      icon: FileText,
      trend: 'up'
    },
    {
      title: 'Rapports générés',
      value: stats?.reportsGenerated || 0,
      description: '+8% depuis le mois dernier',
      icon: BarChart3,
      trend: 'up'
    },
    {
      title: 'Évaluations risques',
      value: stats?.riskAssessments || 0,
      description: '2 zones critiques identifiées',
      icon: AlertTriangle,
      trend: 'stable'
    },
    {
      title: 'SOPs créées',
      value: stats?.sopsCreated || 0,
      description: '+23% d\'utilisation cette semaine',
      icon: MessageCircle,
      trend: 'up'
    },
  ], [stats]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mine Action AI Dashboard</h1>
        <p className="text-muted-foreground">
          Système d'IA pour l'action humanitaire contre les mines - Phase 1
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <a
              href="/documents/upload"
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Uploader un document</p>
                <p className="text-sm text-muted-foreground">
                  Traiter un nouveau rapport ou formulaire
                </p>
              </div>
            </a>
            <a
              href="/reports/generate"
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <BarChart3 className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Générer un rapport</p>
                <p className="text-sm text-muted-foreground">
                  Créer un rapport personnalisé avec l'IA
                </p>
              </div>
            </a>
            <a
              href="/chat"
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <MessageCircle className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Consulter l'assistant IA</p>
                <p className="text-sm text-muted-foreground">
                  Obtenir de l'aide sur les standards IMAS
                </p>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activity?.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {item.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(item.timestamp).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground">
                  Aucune activité récente
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>État du système</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <div>
                <p className="font-medium">API Backend</p>
                <p className="text-sm text-muted-foreground">Opérationnel</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <div>
                <p className="font-medium">Service Claude AI</p>
                <p className="text-sm text-muted-foreground">Connecté</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <div>
                <p className="font-medium">Base de données</p>
                <p className="text-sm text-muted-foreground">En ligne</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}