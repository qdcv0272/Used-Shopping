// src/components/Signup/Input/BaseInput.tsx
import { forwardRef, type InputHTMLAttributes } from "react";
import "@/css/login.css";
import "@/css/signup.css";

export interface BaseInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  hint?: string;
}

export const BaseInput = forwardRef<HTMLInputElement, BaseInputProps>(({ label, id, error, hint, className = "", ...props }, ref) => {
  return (
    <div className="field">
      <span className="label">{label}</span>
      <input id={id} ref={ref} className={`input ${error ? "invalid" : ""} ${className}`} {...props} />
      {error && <small className="error-text">{error}</small>}
      {hint && <small className="hint">{hint}</small>}
    </div>
  );
});

BaseInput.displayName = "BaseInput";
