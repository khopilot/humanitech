import { Link } from 'react-router-dom';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { BarChart3 } from 'lucide-react/dist/esm/icons/bar-chart-3';
import { Plus } from 'lucide-react/dist/esm/icons/plus';

export default function ReportsIndex() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rapports</h1>
          <p className="text-muted-foreground">
            Générez et consultez vos rapports d'analyse
          </p>
        </div>
        <Link to="/reports/generate">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Générer un rapport
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Aucun rapport disponible</p>
          <Link to="/reports/generate">
            <Button variant="link" className="mt-2">
              Générer votre premier rapport
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}