import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound">
      <h2>404</h2>
      <p>Page not found.</p>

      <div className="actions">
        <button className="btn" onClick={() => navigate("/")}>
          홈으로 이동
        </button>
      </div>
    </div>
  );
}
