import type { Product } from "../../sdk/firebase";

type DetailRightProps = {
  product: Product;
  onChatClick: () => void;
};

export default function DetailRight({ product, onChatClick }: DetailRightProps) {
  return (
    <div className="right-column">
      <h1 className="detail-product-title">{product.title}</h1>

      <hr className="detail-divider" />

      <div className="detail-meta-info">
        <span className="detail-category">{product.category}</span>
        <span className="detail-separator">|</span>
        <span className="detail-price">{product.price.toLocaleString()}원</span>
      </div>

      <hr className="detail-divider" />

      <div className="detail-description">{product.description}</div>

      <hr className="detail-divider" />

      <div className="detail-stats">
        <span>조회 {product.views}</span>
      </div>

      <hr className="detail-divider" />

      <div className="action-buttons">
        <button className="chat-btn" onClick={onChatClick}>
          채팅하기
        </button>
      </div>
    </div>
  );
}
