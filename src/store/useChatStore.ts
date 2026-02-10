import { create } from "zustand";

// Chat 모달 상태 관리를 위한 Zustand 스토어
interface ChatStore {
  isOpen: boolean;
  chatId: string | null;
  partnerName: string | null;
  openChat: (chatId: string, partnerName: string) => void;
  closeChat: () => void;
}

// 전역 Chat 상태 스토어 생성
export const useChatStore = create<ChatStore>((set) => ({
  isOpen: false,
  chatId: null,
  partnerName: null,
  openChat: (chatId, partnerName) => set({ isOpen: true, chatId, partnerName }),
  closeChat: () => set({ isOpen: false, chatId: null, partnerName: null }),
}));
