import "./css/app.css";
import { NavLink, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import ProductDetail from "./pages/ProductDetail";
import ProductRegister from "./pages/ProductRegister";

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <h1>사과 중고 마켓</h1>
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
            to="/about"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            About
          </NavLink>
          {" | "}
          <NavLink
            to="/products/new"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            상품 등록
          </NavLink>
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
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products/new" element={<ProductRegister />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
