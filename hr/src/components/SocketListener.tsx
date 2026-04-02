import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { socketService } from '@/lib/socket';
import { useAuthStore } from '@/store/authStore';

export default function SocketListener() {
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    // Connect socket
    socketService.connect(token);
    socketRef.current = socketService.getSocket();

    if (!socketRef.current) return;

    // Application events
    socketRef.current.on('application:new', (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.info(`📋 Nouvelle candidature : ${data.candidateName || 'Candidat'}`);
    });

    socketRef.current.on('application:analysed', (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application', data.applicationId] });
      
      const scoreEmoji = data.score >= 70 ? '🎉' : data.score >= 50 ? '👍' : '📊';
      toast.success(`${scoreEmoji} Analyse IA terminée : ${data.score}/100 (${data.aiProvider})`);
    });

    socketRef.current.on('application:manual_analysis', (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application', data.applicationId] });
      
      toast.info(`🔄 Analyse IA mise à jour : ${data.score}/100`);
    });

    socketRef.current.on('application:analysis_failed', (data: any) => {
      toast.error(`❌ Échec de l'analyse IA : ${data.error}`);
    });

    // Interview events
    socketRef.current.on('interview:scheduled', (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast.success(`📅 Entretien planifié pour ${data.candidateName}`);
    });

    // Offer events
    socketRef.current.on('offer:closed', (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      toast.warning(`⏰ Offre fermée : ${data.title}`);
    });

    socketRef.current.on('offer:expiring', (data: any) => {
      toast.warning(`⚠️ Offre expire bientôt : ${data.title} (${data.hoursRemaining}h restantes)`);
    });

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.off('application:new');
        socketRef.current.off('application:analysed');
        socketRef.current.off('application:manual_analysis');
        socketRef.current.off('application:analysis_failed');
        socketRef.current.off('interview:scheduled');
        socketRef.current.off('offer:closed');
        socketRef.current.off('offer:expiring');
      }
    };
  }, [isAuthenticated, user, queryClient]);

  // Disconnect on unmount
  useEffect(() => {
    return () => {
      socketService.disconnect();
    };
  }, []);

  return null;
}