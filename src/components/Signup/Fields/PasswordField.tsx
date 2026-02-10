import { useEffect, useRef, memo } from "react";
import { BaseInput } from "../Input/BaseInput";
import { useSignupStore } from "@/store/useSignupStore";

export const PasswordField = memo(() => {
  const value = useSignupStore((s) => s.password);
  const error = useSignupStore((s) => s.errors.password);
  const setPassword = useSignupStore((s) => s.setPassword);
  const validatePassword = useSignupStore((s) => s.validatePassword);
  const focusTrigger = useSignupStore((s) => s.focusTrigger);
  const clearFocus = useSignupStore((s) => s.clearFocus);

  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusTrigger === "password") {
      ref.current?.focus();
      clearFocus();
    }
  }, [focusTrigger, clearFocus]);

  return (
    <BaseInput
      label="비밀번호"
      id="signup-password"
      ref={ref}
      type="password"
      value={value}
      onChange={(e) => setPassword(e.target.value)}
      onBlur={() => validatePassword()}
      placeholder="비밀번호를 입력하세요"
      error={error}
      hint="영문·숫자 포함 6자 이상 권장"
    />
  );
});

PasswordField.displayName = "PasswordField";
