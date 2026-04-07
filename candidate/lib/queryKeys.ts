export const candidateQueryKeys = {
  offers: ['candidate', 'offers'] as const,
  offer: (id: string) => ['candidate', 'offers', id] as const,
  applicationsMine: ['candidate', 'applications', 'mine'] as const,
  application: (id: string) => ['candidate', 'applications', id] as const,
  notifications: ['candidate', 'notifications'] as const,
  cvsMine: ['candidate', 'cvs', 'mine'] as const,
} as const
