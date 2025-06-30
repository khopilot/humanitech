import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '~/components/ui/button';

export default function DocumentUpload() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/documents">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload de document</h1>
          <p className="text-muted-foreground">
            Importez vos documents pour l'analyse IA
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        {/* TODO: Add FileUpload component here */}
        <p>Upload component will be added here</p>
      </div>
    </div>
  );
}