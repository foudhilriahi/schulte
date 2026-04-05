import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Application } from '@/lib/types';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';

export function useMyApplications() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery<Application[]>({
    queryKey: ['applications', 'mine'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await api.get('/applications/mine');
      return res.data;
    },
  });
}

export function useSubmitPDFApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { offerId: string; cvFile: File; coverNote?: string }) => {
      const formData = new FormData();
      formData.append('offerId', data.offerId);
      formData.append('cvFile', data.cvFile);
      if (data.coverNote) {
        formData.append('coverNote', data.coverNote);
      }

      const res = await api.post('/applications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Candidature envoyée avec succès !');
      queryClient.invalidateQueries({ queryKey: ['applications', 'mine'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'envoi de la candidature');
    },
  });
}

export function useSubmitFormApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { offerId: string; formData: any }) => {
      const res = await api.post('/applications/form', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Candidature envoyée avec succès !');
      queryClient.invalidateQueries({ queryKey: ['applications', 'mine'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'envoi de la candidature');
    },
  });
}

export function useSubmitSavedCVApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { offerId: string; cvId: string; coverNote?: string }) => {
      const res = await api.post('/applications/from-cv', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Candidature envoyee avec succes !');
      queryClient.invalidateQueries({ queryKey: ['applications', 'mine'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'envoi de la candidature');
    },
  });
}
