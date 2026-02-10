import { create } from "zustand";
import { type User } from "firebase/auth";

// Auth 상태 관리를 위한 Zustand 스토어
interface AuthState {
  user: User | null;
  startAuthListener: boolean;
  setUser: (user: User | null) => void;
}

// 전역 Auth 상태 스토어 생성
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  startAuthListener: false,
  setUser: (user) => set({ user }),
}));
