import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, getUserProfile, getProductsBySeller, getMyChats, getProduct, markChatAsRead, type Product, type ChatRoom, type UserProfile } from "../sdk/firebase";
import { useChatStore } from "../store/useChatStore";
import ProfileCard from "../components/MyPage/ProfileCard";
import ChatList from "../components/MyPage/ChatList";
import MyProductList from "../components/MyPage/MyProductList";
import "../css/myPage.css";

export default function MyPage() {
  const navigate = useNavigate();
  const { openChat: openChatModal } = useChatStore();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [myProducts, setMyProducts] = useState<Product[]>([]);

  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [chatPartners, setChatPartners] = useState<Record<string, string>>({});
  const [chatProducts, setChatProducts] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile || {});

          const products = await getProductsBySeller(user.uid);
          setMyProducts(products);

          const myChats = await getMyChats();
          setChats(myChats);

          const partners: Record<string, string> = {};
          const productNames: Record<string, string> = {};

          for (const chat of myChats) {
            const otherId = chat.participants.find((uid) => uid !== user.uid);
            if (otherId) {
              const p = await getUserProfile(otherId);

              partners[chat.id] = p?.nickname || "알 수 없는 사용자";
            }

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
    openChatModal(chatId, partnerName);

    await markChatAsRead(chatId);

    const myChats = await getMyChats();
    setChats(myChats);
  };

  if (loading) return <div className="loading">Loading...</div>;

  if (!auth.currentUser) {
    return (
      <div className="mypage-container">
        <h2>내 정보</h2>
        <div className="auth-required-content">
          <p className="auth-required-text">로그인이 필요한 서비스입니다.</p>
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
      <ProfileCard userProfile={userProfile} />

      <ChatList chats={chats} partners={chatPartners} productNames={chatProducts} currentUserId={auth.currentUser?.uid} onOpenChat={openChat} />

      <MyProductList products={myProducts} onProductClick={(id) => navigate(`/products/${id}`)} />
    </div>
  );
}
