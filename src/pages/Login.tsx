import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, type User } from "firebase/auth";

import "../css/login.css";

type LoginProps = {
  onClose?: () => void;
};

export default function Login({ onClose }: LoginProps) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
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
      const { loginUser } = await import("../firebase");
      const cred = await loginUser(id, password);

      // Success
      setMessage(
        `로그인 되었습니다: ${cred.user.displayName ?? cred.user.email}`,
      );
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

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">로그인</h2>
        <p className="login-subtitle">사과 중고 마켓에 오신 것을 환영합니다</p>

        <form
          className="login-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <div className="form-group">
            <label htmlFor="login-id">아이디</label>
            <input
              id="login-id"
              type="text"
              placeholder="아이디를 입력하세요"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="login-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">비밀번호</label>
            <input
              id="login-password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />
          </div>

          <button type="submit" className="login-btn primary">
            로그인
          </button>
        </form>

        <div className="login-footer">
          <p>
            계정이 없으신가요?{" "}
            <span className="link-text" onClick={() => navigate("/signup")}>
              회원가입
            </span>
          </p>
        </div>

        {message && <div className="login-message-box">{message}</div>}
      </div>
    </div>
  );
}
