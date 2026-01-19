import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { getProducts, searchProducts, type Product } from "../firebase";
import "../css/home.css";

export default function Home() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("전체");
  const [products, setProducts] = useState<Product[]>([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const categoryListRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    console.log("카테고리 변경 함");
    const fetchProducts = async () => {
      if (searchTerm) return;

      const data = await getProducts(
        category === "전체" ? undefined : category,
      );
      setProducts(data);
    };
    fetchProducts();
  }, [category]); // 카테고리 변경 시마다 실행

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchTerm.trim()) {
      const data = await getProducts(
        category === "전체" ? undefined : category,
      );
      setProducts(data);
      return;
    }

    setCategory("전체");
    const results = await searchProducts(searchTerm);
    setProducts(results);
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
  }, [isCategoryOpen]); // 카테고리 열림/닫힘 애니메이션

  function toggleCategory() {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsCategoryOpen((prev) => !prev);
  }

  const categories = [
    "전체",
    "디지털기기",
    "생활가전",
    "가구/인테리어",
    "생활/주방",
    "유아동",
    "의류",
    "뷰티/미용",
    "취미/게임",
    "도서",
    "기타",
  ];

  return (
    <main className="home-container">
      {/* 1. 검색 창 */}
      <div className="search-section">
        <form className="search-bar" onSubmit={handleSearch}>
          <button type="button" className="search-dropdown">
            중고거래
          </button>
          <input
            type="text"
            className="search-input"
            placeholder="검색어를 입력해주세요"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="search-btn" aria-label="검색">
            🔍
          </button>
        </form>
      </div>

      <div className="main-layout">
        {/* 2. 카테고리 (사이드바) */}
        <aside className="category-sidebar">
          <div className="category-header" onClick={toggleCategory}>
            <h3 className="category-title">카테고리</h3>
            <span className={`category-arrow ${isCategoryOpen ? "open" : ""}`}>
              ▼
            </span>
          </div>
          <div className="category-divider"></div>

          <ul
            className={`category-list ${
              isAnimating || !isCategoryOpen ? "disabled" : ""
            }`}
            ref={categoryListRef}
          >
            {categories.map((cat) => (
              <li
                key={cat}
                className={`category-item ${category === cat ? "active" : ""}`}
                onClick={() => {
                  setCategory(cat);
                  setSearchTerm("");
                }}
              >
                {cat}
              </li>
            ))}
          </ul>
        </aside>

        {/* 3. 메인 중고 상품 */}
        <section className="product-section">
          <h2 className="section-title">오늘의 추천 매물</h2>
          <div className="product-grid">
            {products.map((item) => (
              <article
                key={item.id}
                className="product-card"
                onClick={() => navigate(`/products/${item.id}`)}
              >
                <div className="product-image">
                  {item.images && item.images.length > 0 ? (
                    <img src={item.images[0]} alt={item.title} />
                  ) : (
                    "📦"
                  )}
                </div>
                <div className="product-info">
                  <h3 className="product-title">{item.title}</h3>
                  <div className="product-price">
                    {item.price.toLocaleString()}원
                  </div>
                  <div className="product-meta">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
