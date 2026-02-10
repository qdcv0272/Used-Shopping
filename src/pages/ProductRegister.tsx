import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, addProduct, uploadImage } from "../sdk/firebase";
import ImageUploader from "../components/ProductRegister/ImageUploader";
import ProductForm from "../components/ProductRegister/ProductForm";
import { useProductRegisterStore } from "../store/useProductRegisterStore";
import "../css/productRegister.css";

export default function ProductRegister() {
  const navigate = useNavigate();
  const { title, category, description, price, images, resetForm } = useProductRegisterStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    resetForm();
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [resetForm]);

  const handleSubmit = async () => {
    if (!title || !description || !price || !category) {
      alert("모든 필수 항목을 입력해주세요.");
      return;
    }
    const user = auth.currentUser;
    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    try {
      setIsSubmitting(true);

      const uploadedImageUrls = await Promise.all(images.map((img) => uploadImage(img)));

      const priceNumber = Number(price.replace(/,/g, ""));
      await addProduct({
        title,
        description,
        price: isNaN(priceNumber) ? 0 : priceNumber,
        category,
        images: uploadedImageUrls,
        sellerId: user.uid,
        createdAt: Date.now(),
        views: 0,
      });

      alert("상품이 등록되었습니다.");
      navigate("/");
    } catch (error) {
      console.error("Error registering product:", error);
      alert("상품 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="product-register-container register-loading">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="product-register-container auth-required">
        <h2>내 물건 팔기</h2>
        <div className="auth-message-wrapper">
          <p>로그인이 필요한 서비스입니다.</p>
          <button className="auth-btn" onClick={() => navigate("/login")}>
            로그인 하러 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-register-container">
      <div className="product-register-header">
        <h2>내 물건 팔기</h2>
      </div>

      <form className="register-form" onSubmit={(e) => e.preventDefault()}>
        <ImageUploader />
        <ProductForm />

        <div className="submit-btn-wrapper">
          <button type="button" className="submit-btn" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "등록 중..." : "작성 완료"}
          </button>
        </div>
      </form>
    </div>
  );
}
