import "./css/app.css";
import { useEffect } from "react";
import { NavLink, Routes, Route, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./sdk/firebase";
import { useAuthStore } from "./store/useAuthStore";
import { useToastStore } from "./store/useToastStore";
import Toast from "./components/Toast";
import ChatModal from "./components/ChatModal";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MyPage from "./pages/MyPage";
import NotFound from "./pages/NotFound";
import ProductDetail from "./pages/ProductDetail";
import ProductRegister from "./pages/ProductRegister";

function App() {
  const { addToast } = useToastStore(); // Toast 알림을 위한 스토어 훅
  const { user, setUser } = useAuthStore(); // 전역 Auth state 관리 훅
  const navigate = useNavigate(); // 라우팅을 위한 훅

  // Firebase 인증 상태 변경 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [setUser]);

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await signOut(auth);
      addToast("로그아웃 되었습니다.", "success");
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="App">
      <ChatModal />
      <Toast />
      <header className="app-header">
        <h1>
          <NavLink to="/" className="nav-logo-link">
            사과 중고 마켓
          </NavLink>
        </h1>
        <nav>
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            Home
          </NavLink>
          {" | "}
          <NavLink to="/mypage" className={({ isActive }) => (isActive ? "active" : "")}>
            내 정보
          </NavLink>
          {" | "}
          <NavLink to="/products/new" className={({ isActive }) => (isActive ? "active" : "")}>
            상품 등록
          </NavLink>

          {user ? (
            <>
              {" | "}
              <button onClick={handleLogout} className="nav-btn nav-logout-btn">
                로그아웃
              </button>
            </>
          ) : (
            <>
              {" | "}
              <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
                로그인
              </NavLink>
              {" | "}
              <NavLink to="/signup" className={({ isActive }) => (isActive ? "active" : "")}>
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
