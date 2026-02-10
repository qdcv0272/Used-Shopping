import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../sdk/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { loginUser } from "../sdk/firebase";
import LoginForm from "../components/Login/LoginForm";
import FindIdModal from "../components/Login/FindIdModal";
import FindPasswordModal from "../components/Login/FindPasswordModal";
import ChangePasswordModal from "../components/Login/ChangePasswordModal";

import "../css/login.css";

type LoginProps = {
  onClose?: () => void;
};

export default function Login({ onClose }: LoginProps) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<"NONE" | "FIND_ID" | "FIND_PW" | "CHANGE_PW">("NONE");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (user && onClose) {
      onClose();
    }
  }, [user, onClose]);

  const handleLogin = async () => {
    try {
      if (!id || !password) {
        setMessage("id와 비밀번호를 입력해 주세요.");
        return;
      }

      setMessage("로그인 중...");
      const cred = await loginUser(id, password);

      setMessage(`로그인 되었습니다: ${cred.user.displayName ?? cred.user.email}`);
      setId("");
      setPassword("");

      if (onClose) {
        onClose();
      } else {
        navigate("/");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessage(msg || "로그인 실패");
    }
  };

  const handlePasswordVerified = (_userId: string, email: string) => {
    setVerifiedEmail(email);
    setModalMode("CHANGE_PW");
  };

  const handleCloseModal = () => {
    setModalMode("NONE");
    setVerifiedEmail("");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <LoginForm
          id={id}
          password={password}
          message={message}
          onIdChange={setId}
          onPasswordChange={setPassword}
          onSubmit={handleLogin}
          onFindIdClick={() => setModalMode("FIND_ID")}
          onFindPasswordClick={() => setModalMode("FIND_PW")}
        />

        {modalMode === "FIND_ID" && <FindIdModal onClose={handleCloseModal} />}

        {modalMode === "FIND_PW" && <FindPasswordModal onClose={handleCloseModal} onVerified={handlePasswordVerified} />}

        {modalMode === "CHANGE_PW" && <ChangePasswordModal email={verifiedEmail} onClose={handleCloseModal} />}
      </div>
    </div>
  );
}
