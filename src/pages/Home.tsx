import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { getProducts, searchProducts, type Product } from "../sdk/firebase";
import { useProductFilterStore } from "../store/useProductFilterStore";
import "../css/home.css";

export default function Home() {
  const navigate = useNavigate();

  const { category, searchTerm: globalSearchTerm, setCategory, setSearchTerm: setGlobalSearchTerm } = useProductFilterStore();

  const [localSearchTerm, setLocalSearchTerm] = useState(globalSearchTerm);

  const [products, setProducts] = useState<Product[]>([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const categoryListRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setLocalSearchTerm(globalSearchTerm);
  }, [globalSearchTerm]);

  useEffect(() => {
    console.log("Fetching products...", { category, globalSearchTerm });
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

  useEffect(() => {
    if (categoryListRef.current) {
      if (isCategoryOpen) {
        gsap.to(categoryListRef.current, {
          height: "auto",
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
          display: "flex",
          onComplete: () => setIsAnimating(false),
        });
      } else {
        gsap.to(categoryListRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
          display: "none",
          onComplete: () => setIsAnimating(false),
        });
      }
    }
  }, [isCategoryOpen]);

  function toggleCategory() {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsCategoryOpen((prev) => !prev);
  }

  const categories = ["전체", "디지털기기", "생활가전", "가구/인테리어", "생활/주방", "유아동", "의류", "뷰티/미용", "취미/게임", "도서", "기타"];

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
      <div className="search-section">
        <form className="search-bar" onSubmit={handleSearch}>
          <button type="button" className="search-dropdown">
            중고거래
          </button>
          <input type="text" className="search-input" placeholder="검색어를 입력해주세요" value={localSearchTerm} onChange={(e) => setLocalSearchTerm(e.target.value)} />
          <button type="submit" className="search-btn" aria-label="검색">
            🔍
          </button>
        </form>
      </div>

      <div className="main-layout">
        <aside className="category-sidebar">
          <div className="average-price-widget">
            현재 목록 평균가: <strong>{averagePrice.toLocaleString()}원</strong>
          </div>

          <div className="category-header" onClick={toggleCategory}>
            <h3 className="category-title">카테고리</h3>
            <span className={`category-arrow ${isCategoryOpen ? "open" : ""}`}>▼</span>
          </div>
          <div className="category-divider"></div>

          <ul className={`category-list ${isAnimating || !isCategoryOpen ? "disabled" : ""}`} ref={categoryListRef}>
            {categories.map((cat) => (
              <li
                key={cat}
                className={`category-item ${category === cat ? "active" : ""}`}
                onClick={() => {
                  setCategory(cat);
                  setGlobalSearchTerm("");
                }}
              >
                {cat}
              </li>
            ))}
          </ul>
        </aside>

        <section className="product-section">
          <h2 className="section-title">오늘의 추천 매물</h2>
          <div className="product-grid">
            {products.map((item) => (
              <article key={item.id} className="product-card" onClick={() => item.id && handleItemClick(item.id)}>
                <div className="product-image">{item.images && item.images.length > 0 ? <img src={item.images[0]} alt={item.title} /> : "📦"}</div>
                <div className="product-info">
                  <h3 className="product-title">{item.title}</h3>
                  <div className="product-price">{item.price.toLocaleString()}원</div>
                  <div className="product-meta">{new Date(item.createdAt).toLocaleDateString()}</div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
