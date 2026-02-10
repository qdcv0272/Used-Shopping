import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/login.css";
import "../css/signup.css";
import SignupForm from "../components/Signup/SignupForm";
import SignupActionButtons from "../components/Signup/SignupActionButtons";
import { useSignupStore } from "@/store/useSignupStore";

export default function Signup() {
  const navigate = useNavigate();
  const reset = useSignupStore((s) => s.reset);
  const message = useSignupStore((s) => s.message);

  useEffect(() => {
    reset();
    return () => reset();
  }, [reset]);

  return (
    <div className="login signup">
      <div className="auth-card">
        <h2 id="signup-title" className="auth-title">
          회원가입
        </h2>
        <p className="auth-sub">간편하게 계정을 만들어보세요</p>

        <SignupForm />

        <SignupActionButtons onCancel={() => navigate("/login")} />

        {message && <p className={`login-message ${/완료|가입 완료|회원가입 완료/.test(message) ? "success" : "error"}`}>{message}</p>}
      </div>
    </div>
  );
}
