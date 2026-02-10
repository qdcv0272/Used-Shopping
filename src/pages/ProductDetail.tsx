import { useNavigate, useParams } from "react-router-dom";
import { startChat } from "../sdk/firebase";
import { useProductDetail } from "../hooks/useProductDetail";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import DetailLeft from "../components/ProductDetail/DetailLeft";
import DetailRight from "../components/ProductDetail/DetailRight";
import "../css/productDetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { openChat } = useChatStore();

  const { product, sellerNickname, loading } = useProductDetail(id);

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
      openChat(chatId, sellerNickname || "판매자");
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
    </div>
  );
}
