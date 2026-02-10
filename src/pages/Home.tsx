import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useProductFilterStore } from "../store/useProductFilterStore";
import { useProducts } from "../hooks/useProducts";
import { ALL_CATEGORY } from "../constants";

import SearchInput from "../components/Home/SearchInput";
import CategorySidebar from "../components/Home/Layout/CategorySidebar";
import ProductList from "../components/Home/Layout/ProductList";

import "../css/home.css";

export default function Home() {
  const navigate = useNavigate();

  const { category, searchTerm: globalSearchTerm, setCategory, setSearchTerm: setGlobalSearchTerm } = useProductFilterStore();

  const [localSearchTerm, setLocalSearchTerm] = useState(globalSearchTerm);

  // 전역 검색어가 변경되면 로컬 검색어도 동기화
  useEffect(() => {
    setLocalSearchTerm(globalSearchTerm);
  }, [globalSearchTerm]);

  // React Query를 사용한 데이터 페칭
  const { data: products = [] } = useProducts({ category, searchTerm: globalSearchTerm });

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (localSearchTerm.trim()) {
      setCategory(ALL_CATEGORY);
      setGlobalSearchTerm(localSearchTerm);
    } else {
      setGlobalSearchTerm("");
    }
  };

  const averagePrice = useMemo(() => {
    if (products.length === 0) return 0;
    const total = products.reduce((acc, curr) => acc + Number(curr.price), 0);
    return Math.floor(total / products.length);
  }, [products]);

  const handleItemClick = useCallback(
    (id: string) => {
      navigate(`/products/${id}`);
    },
    [navigate],
  );

  return (
    <main className="home-container">
      {/* 검색 섹션 */}
      <div className="search-section">
        <SearchInput value={localSearchTerm} onChange={setLocalSearchTerm} onSubmit={handleSearch} />
      </div>

      {/* 메인 레이아웃 */}
      <div className="main-layout">
        {/* 카테고리 사이드바 */}
        <CategorySidebar averagePrice={averagePrice} />
        {/* 상품 리스트 */}
        <ProductList products={products} handleItemClick={handleItemClick} />
      </div>
    </main>
  );
}
