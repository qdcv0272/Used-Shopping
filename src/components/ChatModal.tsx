import { useEffect, useState, useRef } from "react";
import { sendMessage, subscribeToMessages, type ChatMessage } from "../sdk/firebase";
import { useAuthStore } from "../store/useAuthStore";
import "../css/chatModal.css";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  sellerName: string;
}

export default function ChatModal({ isOpen, onClose, chatId, sellerName }: ChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore(); // 전역 Auth state 사용

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // 채팅방 메시지 구독
  useEffect(() => {
    if (!isOpen || !chatId) return;

    const unsubscribe = subscribeToMessages(chatId, (msgs) => {
      setMessages(msgs);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [isOpen, chatId]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendMessage(chatId, newMessage);
      setNewMessage("");
      scrollToBottom();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="chat-header">
          <h3>{sellerName}님과의 대화</h3>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((msg) => {
            const isMyMessage = msg.senderId === user?.uid;
            return (
              <div key={msg.id} className={`message-bubble ${isMyMessage ? "my-message" : "other-message"}`}>
                <div>{msg.text}</div>
                <div className="message-time">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleSend}>
          <input type="text" placeholder="메시지를 입력하세요..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
          <button type="submit" disabled={!newMessage.trim()}>
            전송
          </button>
        </form>
      </div>
    </div>
  );
}
