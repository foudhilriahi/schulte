import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { JobOffer } from '@/lib/types';
import { candidateQueryKeys } from '@/lib/queryKeys';

export function useOffers() {
  return useQuery<JobOffer[]>({
    queryKey: candidateQueryKeys.offers,
    staleTime: 60 * 1000,
    queryFn: async () => {
      const res = await api.get('/offers');
      return res.data;
    },
  });
}

export function useOffer(id: string) {
  return useQuery<JobOffer>({
    queryKey: candidateQueryKeys.offer(id),
    staleTime: 120 * 1000,
    queryFn: async () => {
      const res = await api.get(`/offers/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}
