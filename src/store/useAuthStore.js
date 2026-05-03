import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  init: () => {
    return onAuthStateChanged(auth, (user) => {
      set({ user, loading: false });
    });
  },
}));
