import { useState } from "react";
import Modal from "../Modal";
import { findUserIdByEmail } from "../../sdk/firebase";

type FindIdModalProps = {
  onClose: () => void;
};

export default function FindIdModal({ onClose }: FindIdModalProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleFindId = async () => {
    if (!email) {
      setMessage("이메일을 입력해주세요.");
      return;
    }
    try {
      const foundId = await findUserIdByEmail(email);
      if (foundId) {
        setMessage(`회원님의 아이디는 [ ${foundId} ] 입니다.`);
      } else {
        setMessage("해당 이메일로 가입된 아이디가 없습니다.");
      }
    } catch (e) {
      console.error(e);
      setMessage("오류가 발생했습니다.");
    }
  };

  return (
    <Modal onClose={onClose} title="아이디 찾기">
      <div className="login-form">
        <div className="form-group">
          <label>이메일</label>
          <input type="email" className="login-input" placeholder="가입했던 이메일 입력" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <button className="login-btn primary" onClick={handleFindId}>
          아이디 찾기
        </button>

        {message && (
          <div
            style={{
              marginTop: "15px",
              textAlign: "center",
              color: message.includes("아이디는") ? "green" : "red",
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
