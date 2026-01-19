import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import "../css/login.css";
import "../css/signup.css";

// [리팩토링] ㅠㅜㅍ
// 이 파일은 학습용으로 컴포넌트를 분리하기 전의 원본 형태를 재현한 파일입니다.
// 실제 프로젝트에서는 Signup.tsx를 사용하고 있으며, 중복되는 Input 로직을
// components/AuthInput.tsx로 분리하여 유지보수성을 높였습니다.

export default function SignupClone() {
  const [id, setId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [idError, setIdError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [idCheckMessage, setIdCheckMessage] = useState<string | null>(null);
  const [emailCheckMessage, setEmailCheckMessage] = useState<string | null>(
    null,
  );
  const [nicknameCheckMessage, setNicknameCheckMessage] = useState<
    string | null
  >(null);
  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState<string | null>(null);

  const navigate = useNavigate();

  const idRef = useRef<HTMLInputElement | null>(null);
  const nicknameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const confirmRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // 컴포넌트 마운트 시 아이디에 포커스
    idRef.current?.focus();
  }, []);

  const validateId = (value = id) => {
    if (!value) {
      setIdError("아이디를 입력하세요.");
      return false;
    }
    if (!/^[A-Za-z0-9]+$/.test(value)) {
      setIdError(
        "아이디는 영문/숫자만 가능합니다. 특수문자는 사용할 수 없습니다.",
      );
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
      setPasswordError(
        "비밀번호는 대문자·소문자·숫자·특수문자를 모두 포함해야 합니다.",
      );
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
    // TODO: 실제 서버 중복 체크 API 호출
    setIdCheckMessage("사용 가능한 아이디입니다.");
    setIsIdChecked(true);
    idRef.current?.blur();
  };

  const checkEmailDuplicate = () => {
    if (!validateEmail()) return;
    // TODO: 실제 서버 중복 체크 API 호출
    setEmailCheckMessage("사용 가능한 이메일입니다.");
    setIsEmailChecked(true);
    emailRef.current?.blur();
  };

  const checkNicknameDuplicate = () => {
    if (!validateNickname()) return;
    // TODO: 실제 서버 중복 체크 API 호출
    setNicknameCheckMessage("사용 가능한 닉네임입니다.");
    setIsNicknameChecked(true);
    nicknameRef.current?.blur();
  };

  const handleSignup = async () => {
    let finished = false;

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
    if (!isEmailChecked) {
      setEmailError("이메일 중복 확인을 해주세요.");
      emailRef.current?.focus();
      return;
    }

    try {
      setMessage(null);
      const validId = validateId();
      const validNickname = validateNickname();
      const validEmail = validateEmail();
      const validPassword = validatePassword();
      const validConfirm = validateConfirm();

      if (
        !validId ||
        !validNickname ||
        !validEmail ||
        !validPassword ||
        !validConfirm
      ) {
        setMessage("입력값을 확인하세요.");
        // 첫 번째 오류 필드로 포커스 이동
        if (!validId) {
          idRef.current?.focus();
        } else if (!validNickname) {
          nicknameRef.current?.focus();
        } else if (!validEmail) {
          emailRef.current?.focus();
        } else if (!validPassword) {
          passwordRef.current?.focus();
        } else {
          confirmRef.current?.focus();
        }
        return;
      }

      setIsSubmitting(true);
      setMessage("회원가입 중...");
      console.log("Signing up", { id });

      const succeed = (msg: string) => {
        if (finished) return;
        finished = true;
        console.log("Final message set:", msg);
        setMessage(msg);
        setTimeout(() => {
          navigate("/login");
        }, 3500);
      };

      const { registerUser } = await import("../firebase");
      const user = await registerUser(
        id,
        password,
        email || undefined,
        nickname,
        {
          displayName: nickname,
          id,
        },
      );

      try {
        const profileSaved =
          (user as { _profileSaved?: boolean } | null)?._profileSaved !== false;

        const shown = profileSaved ? (email && email.length ? email : id) : id;
        const finalMessage = profileSaved
          ? `회원가입 완료: ${shown}`
          : `회원가입 완료: ${shown} (프로필 저장 실패)`;

        setMessage(finalMessage);

        import("../utils/notify").then(({ showBrowserNotification }) => {
          showBrowserNotification("회원가입 완료", { body: finalMessage });
        });

        try {
          await signOut(auth);
        } catch (e) {
          console.warn("signOut after signup failed", e);
        }

        succeed(finalMessage);

        setTimeout(() => succeed(finalMessage), 4000);
      } catch (e) {
        console.error("Post-registration error", e);
        setMessage("회원가입 처리 중 내부 오류가 발생했습니다.");
      }
    } catch (err: unknown) {
      console.error("Signup error", err);

      const code = (err as { code?: string })?.code;
      const raw = err instanceof Error ? err.message : String(err);

      const mapped = (() => {
        if (code === "auth/email-already-in-use" || /EMAIL_EXISTS/i.test(raw))
          return "이미 사용 중인 이메일입니다.";
        if (code === "auth/invalid-email" || /INVALID_EMAIL/i.test(raw))
          return "유효하지 않은 이메일 형식입니다.";
        if (code === "auth/too-many-requests" || /TOO_MANY_ATTEMPTS/i.test(raw))
          return "시도 횟수가 많습니다. 잠시 후 다시 시도하세요.";
        if (code === "auth/operation-not-allowed")
          return "이메일/비밀번호 가입이 Firebase 콘솔에서 활성화되어 있지 않습니다.";
        if (code === "auth/weak-password")
          return "비밀번호가 약합니다. 더 긴 비밀번호를 사용하세요.";
        // ... (나머지 에러 매핑)
        return `${code ? `[${code}] ` : ""}${
          raw || "회원가입 중 오류가 발생했습니다."
        }`;
      })();

      setMessage(mapped);
    } finally {
      setIsSubmitting(false);
      if (!finished) {
        finished = true;
        setMessage(
          (prev) => prev || "회원가입 처리가 완료되었는지 확인해 주세요.",
        );
      }
    }
  };

  return (
    <div className="login signup">
      <div className="auth-card">
        <h2 id="signup-title" className="auth-title">
          회원가입
        </h2>
        <p className="auth-sub">간편하게 계정을 만들어보세요</p>

        {/* 1. 아이디 입력 필드 (AuthInputWithCheck 분해) */}
        <div className="field role-field">
          <span className="label">아이디</span>
          <div className="signup-input-group">
            <input
              id="signup-id"
              ref={idRef}
              className={`input signup-input-field ${idError ? "invalid" : ""} ${
                isIdChecked ? "checked" : ""
              }`}
              value={id}
              onChange={(e) => {
                setId(e.target.value);
                setIsIdChecked(false);
                setIdCheckMessage(null);
                if (idError) validateId();
              }}
              onBlur={() => validateId()}
              readOnly={isIdChecked}
              placeholder="사용할 아이디를 입력하세요"
            />
            <button
              type="button"
              className={`btn ghost duplicate-check-btn ${
                isIdChecked ? "checked" : ""
              }`}
              onClick={checkIdDuplicate}
              disabled={isIdChecked}
            >
              {isIdChecked ? "완료" : "중복확인"}
            </button>
          </div>
          {idError && <small className="error-text">{idError}</small>}
          {!idError && idCheckMessage && (
            <small className="success-text">{idCheckMessage}</small>
          )}
        </div>

        {/* 2. 닉네임 입력 필드 (AuthInputWithCheck 분해) */}
        <div className="field role-field">
          <span className="label">닉네임</span>
          <div className="signup-input-group">
            <input
              id="signup-nickname"
              ref={nicknameRef}
              className={`input signup-input-field ${
                nicknameError ? "invalid" : ""
              } ${isNicknameChecked ? "checked" : ""}`}
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setIsNicknameChecked(false);
                setNicknameCheckMessage(null);
                if (nicknameError) validateNickname();
              }}
              onBlur={() => validateNickname()}
              readOnly={isNicknameChecked}
              placeholder="사용할 닉네임을 입력하세요"
            />
            <button
              type="button"
              className={`btn ghost duplicate-check-btn ${
                isNicknameChecked ? "checked" : ""
              }`}
              onClick={checkNicknameDuplicate}
              disabled={isNicknameChecked}
            >
              {isNicknameChecked ? "완료" : "중복확인"}
            </button>
          </div>
          {nicknameError && (
            <small className="error-text">{nicknameError}</small>
          )}
          {!nicknameError && nicknameCheckMessage && (
            <small className="success-text">{nicknameCheckMessage}</small>
          )}
        </div>

        {/* 3. 이메일 입력 필드 (AuthInputWithCheck 분해) */}
        <div className="field role-field">
          <span className="label">이메일</span>
          <div className="signup-input-group">
            <input
              id="signup-email"
              ref={emailRef}
              className={`input signup-input-field ${
                emailError ? "invalid" : ""
              } ${isEmailChecked ? "checked" : ""}`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setIsEmailChecked(false);
                setEmailCheckMessage(null);
                if (emailError) validateEmail();
              }}
              onBlur={() => validateEmail()}
              readOnly={isEmailChecked}
              placeholder="비밀번호/아이디 찾기용 이메일을 입력하세요"
            />
            <button
              type="button"
              className={`btn ghost duplicate-check-btn ${
                isEmailChecked ? "checked" : ""
              }`}
              onClick={checkEmailDuplicate}
              disabled={isEmailChecked}
            >
              {isEmailChecked ? "완료" : "중복확인"}
            </button>
          </div>
          {emailError && <small className="error-text">{emailError}</small>}
          {!emailError && emailCheckMessage && (
            <small className="success-text">{emailCheckMessage}</small>
          )}
        </div>

        {/* 4. 비밀번호 입력 필드 (AuthInput 분해) */}
        <div className="field">
          <span className="label">비밀번호</span>
          <input
            id="signup-password"
            ref={passwordRef}
            type="password"
            className={`input ${passwordError ? "invalid" : ""}`}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) validatePassword();
              if (confirm) validateConfirm();
            }}
            onBlur={() => validatePassword()}
            placeholder="비밀번호를 입력하세요"
          />
          {passwordError && (
            <small className="error-text">{passwordError}</small>
          )}
          <small className="hint">영문·숫자 포함 6자 이상 권장</small>
        </div>

        {/* 5. 비밀번호 확인 입력 필드 (AuthInput 분해) */}
        <div className="field">
          <span className="label">비밀번호 확인</span>
          <input
            id="signup-confirm"
            ref={confirmRef}
            type="password"
            className={`input ${confirmError ? "invalid" : ""}`}
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              if (confirmError) validateConfirm();
            }}
            onBlur={() => validateConfirm()}
            placeholder="비밀번호를 다시 입력하세요"
          />
          {confirmError && <small className="error-text">{confirmError}</small>}
        </div>

        <div className="actions">
          <button
            className="btn"
            type="button"
            onClick={handleSignup}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span> 가입 중...
              </>
            ) : (
              "회원가입"
            )}
          </button>
          <button
            className="btn ghost"
            onClick={() => {
              navigate("/login");
            }}
            type="button"
            disabled={isSubmitting}
          >
            로그인으로
          </button>
        </div>

        {message && (
          <p
            className={`login-message ${
              /완료|가입 완료|회원가입 완료/.test(message) ? "success" : "error"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
