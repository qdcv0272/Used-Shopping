import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { Draggable } from "gsap/all";
import { auth, addProduct, uploadImage } from "../firebase";
import "../css/productRegister.css";

gsap.registerPlugin(Draggable);

const CATEGORIES = [
  "디지털기기",
  "생활가전",
  "가구/인테리어",
  "유아동",
  "생활/가공식품",
  "여성의류",
  "남성의류",
  "스포츠/레저",
  "게임/취미",
  "도서/티켓/음반",
  "식물",
  "반려동물용품",
  "기타",
];

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

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useLayoutEffect(() => {
    if (isLoading || !user) return;
    const ctx = gsap.context(() => {
      Draggable.create(imageRefs.current, {
        type: "x",
        bounds: containerRef.current,
        inertia: true,
        onDragStart: function () {
          gsap.set(this.target, { zIndex: 100, cursor: "grabbing" });
        },
        onDragEnd: function () {
          const draggedIndex = parseInt(this.target.dataset.index || "-1");

          let targetIndex = -1;
          // Find the drop target BEFORE resetting position
          // hitTest returns true if the dragged element overlaps with the test element (ref)
          imageRefs.current.forEach((ref, index) => {
            // Self check is always true, so we skip it to find the other element we are hovering over
            // Use a lower threshold like 20% or 'touch' to make it easier to swap if needed, but 50% is standard overlap
            if (index !== draggedIndex && ref && this.hitTest(ref, "50%")) {
              targetIndex = index;
            }
          });

          // Reset position logic styling
          gsap.set(this.target, { zIndex: 1, cursor: "grab", x: 0, y: 0 });

          if (
            draggedIndex !== -1 &&
            targetIndex !== -1 &&
            targetIndex !== draggedIndex
          ) {
            console.log(`Swapping ${draggedIndex} -> ${targetIndex}`);
            // Swap logic
            setImages((prev) => {
              const newImages = [...prev];
              const [moved] = newImages.splice(draggedIndex, 1);
              newImages.splice(targetIndex, 0, moved);
              return newImages;
            });
          }
        },
      });
    }, containerRef);
    return () => ctx.revert();
  }, [images]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (images.length + newFiles.length > 10) {
        alert("최대 10장까지만 등록 가능합니다.");
        return;
      }
      setImages((prev) => [...prev, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

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

      // 1. Upload Images
      const uploadedImageUrls = await Promise.all(
        images.map((img) => uploadImage(img))
      );

      // 2. Create Product in Firestore
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
      navigate("/"); // Go to Home
    } catch (error) {
      console.error("Error registering product:", error);
      alert("상품 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="product-register-container"
        style={{ textAlign: "center", padding: "4rem 0" }}
      >
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
        {/* Title Section */}
        <div className="form-group">
          <label className="form-label">제목</label>
          <input
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력해주세요."
          />
        </div>

        {/* Image Upload Section */}
        <div className="form-group">
          <div className="image-upload-wrapper" ref={containerRef}>
            <label className="image-upload-btn">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
              <span className="camera-icon">📷</span>
              <span className="image-count">
                <span className="current-count">{images.length}</span>/10
              </span>
            </label>

            {images.map((file, index) => (
              <div
                key={`${file.name}-${file.lastModified}-${index}`}
                className="image-preview"
                ref={(el) => {
                  imageRefs.current[index] = el;
                }}
                data-index={index}
                style={{ cursor: "grab", touchAction: "none" }}
              >
                <img src={URL.createObjectURL(file)} alt={`preview-${index}`} />
                {index === 0 && (
                  <div className="representative-badge">대표 사진</div>
                )}
                <button
                  type="button"
                  className="delete-image-btn"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent drag start
                    removeImage(index);
                  }}
                  onMouseDown={(e) => e.stopPropagation()} // prevent drag start
                  onTouchStart={(e) => e.stopPropagation()}
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Category Section */}
        <div className="form-group">
          <label className="form-label">카테고리</label>
          <div className="category-grid">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-item ${category === cat ? "active" : ""}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Description Section */}
        <div className="form-group">
          <label className="form-label">자세한 설명</label>
          <textarea
            className="form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder=""
          ></textarea>
        </div>

        {/* Price Section */}
        <div className="form-group">
          <label className="form-label">가격</label>
          <div className="price-group-header">
            <span className="sell-badge">판매하기</span>
          </div>
          <div className="price-input-wrapper">
            <span className="currency-symbol">₩</span>
            <input
              type="text" // Using text to allow formatiing if needed, or number
              className="form-input"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="가격을 입력해주세요."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="submit-btn-wrapper">
          <button
            type="button"
            className="submit-btn"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "등록 중..." : "작성 완료"}
          </button>
        </div>
      </form>
    </div>
  );
}
