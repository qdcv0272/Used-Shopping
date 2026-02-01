import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../sdk/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useForm } from "../hooks/useForm";
import Modal from "../components/Modal";
import { findUserIdByEmail, verifyUser, resetPassword, loginUser } from "../sdk/firebase";

import "../css/login.css";

type LoginProps = {
  onClose?: () => void;
};

export default function Login({ onClose }: LoginProps) {
  const { values, handleChange, resetForm } = useForm({
    id: "",
    password: "",
  });
  const { id, password } = values;

  const [message, setMessage] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<"NONE" | "FIND_ID" | "FIND_PW" | "CHANGE_PW">("NONE");
  const [findEmailInput, setFindEmailInput] = useState("");
  const [findIdInput, setFindIdInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [newPasswordConfirmInput, setNewPasswordConfirmInput] = useState("");
  const [modalMsg, setModalMsg] = useState("");
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

  const handleFindId = async () => {
    if (!findEmailInput) {
      setModalMsg("이메일을 입력해주세요.");
      return;
    }
    try {
      const foundId = await findUserIdByEmail(findEmailInput);
      if (foundId) {
        setModalMsg(`회원님의 아이디는 [ ${foundId} ] 입니다.`);
      } else {
        setModalMsg("해당 이메일로 가입된 아이디가 없습니다.");
      }
    } catch (e) {
      console.error(e);
      setModalMsg("오류가 발생했습니다.");
    }
  };

  const handleFindPwCheck = async () => {
    if (!findEmailInput || !findIdInput) {
      setModalMsg("아이디와 이메일을 모두 입력해주세요.");
      return;
    }
    try {
      const valid = await verifyUser(findIdInput, findEmailInput);
      if (valid) {
        setModalMode("CHANGE_PW");
        setModalMsg("");
      } else {
        setModalMsg("일치하는 회원 정보가 없습니다.");
      }
    } catch (e) {
      console.error(e);
      setModalMsg("오류가 발생했습니다.");
    }
  };

  const handleChangePw = async () => {
    if (!newPasswordInput || !newPasswordConfirmInput) {
      setModalMsg("새 비밀번호와 확인을 모두 입력해주세요.");
      return;
    }
    if (newPasswordInput !== newPasswordConfirmInput) {
      setModalMsg("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      // Firebase 정책상 비로그인 상태에서 즉시 변경 불가 -> 이메일 발송으로 처리
      await resetPassword(findEmailInput);
      setModalMsg("보안을 위해 비밀번호 변경은 이메일 인증이 필수입니다.\n가입하신 이메일로 재설정 링크를 전송했습니다.");

      setTimeout(() => {
        setModalMode("NONE");
        setFindEmailInput("");
        setFindIdInput("");
        setNewPasswordInput("");
        setNewPasswordConfirmInput("");
        setModalMsg("");
      }, 4000);
    } catch (e) {
      console.error(e);
      setModalMsg("오류가 발생했습니다.");
    }
  };

  const handleLogin = async () => {
    try {
      if (!id || !password) {
        setMessage("id와 비밀번호를 입력해 주세요.");
        return;
      }

      setMessage("로그인 중...");
      const cred = await loginUser(id, password);

      if (!cred.user.emailVerified) {
        await auth.signOut();
        setMessage("이메일 인증이 완료되지 않았습니다. 가입하신 이메일의 수신함을 확인해주세요.");
        return;
      }

      setMessage(`로그인 되었습니다: ${cred.user.displayName ?? cred.user.email}`);
      resetForm();

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
            <input id="login-id" name="id" type="text" placeholder="아이디를 입력하세요" value={id} onChange={handleChange} className="login-input" />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">비밀번호</label>
            <input id="login-password" name="password" type="password" placeholder="비밀번호를 입력하세요" value={password} onChange={handleChange} className="login-input" />
          </div>

          <button type="submit" className="login-btn primary">
            로그인
          </button>
        </form>

        <div className="login-footer">
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "10px" }}>
            <span
              className="link-text"
              onClick={() => {
                setModalMode("FIND_ID");
                setModalMsg("");
                setFindEmailInput("");
              }}
            >
              아이디 찾기
            </span>
            <span style={{ color: "#aaa" }}>|</span>
            <span
              className="link-text"
              onClick={() => {
                setModalMode("FIND_PW");
                setModalMsg("");
                setFindEmailInput("");
                setFindIdInput("");
              }}
            >
              비밀번호 찾기
            </span>
          </div>
          <p>
            계정이 없으신가요?{" "}
            <span className="link-text" onClick={() => navigate("/signup")}>
              회원가입
            </span>
          </p>
        </div>

        {message && <div className="login-message-box">{message}</div>}

        {modalMode !== "NONE" && (
          <Modal onClose={() => setModalMode("NONE")} title={modalMode === "FIND_ID" ? "아이디 찾기" : modalMode === "FIND_PW" ? "비밀번호 찾기" : "비밀번호 변경"}>
            <div className="login-form">
              {modalMode === "FIND_ID" && (
                <>
                  <div className="form-group">
                    <label>이메일</label>
                    <input type="email" className="login-input" placeholder="가입했던 이메일 입력" value={findEmailInput} onChange={(e) => setFindEmailInput(e.target.value)} />
                  </div>
                  <button className="login-btn primary" onClick={handleFindId}>
                    아이디 찾기
                  </button>
                </>
              )}

              {modalMode === "FIND_PW" && (
                <>
                  <div className="form-group">
                    <label>아이디</label>
                    <input type="text" className="login-input" placeholder="아이디 입력" value={findIdInput} onChange={(e) => setFindIdInput(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>이메일</label>
                    <input type="email" className="login-input" placeholder="가입했던 이메일 입력" value={findEmailInput} onChange={(e) => setFindEmailInput(e.target.value)} />
                  </div>
                  <button className="login-btn primary" onClick={handleFindPwCheck}>
                    확인
                  </button>
                </>
              )}

              {modalMode === "CHANGE_PW" && (
                <>
                  <div className="form-group">
                    <label>새 비밀번호</label>
                    <input type="password" className="login-input" placeholder="새 비밀번호 입력" value={newPasswordInput} onChange={(e) => setNewPasswordInput(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>새 비밀번호 확인</label>
                    <input type="password" className="login-input" placeholder="새 비밀번호 확인" value={newPasswordConfirmInput} onChange={(e) => setNewPasswordConfirmInput(e.target.value)} />
                  </div>
                  <button className="login-btn primary" onClick={handleChangePw}>
                    비밀번호 변경
                  </button>
                </>
              )}

              {modalMsg && (
                <div
                  style={{
                    marginTop: "15px",
                    textAlign: "center",
                    color: modalMsg.includes("변경되었습니다") || modalMsg.includes("아이디는") ? "green" : "red",
                    fontWeight: "bold",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {modalMsg}
                </div>
              )}
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
