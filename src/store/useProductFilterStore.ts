import { create } from "zustand";

interface ProductFilterState {
  category: string;
  searchTerm: string;
  setCategory: (category: string) => void;
  setSearchTerm: (term: string) => void;
  resetFilters: () => void;
}

export const useProductFilterStore = create<ProductFilterState>((set) => ({
  category: "전체",
  searchTerm: "",
  setCategory: (category) => set({ category }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  resetFilters: () => set({ category: "전체", searchTerm: "" }),
}));
