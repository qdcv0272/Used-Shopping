import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { useProductFilterStore } from "../../../store/useProductFilterStore";

type CategorySidebarProps = {
  averagePrice: number;
};

export default function CategorySidebar({ averagePrice }: CategorySidebarProps) {
  const { category, setCategory, setSearchTerm } = useProductFilterStore();

  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const categoryListRef = useRef<HTMLUListElement>(null);

  const categories = ["전체", "디지털기기", "생활가전", "가구/인테리어", "생활/주방", "유아동", "의류", "뷰티/미용", "취미/게임", "도서", "기타"];

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

  return (
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
              setSearchTerm("");
            }}
          >
            {cat}
          </li>
        ))}
      </ul>
    </aside>
  );
}
