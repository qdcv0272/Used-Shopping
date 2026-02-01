import { forwardRef } from "react";
import "../css/login.css";
import "../css/signup.css";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  hint?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(({ label, id, error, hint, className = "", ...props }, ref) => {
  return (
    <div className="field">
      <span className="label">{label}</span>
      <input id={id} ref={ref} className={`input ${error ? "invalid" : ""} ${className}`} {...props} />
      {error && <small className="error-text">{error}</small>}
      {hint && <small className="hint">{hint}</small>}
    </div>
  );
});

interface AuthInputWithCheckProps extends AuthInputProps {
  isChecked: boolean;
  checkMessage?: string | null;
  onCheck: () => void;
  checkButtonLabel?: string;
  checkedButtonLabel?: string;
}

export const AuthInputWithCheck = forwardRef<HTMLInputElement, AuthInputWithCheckProps>(
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
