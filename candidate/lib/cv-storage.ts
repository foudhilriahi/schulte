export interface StoredCVItem {
  id: string
  name: string
  type: 'uploaded' | 'generated'
  createdAt: string
  isDefault: boolean
  size?: number
  template?: 'modern' | 'classic'
  data?: any
  cvUrl?: string
}

const CV_STORAGE_PREFIX = 'candidate_cv'

const safeParse = <T>(value: string | null): T | null => {
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

const scopedKey = (suffix: string, userId?: string | null) => {
  return userId ? `${CV_STORAGE_PREFIX}:${userId}:${suffix}` : `${CV_STORAGE_PREFIX}:legacy:${suffix}`
}

export const getUserCVsKey = (userId?: string | null) => scopedKey('user_cvs', userId)
export const getLegacyCVsKey = () => 'user_cvs'
export const getUserLatestDraftKey = (userId?: string | null) => scopedKey('latest_cv_draft', userId)
export const getLegacyLatestDraftKey = () => 'latest_cv_draft'
export const getJobDraftKey = (jobId: string, userId?: string | null) => scopedKey(`draft_${jobId}`, userId)

export function loadStoredCVs(userId?: string | null): StoredCVItem[] {
  if (typeof window === 'undefined') return []

  const scoped = safeParse<StoredCVItem[]>(localStorage.getItem(getUserCVsKey(userId)))
  if (scoped?.length) return scoped

  const legacy = safeParse<StoredCVItem[]>(localStorage.getItem(getLegacyCVsKey()))
  if (legacy?.length) {
    localStorage.setItem(getUserCVsKey(userId), JSON.stringify(legacy))
    return legacy
  }

  return []
}

export function saveStoredCVs(userId: string | null | undefined, cvs: StoredCVItem[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(getUserCVsKey(userId), JSON.stringify(cvs))
}

export function loadLatestDraft<T = any>(userId?: string | null): T | null {
  if (typeof window === 'undefined') return null

  const scoped = safeParse<T>(localStorage.getItem(getUserLatestDraftKey(userId)))
  if (scoped) return scoped

  const legacy = safeParse<T>(localStorage.getItem(getLegacyLatestDraftKey()))
  if (legacy) {
    localStorage.setItem(getUserLatestDraftKey(userId), JSON.stringify(legacy))
    return legacy
  }

  return null
}

export function saveLatestDraft<T = any>(userId: string | null | undefined, draft: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(getUserLatestDraftKey(userId), JSON.stringify(draft))
}

export function loadJobDraft<T = any>(jobId: string, userId?: string | null): T | null {
  if (typeof window === 'undefined') return null

  const scoped = safeParse<T>(localStorage.getItem(getJobDraftKey(jobId, userId)))
  if (scoped) return scoped

  const legacy = safeParse<T>(localStorage.getItem(`draft_${jobId}`))
  if (legacy) {
    localStorage.setItem(getJobDraftKey(jobId, userId), JSON.stringify(legacy))
    return legacy
  }

  return null
}

export function saveJobDraft<T = any>(jobId: string, userId: string | null | undefined, draft: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(getJobDraftKey(jobId, userId), JSON.stringify(draft))
}

export function clearJobDraft(jobId: string, userId?: string | null): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(getJobDraftKey(jobId, userId))
  localStorage.removeItem(`draft_${jobId}`)
}