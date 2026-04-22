const USER_RUNTIME_CACHE_NAMES = [
  'apis',
  'pages',
  'pages-rsc',
  'pages-rsc-prefetch',
  'start-url',
  'cross-origin',
  'candidate-upload-assets',
]

const shouldClearCache = (cacheName: string) =>
  USER_RUNTIME_CACHE_NAMES.some(
    (name) => cacheName === name || cacheName.startsWith(`${name}-`),
  )

export async function clearUserRuntimeCaches(): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) return

  try {
    const cacheNames = await window.caches.keys()
    await Promise.all(
      cacheNames
        .filter(shouldClearCache)
        .map((cacheName) => window.caches.delete(cacheName)),
    )
  } catch (error) {
    console.warn('Unable to clear user runtime caches:', error)
  }
}
