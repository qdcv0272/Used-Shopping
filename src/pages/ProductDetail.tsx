import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProduct, getUserProfile, startChat, incrementView, type Product } from "../sdk/firebase";
import { useAuthStore } from "../store/useAuthStore";
import ChatModal from "../components/ChatModal";
import "../css/productDetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [sellerNickname, setSellerNickname] = useState("");
  const processedIdRef = useRef<string | null>(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState("");

  useEffect(() => {
    if (id) {
      if (processedIdRef.current !== id) {
        processedIdRef.current = id;
        incrementView(id).catch((err) => console.error("Failed to increment view", err));
      }

      getProduct(id).then((data) => {
        setProduct(data);
      });
    }
  }, [id]);

  useEffect(() => {
    if (product?.sellerId) {
      getUserProfile(product.sellerId).then((profile) => {
        if (profile && profile.nickname) {
          setSellerNickname(profile.nickname as string);
        }
      });
    }
  }, [product]);

  const handleChat = async () => {
    if (!product) return;

    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }
    if (user.uid === product.sellerId) {
      alert("본인의 상품에는 채팅할 수 없습니다.");
      return;
    }

    try {
      const chatId = await startChat(product.sellerId, product.id!);
      setCurrentChatId(chatId);
      setIsChatOpen(true);
    } catch (error) {
      console.error("Failed to start chat:", error);
      alert("채팅방을 열 수 없습니다.");
    }
  };

  if (!product) return <div className="detail-loading">Loading...</div>;

  return (
    <div className="product-detail-container">
      <div className="detail-layout">
        <div className="left-column">
          <div className="detail-image-wrapper">{product.images && product.images.length > 0 ? <img src={product.images[0]} alt={product.title} /> : <span>상품 이미지</span>}</div>

          <div className="user-profile-section">
            <div className="user-avatar">👤</div>
            <div className="user-name">판매자 : {sellerNickname || product.sellerId}</div>
          </div>
        </div>

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
            <button className="chat-btn" onClick={handleChat}>
              채팅하기
            </button>
          </div>
        </div>
      </div>

      {isChatOpen && <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} chatId={currentChatId} sellerName={sellerNickname || "판매자"} />}
    </div>
  );
}
