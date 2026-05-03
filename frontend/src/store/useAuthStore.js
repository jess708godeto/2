import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: async (email, password) => {
        const response = await api.post('/login', { email, password });
        set({ token: response.data.token, user: response.data.user });
      },
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
