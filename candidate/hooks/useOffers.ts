import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { JobOffer } from '@/lib/types';

export function useOffers() {
  return useQuery<JobOffer[]>({
    queryKey: ['offers'],
    queryFn: async () => {
      const res = await api.get('/offers');
      return res.data;
    },
  });
}

export function useOffer(id: string) {
  return useQuery<JobOffer>({
    queryKey: ['offers', id],
    queryFn: async () => {
      const res = await api.get(`/offers/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}
