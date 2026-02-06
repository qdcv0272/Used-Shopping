import { type Product } from "../../../sdk/firebase";

type ProductListProps = {
  products: Product[];
  handleItemClick: (id: string) => void;
};

export default function ProductList({ products, handleItemClick }: ProductListProps) {
  return (
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
  );
}
