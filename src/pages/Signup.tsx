import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/login.css";

export default function Signup() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignup = async () => {
    // Track completion across try/catch/finally to avoid ReferenceError and stale UI
    let finished = false;

    try {
      if (!id || !password || !confirm) {
        setMessage("모든 필드를 입력해 주세요.");
        return;
      }
      if (password.length < 6) {
        setMessage("비밀번호는 최소 6자 이상이어야 합니다.");
        return;
      }
      if (password !== confirm) {
        setMessage("비밀번호가 일치하지 않습니다.");
        return;
      }

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
      const user = await registerUser(id, password, { displayName: id });
      console.log("registerUser resolved", {
        uid: user?.uid,
        email: user?.email,
        profileSaved: (user as { _profileSaved?: boolean } | null)
          ?._profileSaved,
      });

      // post-registration 단계가 예기치 않게 실패하는지 확인하기 위해 안전하게 감싼다.
      try {
        const email = typeof user?.email === "string" ? user.email : id;
        console.log("computed email:", email);

        const profileSaved =
          (user as { _profileSaved?: boolean } | null)?._profileSaved !== false;
        console.log("Profile saved flag:", profileSaved);

        const finalMessage = profileSaved
          ? `회원가입 완료: ${email}`
          : `회원가입 완료: ${email} (프로필 저장 실패)`;

        // 즉시 메시지 설정 후 성공 처리 — 컴포넌트가 언마운트 되지 않는 한 메시지가 보입니다.
        setMessage(finalMessage);
        console.log("Signup success message set", { finalMessage });
        // 브라우저 알림 요청/표시 (권한이 있으면 데스크톱 알림)
        import("../utils/notify").then(({ showBrowserNotification }) => {
          showBrowserNotification("회원가입 완료", { body: finalMessage });
        });
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
    <section className="login" aria-label="signup section">
      <div className="field">
        <span className="label">id :</span>
        <input
          className="input"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="Enter id"
          aria-label="signup id"
        />
      </div>

      <div className="field">
        <span className="label">password :</span>
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          aria-label="signup password"
        />
      </div>

      <div className="field">
        <span className="label">confirm :</span>
        <input
          className="input"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm password"
          aria-label="confirm password"
        />
      </div>

      <div className="actions">
        <button className="btn" onClick={handleSignup}>
          회원가입
        </button>
      </div>

      {message && <p className="login-message">{message}</p>}
    </section>
  );
}
