import { useQuery } from "@tanstack/react-query";
import { getProducts, searchProducts, type Product } from "../sdk/firebase";
import { ALL_CATEGORY, QUERY_KEYS } from "../constants";

type UseProductsProps = {
  category: string;
  searchTerm: string;
};

export function useProducts({ category, searchTerm }: UseProductsProps) {
  return useQuery<Product[]>({
    queryKey: [QUERY_KEYS.PRODUCTS, category, searchTerm],
    queryFn: async () => {
      // 검색어가 있으면 검색 API 호출
      if (searchTerm.trim()) {
        return await searchProducts(searchTerm);
      }
      // 검색어가 없으면 일반 목록(카테고리 필터) 조회
      return await getProducts(category === ALL_CATEGORY ? undefined : category);
    },
    staleTime: 1000 * 60, // 1분간 캐시 유지
  });
}
