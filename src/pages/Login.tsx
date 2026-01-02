import { useState } from "react";
import { Link } from "react-router-dom";

import "../css/login.css";

export default function Login() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      if (!id || !password) {
        setMessage("Please enter both id and password.");
        return;
      }

      setMessage("로그인 중...");
      const { loginUser } = await import("../firebase");
      const cred = await loginUser(id, password);
      setMessage(`Logged in: ${cred.user.email}`);
      setPassword("");
      // TODO: set auth state in store / redirect as needed
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessage(msg || "로그인 실패");
    }
  };

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
          <Link to="/signup" className="btn ghost">
            회원가입
          </Link>
        </div>

        {message && <p className="login-message">{message}</p>}
      </section>
    </>
  );
}
