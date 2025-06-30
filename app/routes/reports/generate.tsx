import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react/dist/esm/icons/arrow-left';
import { Button } from '~/components/ui/button';

export default function ReportGenerate() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/reports">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Générer un rapport</h1>
          <p className="text-muted-foreground">
            Créez un rapport personnalisé avec l'IA
          </p>
        </div>
      </div>

      <div>
        {/* TODO: Add report generator component */}
        <p>Report generator will be added here</p>
      </div>
    </div>
  );
}