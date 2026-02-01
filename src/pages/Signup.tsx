import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../sdk/firebase";
import { signOut } from "firebase/auth";
import "../css/login.css";
import "../css/signup.css";
import { AuthInput, AuthInputWithCheck } from "../components/AuthInput";

export default function Signup() {
  const [id, setId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const [idError, setIdError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [nicknameError, setNicknameError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [idCheckMessage, setIdCheckMessage] = useState<string | null>(null);

  const [nickname, setNickname] = useState("");
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [nicknameCheckMessage, setNicknameCheckMessage] = useState<string | null>(null);

  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const navigate = useNavigate();

  const idRef = useRef<HTMLInputElement | null>(null);
  const nicknameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const confirmRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    idRef.current?.focus();
  }, []);

  const validateId = (value = id) => {
    if (!value) {
      setIdError("아이디를 입력하세요.");
      return false;
    }
    if (!/^[A-Za-z0-9]+$/.test(value)) {
      setIdError("아이디는 영문/숫자만 가능합니다. 특수문자는 사용할 수 없습니다.");
      return false;
    }
    const letters = (value.match(/[A-Za-z]/g) || []).length;
    if (letters < 4) {
      setIdError("영문 4자 이상 포함해야 합니다.");
      return false;
    }
    setIdError(null);
    return true;
  };

  const validateNickname = (value = nickname) => {
    if (!value) {
      setNicknameError("닉네임을 입력하세요.");
      return false;
    }
    if (value.length < 2) {
      setNicknameError("닉네임은 2자 이상이어야 합니다.");
      return false;
    }
    setNicknameError(null);
    return true;
  };

  const validateEmail = (value = email) => {
    if (!value) {
      setEmailError("이메일을 입력하세요.");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(value)) {
      setEmailError("유효한 이메일을 입력하세요.");
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePassword = (value = password) => {
    if (!value) {
      setPasswordError("비밀번호를 입력하세요.");
      return false;
    }
    if (value.length < 6) {
      setPasswordError("비밀번호는 최소 6자 이상이어야 합니다.");
      return false;
    }
    const hasLower = /[a-z]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasDigit = /\d/.test(value);
    const hasSpecial = /[^A-Za-z0-9]/.test(value);
    if (!(hasLower && hasUpper && hasDigit && hasSpecial)) {
      setPasswordError("비밀번호는 대문자·소문자·숫자·특수문자를 모두 포함해야 합니다.");
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const validateConfirm = (value = confirm) => {
    if (value !== password) {
      setConfirmError("비밀번호가 일치하지 않습니다.");
      return false;
    }
    setConfirmError(null);
    return true;
  };

  const checkIdDuplicate = () => {
    if (!validateId()) return;
    setIdCheckMessage("사용 가능한 아이디입니다.");
    setIsIdChecked(true);
    idRef.current?.blur();
  };

  const checkNicknameDuplicate = () => {
    if (!validateNickname()) return;
    setNicknameCheckMessage("사용 가능한 닉네임입니다.");
    setIsNicknameChecked(true);
    nicknameRef.current?.blur();
  };

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
      await createAuthUser(id, password, email);

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

        <AuthInputWithCheck
          label="아이디"
          id="signup-id"
          ref={idRef}
          value={id}
          onChange={(e) => {
            setId(e.target.value);
            setIsIdChecked(false);
            setIdCheckMessage(null);
            if (idError) validateId();
          }}
          onBlur={() => validateId()}
          placeholder="사용할 아이디를 입력하세요"
          error={idError}
          isChecked={isIdChecked}
          checkMessage={idCheckMessage}
          onCheck={checkIdDuplicate}
        />

        <AuthInputWithCheck
          label="닉네임"
          id="signup-nickname"
          ref={nicknameRef}
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value);
            setIsNicknameChecked(false);
            setNicknameCheckMessage(null);
            if (nicknameError) validateNickname();
          }}
          onBlur={() => validateNickname()}
          placeholder="사용할 닉네임을 입력하세요"
          error={nicknameError}
          isChecked={isNicknameChecked}
          checkMessage={nicknameCheckMessage}
          onCheck={checkNicknameDuplicate}
        />

        <AuthInput
          label="이메일"
          id="signup-email"
          ref={emailRef}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) validateEmail();
          }}
          onBlur={() => validateEmail()}
          placeholder="가입 후 인증이 필요하니 실제 이메일을 입력하세요"
          error={emailError}
        />

        <AuthInput
          label="비밀번호"
          id="signup-password"
          ref={passwordRef}
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (passwordError) validatePassword();
            if (confirm) validateConfirm();
          }}
          onBlur={() => validatePassword()}
          placeholder="비밀번호를 입력하세요"
          error={passwordError}
          hint="영문·숫자 포함 6자 이상 권장"
        />

        <AuthInput
          label="비밀번호 확인"
          id="signup-confirm"
          ref={confirmRef}
          type="password"
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            if (confirmError) validateConfirm();
          }}
          onBlur={() => validateConfirm()}
          placeholder="비밀번호를 다시 입력하세요"
          error={confirmError}
        />

        <div className="actions">
          {!isVerificationSent && !isVerified && (
            <button className="btn" type="button" onClick={handleSendVerification} disabled={isSubmitting}>
              {isSubmitting ? "처리 중..." : "인증 메일 발송"}
            </button>
          )}

          {isVerificationSent && !isVerified && (
            <div style={{ display: "flex", gap: "10px", width: "100%", flexDirection: "column" }}>
              <p style={{ fontSize: "14px", color: "green", textAlign: "center", margin: "5px 0" }}>인증 메일이 발송되었습니다.</p>
              <button className="btn" type="button" onClick={handleCheckVerification} disabled={isSubmitting}>
                인증 완료 확인
              </button>
              <button
                className="btn ghost"
                type="button"
                style={{ marginTop: "5px" }}
                onClick={async () => {
                  try {
                    const { sendEmailVerification } = await import("firebase/auth");
                    if (auth.currentUser) {
                      await sendEmailVerification(auth.currentUser);
                      alert("인증 메일이 재발송되었습니다. 스팸 메일함도 확인해주세요.");
                    } else {
                      alert("로그인된 사용자 정보가 없습니다. 새로고침 후 다시 시도해주세요.");
                    }
                  } catch (e: unknown) {
                    console.error(e);
                    const code = (e as { code?: string })?.code;
                    const msg = (e as { message?: string })?.message || String(e);

                    if (code === "auth/too-many-requests") {
                      alert("너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.");
                    } else {
                      alert("메일 발송 실패: " + msg);
                    }
                  }
                }}
              >
                인증 메일 재발송
              </button>
            </div>
          )}

          {isVerified && (
            <button className="btn" type="button" onClick={handleFinalSignup} disabled={isSubmitting}>
              회원가입 완료
            </button>
          )}

          <button className="btn ghost" type="button" onClick={() => navigate("/login")}>
            취소 / 로그인으로
          </button>
        </div>

        {message && <p className={`login-message ${/완료|가입 완료|회원가입 완료/.test(message || "") ? "success" : "error"}`}>{message}</p>}
      </div>
    </div>
  );
}
