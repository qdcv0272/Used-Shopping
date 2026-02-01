import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProduct, getUserProfile, startChat, incrementView, type Product } from "../firebase";
import { useAuthStore } from "../store/useAuthStore";
import ChatModal from "../components/ChatModal";
import "../css/productDetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore(); // 전역 Auth Store 사용

  const [product, setProduct] = useState<Product | null>(null);
  const [sellerNickname, setSellerNickname] = useState("");
  const processedIdRef = useRef<string | null>(null);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState("");

  useEffect(() => {
    if (id) {
      // 이미 처리된 ID라면 조회수 증가 건너뜀 (Strict Mode 대응)
      if (processedIdRef.current !== id) {
        processedIdRef.current = id;
        incrementView(id).catch((err) => console.error("Failed to increment view", err));
      }

      // 상품 정보 가져오기
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
      // 채팅방 생성 또는 가져오기
      const chatId = await startChat(product.sellerId, product.id!);
      setCurrentChatId(chatId);
      setIsChatOpen(true);
    } catch (error) {
      console.error("Failed to start chat:", error);
      alert("채팅방을 열 수 없습니다.");
    }
  };

  if (!product) return <div style={{ color: "white", padding: "2rem" }}>Loading...</div>;

  return (
    <div className="product-detail-container">
      <div className="detail-layout">
        {/* 왼쪽 컬럼: 이미지 + 사용자 정보 */}
        <div className="left-column">
          <div className="detail-image-wrapper">{product.images && product.images.length > 0 ? <img src={product.images[0]} alt={product.title} /> : <span>상품 이미지</span>}</div>

          <div className="user-profile-section">
            <div className="user-avatar">👤</div>
            <div className="user-name">판매자 : {sellerNickname || product.sellerId}</div>
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
            <span className="detail-price">{product.price.toLocaleString()}원</span>
          </div>

          <hr className="detail-divider" />

          {/* 상품 설명 */}
          <div className="detail-description">{product.description}</div>

          <hr className="detail-divider" />

          {/* 조회수 */}
          <div className="detail-stats">
            <span>조회 {product.views}</span>
          </div>

          <hr className="detail-divider" />

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="chat-btn" onClick={handleChat}>
              채팅하기
            </button>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {isChatOpen && <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} chatId={currentChatId} sellerName={sellerNickname || "판매자"} />}
    </div>
  );
}
