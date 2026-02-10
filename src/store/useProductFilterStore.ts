import { create } from "zustand";
import { ALL_CATEGORY } from "../constants";

// Product 필터 상태 관리를 위한 Zustand 스토어
interface ProductFilterState {
  category: string;
  searchTerm: string;
  setCategory: (category: string) => void;
  setSearchTerm: (term: string) => void;
  resetFilters: () => void;
}

// 전역 Product 필터 상태 스토어 생성
export const useProductFilterStore = create<ProductFilterState>((set) => ({
  category: ALL_CATEGORY,
  searchTerm: "",
  setCategory: (category) => set({ category }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  resetFilters: () => set({ category: ALL_CATEGORY, searchTerm: "" }),
}));
