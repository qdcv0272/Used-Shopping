import type { ChatRoom } from "../../sdk/firebase";

type ChatListProps = {
  chats: ChatRoom[];
  partners: Record<string, string>;
  productNames: Record<string, string>;
  currentUserId?: string;
  onOpenChat: (chatId: string, partnerName: string) => void;
};

export default function ChatList({ chats, partners, productNames, currentUserId, onOpenChat }: ChatListProps) {
  return (
    <div className="my-chats-section">
      <h3>내 채팅 목록 ({chats.length})</h3>
      {chats.length === 0 ? (
        <p className="no-chats">진행 중인 채팅이 없습니다.</p>
      ) : (
        <div className="chat-list">
          {chats.map((chat) => (
            <div key={chat.id} className="chat-item" onClick={() => onOpenChat(chat.id, partners[chat.id])}>
              <div className="chat-avatar">
                💬
                {chat.unreadCounts && chat.unreadCounts[currentUserId || ""] > 0 && <span className="unread-badge">N</span>}
              </div>
              <div className="chat-info">
                <div className="chat-partner">
                  <span className="label-text">판매자 닉네임 : </span>
                  {partners[chat.id] || "로딩 중..."}
                </div>
                <div className="chat-product-row">
                  <span className="label-text">상품명 : </span>
                  {productNames[chat.id] || "상품 정보 없음"}
                </div>
              </div>
              <div className="chat-meta">{new Date(chat.updatedAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
