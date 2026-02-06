import type { Product } from "../../sdk/firebase";

type MyProductListProps = {
  products: Product[];
  onProductClick: (id: string) => void;
};

export default function MyProductList({ products, onProductClick }: MyProductListProps) {
  return (
    <div className="my-products-section">
      <h3>내 판매 상품 ({products.length})</h3>
      {products.length === 0 ? (
        <p className="no-products">등록된 상품이 없습니다.</p>
      ) : (
        <div className="my-product-list">
          {products.map((product) => (
            <div key={product.id} className="my-product-item" onClick={() => product.id && onProductClick(product.id)}>
              <div className="my-product-image">{product.images && product.images.length > 0 ? <img src={product.images[0]} alt={product.title} /> : <div className="no-image">📦</div>}</div>
              <div className="my-product-info">
                <div className="my-product-title">{product.title}</div>
                <div className="my-product-price">{product.price.toLocaleString()}원</div>
                <div className="my-product-date">{new Date(product.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
