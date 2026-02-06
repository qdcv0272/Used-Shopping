import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, searchProducts, type Product } from "../sdk/firebase";
import { useProductFilterStore } from "../store/useProductFilterStore";

import SearchInput from "../components/Home/SearchInput";
import CategorySidebar from "../components/Home/Layout/CategorySidebar";
import ProductList from "../components/Home/Layout/ProductList";

import "../css/home.css";

export default function Home() {
  const navigate = useNavigate();

  const { category, searchTerm: globalSearchTerm, setCategory, setSearchTerm: setGlobalSearchTerm } = useProductFilterStore();

  const [localSearchTerm, setLocalSearchTerm] = useState(globalSearchTerm);

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setLocalSearchTerm(globalSearchTerm);
  }, [globalSearchTerm]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (globalSearchTerm.trim()) {
        const results = await searchProducts(globalSearchTerm);
        setProducts(results);
        return;
      }

      const data = await getProducts(category === "전체" ? undefined : category);
      setProducts(data);
    };
    fetchProducts();
  }, [category, globalSearchTerm]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (localSearchTerm.trim()) {
      setCategory("전체");
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
