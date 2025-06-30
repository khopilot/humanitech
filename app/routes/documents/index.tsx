import { useQuery } from '@tanstack/react-query';
import { documentsApi } from '~/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import { Link } from 'react-router-dom';
import { FileText, Upload, Search, Filter, Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { DocumentType, DocumentStatus } from '~/types/api';
import { useToast } from '~/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';

export default function DocumentsIndex() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<DocumentType | 'ALL'>('ALL');
  const { toast } = useToast();

  const { data: documents, isLoading, refetch } = useQuery({
    queryKey: ['documents', filterType],
    queryFn: async () => {
      const params = filterType !== 'ALL' ? { type: filterType } : undefined;
      const response = await documentsApi.list(params);
      return response.data.documents;
    },
  });

  const filteredDocuments = documents?.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: DocumentStatus) => {
    const variants: Record<DocumentStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      [DocumentStatus.PENDING]: { variant: 'secondary', label: 'En attente' },
      [DocumentStatus.PROCESSING]: { variant: 'default', label: 'Traitement...' },
      [DocumentStatus.COMPLETED]: { variant: 'outline', label: 'Terminé' },
      [DocumentStatus.FAILED]: { variant: 'destructive', label: 'Échec' },
    };
    
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getDocumentTypeLabel = (type: DocumentType) => {
    const labels: Record<DocumentType, string> = {
      [DocumentType.FIELD_REPORT]: 'Rapport de terrain',
      [DocumentType.SURVEY_FORM]: 'Formulaire d\'enquête',
      [DocumentType.SOP_MANUAL]: 'Manuel SOP',
      [DocumentType.DONOR_REPORT]: 'Rapport donateur',
      [DocumentType.TRAINING_MATERIAL]: 'Matériel de formation',
      [DocumentType.HAZARD_SURVEY]: 'Enquête de danger',
      [DocumentType.INCIDENT_LOG]: 'Journal d\'incident',
    };
    return labels[type];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Gérez et consultez vos documents d'action contre les mines
          </p>
        </div>
        <Link to="/documents/upload">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Uploader un document
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher des documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Type de document" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous les types</SelectItem>
                {Object.values(DocumentType).map(type => (
                  <SelectItem key={type} value={type}>
                    {getDocumentTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredDocuments?.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun document trouvé</p>
              <Link to="/documents/upload">
                <Button variant="link" className="mt-2">
                  Uploader votre premier document
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocuments?.map((doc) => (
                <Card key={doc.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-medium">{doc.title}</h3>
                        {getStatusBadge(doc.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <Badge variant="secondary">{getDocumentTypeLabel(doc.type)}</Badge>
                        <span>{new Date(doc.createdAt).toLocaleDateString('fr-FR')}</span>
                        {doc.fileSize && (
                          <span>{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/documents/${doc.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
                            try {
                              await documentsApi.delete(doc.id);
                              toast({
                                title: 'Document supprimé',
                                description: 'Le document a été supprimé avec succès',
                              });
                              refetch();
                            } catch (error) {
                              toast({
                                title: 'Erreur',
                                description: 'Impossible de supprimer le document',
                                variant: 'destructive',
                              });
                            }
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}