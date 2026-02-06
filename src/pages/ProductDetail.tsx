import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { startChat } from "../sdk/firebase";
import { useProductDetail } from "../hooks/useProductDetail";
import { useAuthStore } from "../store/useAuthStore";
import ChatModal from "../components/ChatModal";
import DetailLeft from "../components/ProductDetail/DetailLeft";
import DetailRight from "../components/ProductDetail/DetailRight";
import "../css/productDetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { product, sellerNickname, loading } = useProductDetail(id);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState("");

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

  if (loading || !product) return <div className="detail-loading">Loading...</div>;

  return (
    <div className="product-detail-container">
      <div className="detail-layout">
        <DetailLeft product={product} sellerNickname={sellerNickname} />
        <DetailRight product={product} onChatClick={handleChat} />
      </div>

      {isChatOpen && <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} chatId={currentChatId} sellerName={sellerNickname || "판매자"} />}
    </div>
  );
}
