import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, addProduct, uploadImage } from "../sdk/firebase";
import ImageUploader from "../components/ProductRegister/ImageUploader";
import ProductForm from "../components/ProductRegister/ProductForm";
import "../css/productRegister.css";

export default function ProductRegister() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
        likes: 0,
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
        <div className="form-group">
          <label className="form-label">제목</label>
          <input type="text" className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력해주세요." />
        </div>

        <ImageUploader images={images} setImages={setImages} />

        <ProductForm
          title="" // 이미 위에서 렌더링 했으므로 여기는 빈값이나 hidden으로 처리해야 하지만
          // 원래 구조상 제목이 ImageUploader 위에 있었음.
          // 하지만 ProductForm에 제목이 포함되어 있음.
          // 따라서 원래 화면 구조를 맞추려면 ProductForm에서 제목을 빼거나
          // 아니면 ProductForm 전체를 렌더링하고 위쪽의 title input을 제거해야 함.
          // ProductForm에 제목부터 가격까지 다 넣었으니 위쪽 JSX를 수정해야 함.
          // 아래 oldString, newString으로 처리하겠음.
          setTitle={setTitle}
          category={category}
          setCategory={setCategory}
          description={description}
          setDescription={setDescription}
          price={price}
          setPrice={setPrice}
        />

        <div className="submit-btn-wrapper">
          <button type="button" className="submit-btn" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "등록 중..." : "작성 완료"}
          </button>
        </div>
      </form>
    </div>
  );
}
