import "./css/app.css";
import { useEffect, useState } from "react";
import { NavLink, Routes, Route, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "./firebase";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MyPage from "./pages/MyPage";
import NotFound from "./pages/NotFound";
import ProductDetail from "./pages/ProductDetail";
import ProductRegister from "./pages/ProductRegister";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("로그아웃 되었습니다.");
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>
          <NavLink to="/" style={{ textDecoration: "none", color: "inherit" }}>
            사과 중고 마켓
          </NavLink>
        </h1>
        <nav>
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Home
          </NavLink>
          {" | "}
          <NavLink
            to="/mypage"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            내 정보
          </NavLink>
          {" | "}
          <NavLink
            to="/products/new"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            상품 등록
          </NavLink>

          {user ? (
            <>
              {" | "}
              <button
                onClick={handleLogout}
                className="nav-btn"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  font: "inherit",
                  cursor: "pointer",
                  color: "inherit",
                  textDecoration: "underline",
                }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              {" | "}
              <NavLink
                to="/login"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                로그인
              </NavLink>
              {" | "}
              <NavLink
                to="/signup"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                회원가입
              </NavLink>
            </>
          )}
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products/new" element={<ProductRegister />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
