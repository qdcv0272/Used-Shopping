import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { getProducts, searchProducts, type Product } from "../firebase";
import { useProductFilterStore } from "../store/useProductFilterStore";
import "../css/home.css";

export default function Home() {
  const navigate = useNavigate();
  // 전역 상태: 실제 데이터 페칭에 사용될 필터 조건
  const { category, searchTerm: globalSearchTerm, setCategory, setSearchTerm: setGlobalSearchTerm } = useProductFilterStore();

  // 로컬 상태: 입력창의 UI 값 관리
  const [localSearchTerm, setLocalSearchTerm] = useState(globalSearchTerm);

  const [products, setProducts] = useState<Product[]>([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const categoryListRef = useRef<HTMLUListElement>(null);

  // 전역 상태가 변경되면 로컬 입력창도 동기화 (예: 다른 페이지에서 검색어 리셋 시)
  useEffect(() => {
    setLocalSearchTerm(globalSearchTerm);
  }, [globalSearchTerm]);

  useEffect(() => {
    console.log("Fetching products...", { category, globalSearchTerm });
    const fetchProducts = async () => {
      // 1. 검색어가 있으면 검색 수행
      if (globalSearchTerm.trim()) {
        const results = await searchProducts(globalSearchTerm);
        setProducts(results);
        return;
      }

      // 2. 검색어가 없으면 카테고리별 조회
      const data = await getProducts(category === "전체" ? undefined : category);
      setProducts(data);
    };
    fetchProducts();
  }, [category, globalSearchTerm]); // 전역 상태가 바뀔 때만 실행

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    // 검색 버튼 누르면 전역 상태 업데이트 -> useEffect 실행됨
    if (localSearchTerm.trim()) {
      setCategory("전체"); // 검색 시 카테고리 전체로 리셋
      setGlobalSearchTerm(localSearchTerm);
    } else {
      setGlobalSearchTerm(""); // 빈 검색어면 리셋
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
  }, [isCategoryOpen]); // 카테고리 열림/닫힘 애니메이션

  function toggleCategory() {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsCategoryOpen((prev) => !prev);
  }

  const categories = ["전체", "디지털기기", "생활가전", "가구/인테리어", "생활/주방", "유아동", "의류", "뷰티/미용", "취미/게임", "도서", "기타"];

  // useMemo 활용 예시: 상품 목록의 평균 가격 계산 (포트폴리오 포인트)
  const averagePrice = useMemo(() => {
    if (products.length === 0) return 0;
    const total = products.reduce((acc, curr) => acc + Number(curr.price), 0);
    return Math.floor(total / products.length);
  }, [products]);

  // useCallback 활용 예시: 이벤트 핸들러 메모이제이션 (포트폴리오 포인트)
  const handleItemClick = useCallback(
    (id: string) => {
      navigate(`/products/${id}`);
    },
    [navigate],
  );

  return (
    <main className="home-container">
      {/* 1. 검색 창 */}
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
        {/* 2. 카테고리 (사이드바) */}
        <aside className="category-sidebar">
          {/* 통계 위젯 추가 (useMemo 결과 보여주기) */}
          <div style={{ padding: "0 0 1rem 0", fontSize: "0.9rem", color: "#666" }}>
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
                  setGlobalSearchTerm(""); // 카테고리 클릭 시 검색어 초기화
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
