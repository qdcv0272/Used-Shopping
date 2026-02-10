import { useNavigate } from "react-router-dom";

type FooterProps = {
  onFindIdClick: () => void;
  onFindPasswordClick: () => void;
};

export default function Footer({ onFindIdClick, onFindPasswordClick }: FooterProps) {
  const navigate = useNavigate();

  return (
    <div className="login-footer">
      <div className="footer-links">
        <span className="link-text" onClick={onFindIdClick}>
          아이디 찾기
        </span>
        <span className="footer-divider">|</span>
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
