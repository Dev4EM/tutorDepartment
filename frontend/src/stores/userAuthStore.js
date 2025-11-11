// src/stores/userAuthStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      message: null,

      login: ({ token, user, message }) => set({ token, user, message }),

      logout: () => set({ token: null, user: null, message: null }),
    }),
    {
      name: 'auth-storage', // key in localStorage
    }
  )
);

export default useUserAuthStore;
