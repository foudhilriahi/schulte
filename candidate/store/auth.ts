import { create } from 'zustand';
import { UserProfile } from '../lib/types';
import { api } from '../lib/axios';
import { storage, STORAGE_KEYS } from '../lib/storage';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (userData: UserProfile, token: string) => void;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Initially true while we check session
  error: null,

  login: (userData, token) => {
    // Validate role - only CANDIDATE allowed in candidate app
    if (userData.role !== 'CANDIDATE') {
      set({ 
        user: null, 
        isAuthenticated: false, 
        error: 'Access denied. This app is for candidates only.', 
        isLoading: false 
      });
      return;
    }
    
    storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    set({ user: userData, isAuthenticated: true, error: null, isLoading: false });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      storage.removeItem(STORAGE_KEYS.LEGACY_ACCESS_TOKEN);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      // The interceptor automatically handles tokens
      const token = storage.getItem<string>(STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) {
        storage.removeItem(STORAGE_KEYS.LEGACY_ACCESS_TOKEN);
        // If no token at all, probably not logged in
        set({ user: null, isAuthenticated: false, isLoading: false });
        // Attempt a silent refresh just in case we have a cookie but no local token
        try {
          const res = await api.post('/auth/refresh');
          const newToken = res.data.accessToken;
          storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newToken);
          // Try fetching user again
          const meRes = await api.get('/auth/me');
          
          // Validate role
          if (meRes.data.role !== 'CANDIDATE') {
            storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            storage.removeItem(STORAGE_KEYS.LEGACY_ACCESS_TOKEN);
            set({ 
              user: null, 
              isAuthenticated: false, 
              error: 'Access denied. This app is for candidates only.', 
              isLoading: false 
            });
            return;
          }
          
          set({ user: meRes.data, isAuthenticated: true, isLoading: false });
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
        return;
      }

      const res = await api.get('/auth/me');
      
      // Validate role - only CANDIDATE allowed
      if (res.data.role !== 'CANDIDATE') {
        storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        storage.removeItem(STORAGE_KEYS.LEGACY_ACCESS_TOKEN);
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: 'Access denied. This app is for candidates only.', 
          isLoading: false 
        });
        return;
      }
      
      set({ user: res.data, isAuthenticated: true, isLoading: false });
    } catch (err) {
      console.error('Fetch user error:', err);
      // Let the axios interceptor handle 401s
      set({ isLoading: false });
    }
  },

  setError: (error) => set({ error }),
}));
