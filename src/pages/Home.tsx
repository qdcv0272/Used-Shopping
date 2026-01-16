import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import "../css/home.css";

export default function Home() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("전체");
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const categoryListRef = useRef<HTMLUListElement>(null);

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

  const toggleCategory = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsCategoryOpen((prev) => !prev);
  };

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

  // 샘플 데이터
  const items = Array.from({ length: 4 }).map((_, i) => ({
    id: i,
    title: `중고 아이템 샘플 ${i + 1}`,
    price: (i + 1) * 10000,
    region: "서울 강남구",
    time: "1시간 전",
  }));

  return (
    <main className="home-container">
      {/* 1. 검색 창 */}
      <div className="search-section">
        <div className="search-bar">
          <button className="search-dropdown">중고거래 ▼</button>
          <input
            type="text"
            className="search-input"
            placeholder="검색어를 입력해주세요"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-btn" aria-label="검색">
            🔍
          </button>
        </div>
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
                onClick={() => setCategory(cat)}
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
            {items.map((item) => (
              <article
                key={item.id}
                className="product-card"
                onClick={() => navigate(`/products/${item.id}`)}
              >
                <div className="product-image">📦</div>
                <div className="product-info">
                  <h3 className="product-title">{item.title}</h3>
                  <div className="product-price">
                    {item.price.toLocaleString()}원
                  </div>
                  <div className="product-meta">
                    {item.region} · {item.time}
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
