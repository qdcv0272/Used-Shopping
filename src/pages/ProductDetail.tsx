import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProduct, type Product } from "../firebase";
import "../css/productDetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (id) {
      getProduct(id).then(setProduct);
    }
  }, [id]);

  if (!product)
    return <div style={{ color: "white", padding: "2rem" }}>Loading...</div>;

  return (
    <div className="product-detail-container">
      <div className="detail-layout">
        {/* 왼쪽 컬럼: 이미지 + 사용자 정보 */}
        <div className="left-column">
          <div className="detail-image-wrapper">
            {product.images && product.images.length > 0 ? (
              <img src={product.images[0]} alt={product.title} />
            ) : (
              <span>상품 이미지</span>
            )}
          </div>

          <div className="user-profile-section">
            <div className="user-avatar">👤</div>
            <div className="user-name">판매자 ({product.sellerId})</div>
          </div>
        </div>

        {/* 오른쪽 컬럼: 상품 정보 */}
        <div className="right-column">
          {/* 상품명 */}
          <h1 className="detail-product-title">{product.title}</h1>

          <hr className="detail-divider" />

          {/* 카테고리 & 가격 */}
          <div className="detail-meta-info">
            <span className="detail-category">{product.category}</span>
            <span style={{ color: "#ddd" }}>|</span>
            <span className="detail-price">
              {product.price.toLocaleString()}원
            </span>
          </div>

          <hr className="detail-divider" />

          {/* 상품 설명 */}
          <div className="detail-description">{product.description}</div>

          <hr className="detail-divider" />

          {/* 관심, 조회수 */}
          <div className="detail-stats">
            <span>관심 {product.likes}</span>
            <span>·</span>
            <span>조회 {product.views}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
