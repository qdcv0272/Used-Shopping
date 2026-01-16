import React, { useEffect } from "react";
import "../css/modal.css";

type ModalProps = {
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
};

export default function Modal({ onClose, children, title }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div
        className="modal-backdrop"
        onClick={() => onClose()}
        aria-hidden="true"
      />

      <div
        className="modal-panel"
        role="document"
        aria-labelledby="modal-title"
      >
        {title && (
          <h2 id="modal-title" className="modal-title">
            {title}
          </h2>
        )}
        <button className="modal-close" aria-label="close" onClick={onClose}>
          ×
        </button>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}
