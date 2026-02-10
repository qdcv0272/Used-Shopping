import { useState } from "react";
import Modal from "../Modal";
import { resetPassword } from "../../sdk/firebase";

type ChangePasswordModalProps = {
  email: string;
  onClose: () => void;
};

export default function ChangePasswordModal({ email, onClose }: ChangePasswordModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setMessage("새 비밀번호와 확인을 모두 입력해주세요.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      await resetPassword(email);
      setMessage("보안을 위해 비밀번호 변경은 이메일 인증이 필수입니다.\n가입하신 이메일로 재설정 링크를 전송했습니다.");

      setTimeout(() => {
        onClose();
      }, 4000);
    } catch (e) {
      console.error(e);
      setMessage("오류가 발생했습니다.");
    }
  };

  return (
    <Modal onClose={onClose} title="비밀번호 변경">
      <div className="login-form">
        <div className="form-group">
          <label>새 비밀번호</label>
          <input type="password" className="login-input" placeholder="새 비밀번호 입력" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </div>
        <div className="form-group">
          <label>새 비밀번호 확인</label>
          <input type="password" className="login-input" placeholder="새 비밀번호 확인" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>
        <button className="login-btn primary" onClick={handleChangePassword}>
          비밀번호 변경
        </button>

        {message && <div className={`modal-message ${message.includes("변경되었습니다") || message.includes("전송했습니다") ? "success" : "error"}`}>{message}</div>}
      </div>
    </Modal>
  );
}
