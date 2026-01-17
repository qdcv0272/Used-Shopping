import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import "../css/login.css";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [idCheckMessage, setIdCheckMessage] = useState<string | null>(null);
  const [emailCheckMessage, setEmailCheckMessage] = useState<string | null>(
    null
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
    // 이미 체크된 상태에서 수정 불가능하므로 유효성 검사 패스 처리 가능하지만,
    // 로직상 유지.
    if (!value) {
      setIdError("아이디를 입력하세요.");
      return false;
    }
    if (!/^[A-Za-z0-9]+$/.test(value)) {
      setIdError(
        "아이디는 영문/숫자만 가능합니다. 특수문자는 사용할 수 없습니다."
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
        "비밀번호는 대문자·소문자·숫자·특수문자를 모두 포함해야 합니다."
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
    // try/catch/finally에서 ReferenceError와 UI 정체를 방지하기 위해 완료 플래그를 추적합니다.
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
      // run validation helpers (regex-based, inline errors)
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
          idRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        } else if (!validNickname) {
          nicknameRef.current?.focus();
          nicknameRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        } else if (!validEmail) {
          emailRef.current?.focus();
          emailRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        } else if (!validPassword) {
          passwordRef.current?.focus();
          passwordRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        } else {
          confirmRef.current?.focus();
          confirmRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
        return;
      }

      setIsSubmitting(true);
      setMessage("회원가입 중...");
      console.log("Signing up", { id });
      const succeed = (msg: string) => {
        if (finished) return;
        finished = true;
        // 디버그: 최종 메시지와 네비게이션 타이밍을 명확히 로그에 남깁니다.
        console.log("Final message set:", msg);
        setMessage(msg);
        setTimeout(() => {
          console.log("Navigating to /login after success");
          navigate("/login");
        }, 3500); // 메시지가 보일 충분한 시간 확보
      };
      // `fail` helper removed — 실패는 catch에서 직접 처리합니다.

      const { registerUser } = await import("../firebase");
      const user = await registerUser(
        id,
        password,
        email || undefined,
        nickname,
        {
          displayName: nickname,
          id,
        }
      );
      console.log("registerUser resolved", {
        uid: user?.uid,
        email: user?.email,
        profileSaved: (user as { _profileSaved?: boolean } | null)
          ?._profileSaved,
      });

      // post-registration 단계가 예기치 않게 실패하는지 확인하기 위해 안전하게 감싼다.
      try {
        // 표시용으로는 제공한 이메일을 우선 사용하고 없으면 id를 사용합니다.
        const profileSaved =
          (user as { _profileSaved?: boolean } | null)?._profileSaved !== false;
        console.log("Profile saved flag:", profileSaved);

        const shown = profileSaved ? (email && email.length ? email : id) : id;
        const finalMessage = profileSaved
          ? `회원가입 완료: ${shown}`
          : `회원가입 완료: ${shown} (프로필 저장 실패)`;

        // 즉시 메시지 설정 후 성공 처리 — 컴포넌트가 언마운트 되지 않는 한 메시지가 보입니다.
        setMessage(finalMessage);
        console.log("Signup success message set", { finalMessage });
        // 브라우저 알림 요청/표시 (권한이 있으면 데스크톱 알림)
        import("../utils/notify").then(({ showBrowserNotification }) => {
          showBrowserNotification("회원가입 완료", { body: finalMessage });
        });

        // Prevent automatic login after creating the account: sign out the newly created auth session
        try {
          await signOut(auth);
        } catch (e) {
          console.warn("signOut after signup failed", e);
        }

        succeed(finalMessage);

        // 혹시 렌더링이 지연되거나 상태가 덮어쓰이는 경우 대비한 보강 타이머
        setTimeout(() => succeed(finalMessage), 4000);
      } catch (e) {
        console.error("Post-registration error", e);
        setMessage("회원가입 처리 중 내부 오류가 발생했습니다.");
      }
    } catch (err: unknown) {
      console.error("Signup error", err);

      // FirebaseError에는 `code`가 있으므로 우선 코드로 매핑합니다.
      const code = (err as { code?: string })?.code;
      const raw = err instanceof Error ? err.message : String(err);
      console.error("Signup error details", { code, raw, err });

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
        if (code === "auth/invalid-api-key")
          return "Firebase API 키가 유효하지 않습니다. 환경 변수(VITE_FIREBASE_*)를 확인하세요.";

        // 기본: 코드가 있으면 코드를 접두사로, 아니면 원문 메시지를 사용
        return `${code ? `[${code}] ` : ""}${
          raw || "회원가입 중 오류가 발생했습니다."
        }`;
      })();

      setMessage(mapped);
      console.log("Signup failed", { code, raw: mapped });
    } finally {
      // 항상 제출 상태 해제
      setIsSubmitting(false);
      // 최종 안전장치: 예기치 않게 finished가 false인 채로 남지 않도록 함
      if (!finished) {
        console.log(
          "Signup flow finished without succeed/fail flag; ensuring message is visible"
        );
        finished = true;
        setMessage(
          (prev) => prev || "회원가입 처리가 완료되었는지 확인해 주세요."
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

        <div className="field role-field">
          <span className="label">아이디</span>
          <div
            style={{
              flex: 1,
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <input
              id="signup-id"
              ref={idRef}
              className={`input ${idError ? "invalid" : ""}`}
              value={id}
              onChange={(e) => {
                setId(e.target.value);
                setIsIdChecked(false); // 수정하면 체크 상태 초기화
                setIdCheckMessage(null); // 메시지 초기화
                if (idError) validateId();
              }}
              onBlur={() => validateId()}
              readOnly={isIdChecked}
              placeholder="사용할 아이디를 입력하세요"
              style={{
                flex: 1,
                backgroundColor: isIdChecked ? "#f0f0f0" : "white",
              }}
            />
            <button
              type="button"
              className="btn ghost"
              onClick={checkIdDuplicate}
              disabled={isIdChecked}
              style={{
                fontSize: "0.8rem",
                padding: "6px 8px",
                whiteSpace: "nowrap",
                backgroundColor: isIdChecked ? "#eee" : "transparent",
                cursor: isIdChecked ? "default" : "pointer",
                color: isIdChecked ? "#888" : "inherit",
                borderColor: isIdChecked ? "#ddd" : "#ddd",
              }}
            >
              {isIdChecked ? "완료" : "중복확인"}
            </button>
          </div>
          {!idError && idCheckMessage && (
            <small
              className="success-text"
              style={{ color: "green", fontSize: "0.85rem", marginTop: "4px" }}
            >
              {idCheckMessage}
            </small>
          )}
        </div>

        <div className="field role-field">
          <span className="label">닉네임</span>
          <div
            style={{
              flex: 1,
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <input
              id="signup-nickname"
              ref={nicknameRef}
              className={`input ${nicknameError ? "invalid" : ""}`}
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
              style={{
                flex: 1,
                backgroundColor: isNicknameChecked ? "#f0f0f0" : "white",
              }}
            />
            <button
              type="button"
              className="btn ghost"
              onClick={checkNicknameDuplicate}
              disabled={isNicknameChecked}
              style={{
                fontSize: "0.8rem",
                padding: "6px 8px",
                whiteSpace: "nowrap",
                backgroundColor: isNicknameChecked ? "#eee" : "transparent",
                cursor: isNicknameChecked ? "default" : "pointer",
                color: isNicknameChecked ? "#888" : "inherit",
                borderColor: isNicknameChecked ? "#ddd" : "#ddd",
              }}
            >
              {isNicknameChecked ? "완료" : "중복확인"}
            </button>
          </div>
          {nicknameError && (
            <small className="error-text">{nicknameError}</small>
          )}
          {!nicknameError && nicknameCheckMessage && (
            <small className="success-text" style={{ color: "green" }}>
              {nicknameCheckMessage}
            </small>
          )}
        </div>

        <div className="field role-field">
          <span className="label">이메일</span>
          <div
            style={{
              flex: 1,
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <input
              id="signup-email"
              ref={emailRef}
              className={`input ${emailError ? "invalid" : ""}`}
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
              style={{
                flex: 1,
                backgroundColor: isEmailChecked ? "#f0f0f0" : "white",
              }}
            />
            <button
              type="button"
              className="btn ghost"
              onClick={checkEmailDuplicate}
              disabled={isEmailChecked}
              style={{
                fontSize: "0.8rem",
                padding: "6px 8px",
                whiteSpace: "nowrap",
                backgroundColor: isEmailChecked ? "#eee" : "transparent",
                cursor: isEmailChecked ? "default" : "pointer",
                color: isEmailChecked ? "#888" : "inherit",
                borderColor: isEmailChecked ? "#ddd" : "#ddd",
              }}
            >
              {isEmailChecked ? "완료" : "중복확인"}
            </button>
          </div>
          {emailError && <small className="error-text">{emailError}</small>}
          {!emailError && emailCheckMessage && (
            <small
              className="success-text"
              style={{ color: "green", fontSize: "0.85rem", marginTop: "4px" }}
            >
              {emailCheckMessage}
            </small>
          )}
        </div>

        <div className="field">
          <span className="label">비밀번호</span>
          <input
            id="signup-password"
            ref={passwordRef}
            className={`input ${passwordError ? "invalid" : ""}`}
            type="password"
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

        <div className="field">
          <span className="label">비밀번호 확인</span>
          <input
            id="signup-confirm"
            ref={confirmRef}
            className={`input ${confirmError ? "invalid" : ""}`}
            type="password"
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
