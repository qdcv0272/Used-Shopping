import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/all";
import { useProductRegisterStore } from "../../store/useProductRegisterStore";

gsap.registerPlugin(Draggable);

export default function ImageUploader() {
  const { images, setImages } = useProductRegisterStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
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

          imageRefs.current.forEach((ref, index) => {
            if (index !== draggedIndex && ref && this.hitTest(ref, "50%")) {
              targetIndex = index;
            }
          });

          gsap.set(this.target, { zIndex: 1, cursor: "grab", x: 0, y: 0 });

          if (draggedIndex !== -1 && targetIndex !== -1 && targetIndex !== draggedIndex) {
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
  }, [images, setImages]);

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

  return (
    <div className="form-group">
      <div className="image-upload-wrapper" ref={containerRef}>
        <label className="image-upload-btn">
          <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="file-input-hidden" />
          <span className="camera-icon">📷</span>
          <span className="image-count">
            <span className="current-count">{images.length}</span>/10
          </span>
        </label>

        {images.map((file, index) => (
          <div
            key={`${file.name}-${file.lastModified}-${index}`}
            className="image-preview image-preview-item"
            ref={(el) => {
              imageRefs.current[index] = el;
            }}
            data-index={index}
          >
            <img src={URL.createObjectURL(file)} alt={`preview-${index}`} />
            {index === 0 && <div className="representative-badge">대표 사진</div>}
            <button
              type="button"
              className="delete-image-btn"
              onClick={(e) => {
                e.stopPropagation();
                removeImage(index);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              ❌
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
