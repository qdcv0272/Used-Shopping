import type { Product } from "../../sdk/firebase";

type DetailLeftProps = {
  product: Product;
  sellerNickname: string;
};

export default function DetailLeft({ product, sellerNickname }: DetailLeftProps) {
  return (
    <div className="left-column">
      <div className="detail-image-wrapper">{product.images && product.images.length > 0 ? <img src={product.images[0]} alt={product.title} /> : <span>상품 이미지</span>}</div>

      <div className="user-profile-section">
        <div className="user-avatar">👤</div>
        <div className="user-name">판매자 : {sellerNickname || product.sellerId}</div>
      </div>
    </div>
  );
}
