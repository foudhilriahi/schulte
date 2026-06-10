import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useSocket } from '@/hooks/useSocket';

export default function SocketListener() {
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  useEffect(() => {
    if (!isAuthenticated || !user || !socket) return;

    // Application events
    socket.on('application:new', (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.info(`Nouvelle candidature : ${data.candidateName || 'Candidat'}`);
    });

    socket.on('application:analysed', (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application', data.applicationId] });
      
      toast.success(`Analyse IA terminée : ${data.score}/100 (${data.aiProvider})`);
    });

    socket.on('application:manual_analysis', (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application', data.applicationId] });
      
      toast.info(`Analyse IA mise à jour : ${data.score}/100`);
    });

    socket.on('application:analysis_failed', (data: any) => {
      toast.error(`Échec de l'analyse IA : ${data.error}`);
    });

    // Interview events
    socket.on('interview:scheduled', (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast.success(`Entretien planifié pour ${data.candidateName}`);
    });

    socket.on('interview:outcome_updated', (_data: any) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    });

    // Offer events
    socket.on('offer:closed', (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      toast.warning(`Offre fermée : ${data.title}`);
    });

    socket.on('offer:expiring', (data: any) => {
      toast.warning(`Offre expire bientôt : ${data.title} (${data.hoursRemaining}h restantes)`);
    });

    // Cleanup
    return () => {
      socket.off('application:new');
      socket.off('application:analysed');
      socket.off('application:manual_analysis');
      socket.off('application:analysis_failed');
      socket.off('interview:scheduled');
      socket.off('interview:outcome_updated');
      socket.off('offer:closed');
      socket.off('offer:expiring');
    };
  }, [isAuthenticated, user, queryClient, socket]);

  return null;
}
