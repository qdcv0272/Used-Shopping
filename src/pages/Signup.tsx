import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../sdk/firebase";
import { signOut } from "firebase/auth";
import "../css/login.css";
import "../css/signup.css";
import SignupForm from "../components/Signup/SignupForm";
import SignupActionButtons from "../components/Signup/SignupActionButtons";
import { useSignupFormState } from "../hooks/useSignupFormState";

export default function Signup() {
  const form = useSignupFormState();
  const {
    id,
    email,
    password,
    nickname,
    isIdChecked,
    isNicknameChecked,
    validateEmail,
    validatePassword,
    validateConfirm,
    setIdError,
    setNicknameError,
    refs: { idRef, nicknameRef, emailRef, passwordRef, confirmRef },
  } = form;

  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const navigate = useNavigate();

  const handleSendVerification = async () => {
    if (!isIdChecked) {
      setIdError("아이디 중복 확인을 해주세요.");
      idRef.current?.focus();
      return;
    }
    if (!isNicknameChecked) {
      setNicknameError("닉네임 중복 확인을 해주세요.");
      nicknameRef.current?.focus();
      return;
    }

    if (!validateEmail()) {
      emailRef.current?.focus();
      return;
    }
    if (!validatePassword()) {
      passwordRef.current?.focus();
      return;
    }
    if (!validateConfirm()) {
      confirmRef.current?.focus();
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage("인증 메일 발송 중...");

      const { createAuthUser } = await import("../sdk/firebase");
      await createAuthUser(email, password);

      setIsVerificationSent(true);
      setMessage("인증 메일이 발송되었습니다.\n메일함에서 인증 링크를 클릭한 후 아래 [인증 완료 확인] 버튼을 눌러주세요.");
    } catch (err: unknown) {
      console.error(err);
      const code = (err as { code?: string })?.code;
      const msg = (err as { message?: string })?.message || String(err);

      if (code === "auth/email-already-in-use") {
        setMessage("이미 사용 중인 이메일입니다.");
      } else {
        setMessage("메일 발송 실패: " + msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckVerification = async () => {
    try {
      setIsSubmitting(true);
      const { checkEmailVerified } = await import("../sdk/firebase");
      const verified = await checkEmailVerified();

      if (verified) {
        setIsVerified(true);
        setMessage("이메일 인증이 완료되었습니다. [회원가입 완료] 버튼을 눌러주세요.");
      } else {
        setMessage("이메일 인증이 확인되지 않았습니다. 메일의 링크를 클릭하셨나요?");
      }
    } catch (err: unknown) {
      console.error(err);
      setMessage("인증 확인 중 오류 발생");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalSignup = async () => {
    if (!isVerified) {
      setMessage("이메일 인증을 먼저 완료해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      const { saveUserProfile } = await import("../sdk/firebase");

      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("로그인된 사용자 정보가 없습니다.");

      await saveUserProfile(uid, id, email, nickname);

      setMessage("회원가입이 완료되었습니다. 로그인 화면으로 이동합니다.");
      await signOut(auth);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      setMessage("회원가입 마무리 중 오류: " + msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login signup">
      <div className="auth-card">
        <h2 id="signup-title" className="auth-title">
          회원가입
        </h2>
        <p className="auth-sub">간편하게 계정을 만들어보세요</p>

        <SignupForm form={form} />

        <SignupActionButtons
          isVerificationSent={isVerificationSent}
          isVerified={isVerified}
          isSubmitting={isSubmitting}
          onSendVerification={handleSendVerification}
          onCheckVerification={handleCheckVerification}
          onFinalSignup={handleFinalSignup}
          onCancel={() => navigate("/login")}
        />

        {message && <p className={`login-message ${/완료|가입 완료|회원가입 완료/.test(message || "") ? "success" : "error"}`}>{message}</p>}
      </div>
    </div>
  );
}
