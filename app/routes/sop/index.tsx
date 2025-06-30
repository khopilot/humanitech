import { Link } from 'react-router-dom';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { ClipboardList } from 'lucide-react/dist/esm/icons/clipboard-list';
import { Plus } from 'lucide-react/dist/esm/icons/plus';

export default function SOPIndex() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Procédures opérationnelles</h1>
          <p className="text-muted-foreground">
            Créez et gérez vos SOPs conformes aux standards IMAS
          </p>
        </div>
        <Link to="/sop/generate">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Générer une SOP
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Aucune SOP disponible</p>
          <Link to="/sop/generate">
            <Button variant="link" className="mt-2">
              Créer votre première SOP
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}