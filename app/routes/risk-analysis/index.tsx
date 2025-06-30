import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';

export default function RiskAnalysisIndex() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analyse de risques</h1>
        <p className="text-muted-foreground">
          Évaluez et prédisez les risques par zone
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Risk analysis interface will be implemented here</p>
        </CardContent>
      </Card>
    </div>
  );
}