import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut, onAuthStateChanged, type User } from "firebase/auth";

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
    // If already logged in and opened as modal, close it
    if (user && onClose) {
      onClose();
    }
  }, [user, onClose]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMessage("로그아웃 되었습니다.");
    } catch (err) {
      console.error("Logout failed", err);
      setMessage("로그아웃 실패");
    }
  };

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
        `로그인 되었습니다: ${cred.user.displayName ?? cred.user.email}`
      );
      setPassword("");

      // If called as a modal, close modal; otherwise navigate to home
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

  if (user) {
    return (
      <section className="login" aria-label="login section">
        <div className="field">
          <span className="label">id :</span>
          <span className="input" aria-label="user-id">
            {user.displayName ?? user.email}
          </span>
        </div>

        <div className="actions">
          <button className="btn" onClick={handleLogout}>
            logout
          </button>
        </div>

        {message && <p className="login-message">{message}</p>}
      </section>
    );
  }

  return (
    <>
      <section className="login" aria-label="login section">
        <div className="field">
          <span className="label">id :</span>
          <input
            id="login-id"
            aria-label="id"
            className="input"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="Enter id"
          />
        </div>

        <div className="field">
          <span className="label">password :</span>
          <input
            id="login-password"
            aria-label="password"
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
        </div>

        <div className="actions">
          <button className="btn" onClick={handleLogin}>
            login
          </button>
        </div>

        {message && <p className="login-message">{message}</p>}
      </section>
    </>
  );
}
