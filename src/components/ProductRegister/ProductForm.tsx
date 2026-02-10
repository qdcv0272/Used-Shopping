import { CATEGORIES } from "../../constants";
import { useProductRegisterStore } from "../../store/useProductRegisterStore";

export default function ProductForm() {
  const { title, setTitle, category, setCategory, description, setDescription, price, setPrice } = useProductRegisterStore();

  return (
    <>
      <div className="form-group">
        <label className="form-label">제목</label>
        <input type="text" className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력해주세요." />
      </div>

      <div className="form-group">
        <label className="form-label">카테고리</label>
        <div className="category-grid">
          {CATEGORIES.map((cat) => (
            <button key={cat} type="button" className={`category-item ${category === cat ? "active" : ""}`} onClick={() => setCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">자세한 설명</label>
        <textarea className="form-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder=""></textarea>
      </div>

      <div className="form-group">
        <label className="form-label">가격</label>
        <div className="price-group-header">
          <span className="sell-badge">판매하기</span>
        </div>
        <div className="price-input-wrapper">
          <span className="currency-symbol">₩</span>
          <input type="text" className="form-input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="가격을 입력해주세요." />
        </div>
      </div>
    </>
  );
}
