import { useState } from "react";
import Modal from "../Modal";
import { verifyUser } from "../../sdk/firebase";

type FindPasswordModalProps = {
  onClose: () => void;
  onVerified: (id: string, email: string) => void;
};

export default function FindPasswordModal({ onClose, onVerified }: FindPasswordModalProps) {
  const [id, setId] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleFindPassword = async () => {
    if (!email || !id) {
      setMessage("아이디와 이메일을 모두 입력해주세요.");
      return;
    }
    try {
      const valid = await verifyUser(id, email);
      if (valid) {
        onVerified(id, email);
      } else {
        setMessage("일치하는 회원 정보가 없습니다.");
      }
    } catch (e) {
      console.error(e);
      setMessage("오류가 발생했습니다.");
    }
  };

  return (
    <Modal onClose={onClose} title="비밀번호 찾기">
      <div className="login-form">
        <div className="form-group">
          <label>아이디</label>
          <input type="text" className="login-input" placeholder="아이디 입력" value={id} onChange={(e) => setId(e.target.value)} />
        </div>
        <div className="form-group">
          <label>이메일</label>
          <input type="email" className="login-input" placeholder="가입했던 이메일 입력" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <button className="login-btn primary" onClick={handleFindPassword}>
          확인
        </button>

        {message && (
          <div
            style={{
              marginTop: "15px",
              textAlign: "center",
              color: "red",
              fontWeight: "bold",
              whiteSpace: "pre-wrap",
            }}
          >
            {message}
          </div>
        )}
      </div>
    </Modal>
  );
}
