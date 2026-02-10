import { useEffect, useRef, memo } from "react";
import { BaseInput } from "../Input/BaseInput";
import { useSignupStore } from "@/store/useSignupStore";

export const ConfirmField = memo(() => {
  const value = useSignupStore((s) => s.confirm);
  const error = useSignupStore((s) => s.errors.confirm);
  const setConfirm = useSignupStore((s) => s.setConfirm);
  const validateConfirm = useSignupStore((s) => s.validateConfirm);
  const focusTrigger = useSignupStore((s) => s.focusTrigger);
  const clearFocus = useSignupStore((s) => s.clearFocus);

  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusTrigger === "confirm") {
      ref.current?.focus();
      clearFocus();
    }
  }, [focusTrigger, clearFocus]);

  return (
    <BaseInput
      label="비밀번호 확인"
      id="signup-confirm"
      ref={ref}
      type="password"
      value={value}
      onChange={(e) => setConfirm(e.target.value)}
      onBlur={() => validateConfirm()}
      placeholder="비밀번호를 다시 입력하세요"
      error={error}
    />
  );
});

ConfirmField.displayName = "ConfirmField";
