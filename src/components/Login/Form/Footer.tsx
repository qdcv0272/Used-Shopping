import { useNavigate } from "react-router-dom";

type FooterProps = {
  onFindIdClick: () => void;
  onFindPasswordClick: () => void;
};

export default function Footer({ onFindIdClick, onFindPasswordClick }: FooterProps) {
  const navigate = useNavigate();

  return (
    <div className="login-footer">
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "10px" }}>
        <span className="link-text" onClick={onFindIdClick}>
          아이디 찾기
        </span>
        <span style={{ color: "#aaa" }}>|</span>
        <span className="link-text" onClick={onFindPasswordClick}>
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
  );
}
