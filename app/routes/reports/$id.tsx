import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react/dist/esm/icons/arrow-left';
import { Button } from '~/components/ui/button';

export default function ReportDetail() {
  const { id } = useParams();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/reports">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Détails du rapport</h1>
          <p className="text-muted-foreground">
            Rapport ID: {id}
          </p>
        </div>
      </div>

      <div>
        {/* TODO: Add report viewer component */}
        <p>Report viewer will be added here</p>
      </div>
    </div>
  );
}