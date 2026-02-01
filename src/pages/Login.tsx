import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useForm } from "../hooks/useForm"; // 커스텀 훅 임포트

import "../css/login.css";

type LoginProps = {
  onClose?: () => void;
};

export default function Login({ onClose }: LoginProps) {
  // useForm 커스텀 훅 사용하여 폼 상태 관리
  // 포트폴리오 포인트: 반복되는 input 상태 관리를 커스텀 훅으로 분리하여 재사용성 높임
  const { values, handleChange, resetForm } = useForm({
    id: "",
    password: "",
  });
  const { id, password } = values;

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
      setMessage(`로그인 되었습니다: ${cred.user.displayName ?? cred.user.email}`);
      resetForm(); // 훅에서 제공하는 초기화 함수 사용

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
              name="id" // 식별자
              type="text"
              placeholder="아이디를 입력하세요"
              value={id}
              onChange={handleChange} // useForm 핸들러
              className="login-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">비밀번호</label>
            <input
              id="login-password"
              name="password" // 식별자
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={handleChange} // useForm 핸들러
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
