import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Application } from '@/lib/types';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';
import { candidateQueryKeys } from '@/lib/queryKeys';

const makeIdempotencyKey = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export function useMyApplications() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery<Application[]>({
    queryKey: candidateQueryKeys.applicationsMine,
    staleTime: 30 * 1000,
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
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Idempotency-Key': makeIdempotencyKey(),
        },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Candidature envoyée avec succès !');
      queryClient.invalidateQueries({ queryKey: candidateQueryKeys.applicationsMine });
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
      const res = await api.post('/applications/form', data, {
        headers: {
          'X-Idempotency-Key': makeIdempotencyKey(),
        },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Candidature envoyée avec succès !');
      queryClient.invalidateQueries({ queryKey: candidateQueryKeys.applicationsMine });
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
      const res = await api.post('/applications/from-cv', data, {
        headers: {
          'X-Idempotency-Key': makeIdempotencyKey(),
        },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Candidature envoyee avec succes !');
      queryClient.invalidateQueries({ queryKey: candidateQueryKeys.applicationsMine });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'envoi de la candidature');
    },
  });
}
