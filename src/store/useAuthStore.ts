import { create } from "zustand";
import { type User } from "firebase/auth";

interface AuthState {
  user: User | null;
  startAuthListener: boolean;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  startAuthListener: false,
  setUser: (user) => set({ user }),
}));
