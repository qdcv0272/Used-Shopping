import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  auth,
  getUserProfile,
  getProductsBySeller,
  getMyChats,
  getProduct,
  markChatAsRead,
  type Product,
  type ChatRoom,
} from "../firebase";
import ChatModal from "../components/ChatModal";
import "../css/myPage.css";

export default function MyPage() {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [myProducts, setMyProducts] = useState<Product[]>([]);

  // Chat State
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [chatPartners, setChatPartners] = useState<Record<string, string>>({});
  const [chatProducts, setChatProducts] = useState<Record<string, string>>({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState("");
  const [currentChatName, setCurrentChatName] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile || {});

          const products = await getProductsBySeller(user.uid);
          setMyProducts(products);

          // 채팅 목록 가져오기
          const myChats = await getMyChats();
          setChats(myChats);

          // 채팅 상대방 닉네임 & 상품명 가져오기
          const partners: Record<string, string> = {};
          const productNames: Record<string, string> = {};

          for (const chat of myChats) {
            const otherId = chat.participants.find((uid) => uid !== user.uid);
            if (otherId) {
              const p = await getUserProfile(otherId);
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              partners[chat.id] = (p as any)?.nickname || "알 수 없는 사용자";
            }
            // 상품 정보 가져오기
            if (chat.productId) {
              const prod = await getProduct(chat.productId);
              if (prod) {
                productNames[chat.id] = prod.title;
              }
            }
          }
          setChatPartners(partners);
          setChatProducts(productNames);
        } catch (error) {
          console.error("Failed to fetch user profile or products:", error);
        }
      } else {
        setUserProfile(null);
        setMyProducts([]);
        setChats([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openChat = async (chatId: string, partnerName: string) => {
    setCurrentChatId(chatId);
    setCurrentChatName(partnerName);
    setIsChatOpen(true);
    // 채팅방 열 때 읽음 처리
    await markChatAsRead(chatId);
    // 목록 새로고침 (간단하게 구현)
    const myChats = await getMyChats();
    setChats(myChats);
  };

  if (loading) return <div className="loading">Loading...</div>;

  if (!auth.currentUser) {
    return (
      <div className="mypage-container">
        <h2>내 정보</h2>
        <div style={{ textAlign: "center", padding: "2rem 0" }}>
          <p style={{ marginBottom: "1rem" }}>로그인이 필요한 서비스입니다.</p>
          <button className="mypage-btn" onClick={() => navigate("/login")}>
            로그인 하러 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mypage-container">
      <h2>내 정보</h2>
      <div className="profile-card">
        <div className="profile-item">
          <span className="label">닉네임</span>
          <span className="value">
            {userProfile?.nickname || "설정되지 않음"}
          </span>
        </div>
        <div className="profile-item">
          <span className="label">아이디</span>
          <span className="value">
            {userProfile?.id || auth.currentUser.email?.split("@")[0]}
          </span>
        </div>
        <div className="profile-item">
          <span className="label">이메일</span>
          <span className="value">
            {userProfile?.email || auth.currentUser.email || "-"}
          </span>
        </div>
        <div className="profile-item">
          <span className="label">가입일</span>
          <span className="value">
            {userProfile?.createdAt
              ? new Date(userProfile.createdAt).toLocaleDateString()
              : "-"}
          </span>
        </div>
      </div>

      <div className="my-chats-section">
        <h3>내 채팅 목록 ({chats.length})</h3>
        {chats.length === 0 ? (
          <p className="no-chats">진행 중인 채팅이 없습니다.</p>
        ) : (
          <div className="chat-list">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className="chat-item"
                onClick={() => openChat(chat.id, chatPartners[chat.id])}
              >
                <div className="chat-avatar">
                  💬
                  {/* 안 읽은 메시지 배지 */}
                  {chat.unreadCounts &&
                    chat.unreadCounts[auth.currentUser?.uid || ""] > 0 && (
                      <span className="unread-badge">N</span>
                    )}
                </div>
                <div className="chat-info">
                  <div className="chat-partner">
                    <span className="label-text">판매자 닉네임 : </span>
                    {chatPartners[chat.id] || "로딩 중..."}
                  </div>
                  <div className="chat-product-row">
                    <span className="label-text">상품명 : </span>
                    {chatProducts[chat.id] || "상품 정보 없음"}
                  </div>
                </div>
                <div className="chat-meta">
                  {new Date(chat.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="my-products-section">
        <h3>내 판매 상품 ({myProducts.length})</h3>
        {myProducts.length === 0 ? (
          <p className="no-products">등록된 상품이 없습니다.</p>
        ) : (
          <div className="my-product-list">
            {myProducts.map((product) => (
              <div
                key={product.id}
                className="my-product-item"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <div className="my-product-image">
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.title} />
                  ) : (
                    <div className="no-image">📦</div>
                  )}
                </div>
                <div className="my-product-info">
                  <div className="my-product-title">{product.title}</div>
                  <div className="my-product-price">
                    {product.price.toLocaleString()}원
                  </div>
                  <div className="my-product-date">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Modal */}
      {isChatOpen && (
        <ChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          chatId={currentChatId}
          sellerName={currentChatName}
        />
      )}
    </div>
  );
}
