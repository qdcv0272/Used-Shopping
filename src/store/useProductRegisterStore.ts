import { create } from "zustand";

// Product 등록 상태 관리를 위한 Zustand 스토어
interface ProductRegisterState {
  title: string;
  category: string;
  description: string;
  price: string;
  images: File[];
  setTitle: (title: string) => void;
  setCategory: (category: string) => void;
  setDescription: (description: string) => void;
  setPrice: (price: string) => void;
  setImages: (images: File[] | ((prev: File[]) => File[])) => void;
  resetForm: () => void;
}

// 전역 Product 등록 상태 스토어 생성
export const useProductRegisterStore = create<ProductRegisterState>((set) => ({
  title: "",
  category: "",
  description: "",
  price: "",
  images: [],
  setTitle: (title) => set({ title }),
  setCategory: (category) => set({ category }),
  setDescription: (description) => set({ description }),
  setPrice: (price) => set({ price }),
  setImages: (imagesOrUpdater) =>
    set((state) => {
      const newImages = typeof imagesOrUpdater === "function" ? imagesOrUpdater(state.images) : imagesOrUpdater;
      return { images: newImages };
    }),
  resetForm: () => set({ title: "", category: "", description: "", price: "", images: [] }),
}));
