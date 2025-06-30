import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '~/components/ui/button';

export default function SOPGenerate() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/sop">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Générer une SOP</h1>
          <p className="text-muted-foreground">
            Créez une procédure opérationnelle conforme IMAS
          </p>
        </div>
      </div>

      <div>
        {/* TODO: Add SOP generator component */}
        <p>SOP generator will be added here</p>
      </div>
    </div>
  );
}