import { useQuery } from '@tanstack/react-query';
import { documentsApi } from '~/lib/api';
import { DocumentStatus } from '~/types/api';
import { useToast } from '~/components/ui/use-toast';
import { useEffect } from 'react';

interface UseDocumentStatusOptions {
  documentId: string;
  enabled?: boolean;
  onSuccess?: () => void;
  onError?: () => void;
}

export function useDocumentStatus({
  documentId,
  enabled = true,
  onSuccess,
  onError,
}: UseDocumentStatusOptions) {
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ['document', documentId],
    queryFn: async () => {
      const response = await documentsApi.getById(documentId);
      return response.data.document;
    },
    enabled: enabled && !!documentId,
    refetchInterval: (data) => {
      // Poll every 2 seconds while processing
      if (data?.status === DocumentStatus.PROCESSING || data?.status === DocumentStatus.PENDING) {
        return 2000;
      }
      // Stop polling when completed or failed
      return false;
    },
  });

  useEffect(() => {
    if (query.data?.status === DocumentStatus.COMPLETED) {
      toast({
        title: "Traitement terminé",
        description: "Le document a été analysé avec succès par l'IA",
      });
      onSuccess?.();
    } else if (query.data?.status === DocumentStatus.FAILED) {
      toast({
        title: "Erreur de traitement",
        description: "L'analyse du document a échoué. Veuillez réessayer.",
        variant: "destructive",
      });
      onError?.();
    }
  }, [query.data?.status, toast, onSuccess, onError]);

  return {
    document: query.data,
    isProcessing: query.data?.status === DocumentStatus.PROCESSING || query.data?.status === DocumentStatus.PENDING,
    isCompleted: query.data?.status === DocumentStatus.COMPLETED,
    isFailed: query.data?.status === DocumentStatus.FAILED,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}