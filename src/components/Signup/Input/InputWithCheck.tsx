// src/components/Signup/Input/InputWithCheck.tsx
import { forwardRef } from "react";
import type { BaseInputProps } from "./BaseInput";
import "@/css/login.css";
import "@/css/signup.css";

interface InputWithCheckProps extends BaseInputProps {
  isChecked: boolean;
  checkMessage?: string | null;
  onCheck: () => void;
  checkButtonLabel?: string;
  checkedButtonLabel?: string;
}

export const InputWithCheck = forwardRef<HTMLInputElement, InputWithCheckProps>(
  ({ label, id, error, isChecked, checkMessage, onCheck, checkButtonLabel = "중복확인", checkedButtonLabel = "완료", className = "", ...props }, ref) => {
    return (
      <div className="field role-field">
        <span className="label">{label}</span>
        <div className="signup-input-group">
          <input id={id} ref={ref} className={`input signup-input-field ${error ? "invalid" : ""} ${isChecked ? "checked" : ""} ${className}`} readOnly={isChecked} {...props} />
          <button type="button" className={`btn ghost duplicate-check-btn ${isChecked ? "checked" : ""}`} onClick={onCheck} disabled={isChecked}>
            {isChecked ? checkedButtonLabel : checkButtonLabel}
          </button>
        </div>
        {error && <small className="error-text">{error}</small>}
        {!error && checkMessage && <small className="success-text">{checkMessage}</small>}
      </div>
    );
  },
);

InputWithCheck.displayName = "InputWithCheck";
