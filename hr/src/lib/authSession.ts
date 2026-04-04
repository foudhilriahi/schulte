const ACCESS_TOKEN_KEY = 'hr_accessToken';
const USER_KEY = 'hr_user';

function hasSessionStorage(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
  } catch {
    return false;
  }
}

function getStorage(): Storage | null {
  if (hasSessionStorage()) return window.sessionStorage;
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') return window.localStorage;
  return null;
}

export const authSession = {
  getAccessToken(): string | null {
    const storage = getStorage();
    return storage?.getItem(ACCESS_TOKEN_KEY) || null;
  },

  setAccessToken(token: string): void {
    const storage = getStorage();
    storage?.setItem(ACCESS_TOKEN_KEY, token);
  },

  getUserRaw(): string | null {
    const storage = getStorage();
    return storage?.getItem(USER_KEY) || null;
  },

  setUserRaw(value: string): void {
    const storage = getStorage();
    storage?.setItem(USER_KEY, value);
  },

  clear(): void {
    const storage = getStorage();
    storage?.removeItem(ACCESS_TOKEN_KEY);
    storage?.removeItem(USER_KEY);

    // Cleanup legacy keys once to avoid stale role confusion.
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      window.localStorage.removeItem('accessToken');
      window.localStorage.removeItem('user');
    }
  },
};
