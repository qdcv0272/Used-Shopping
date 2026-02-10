import { useEffect, useRef, memo } from "react";
import { InputWithCheck } from "../Input/InputWithCheck";
import { useSignupStore } from "@/store/useSignupStore";

export const EmailField = memo(() => {
  const value = useSignupStore((s) => s.email);
  const error = useSignupStore((s) => s.errors.email);
  const isChecked = useSignupStore((s) => s.isEmailChecked);
  const checkMessage = useSignupStore((s) => s.emailCheckMessage);
  const setEmail = useSignupStore((s) => s.setEmail);
  const validateEmail = useSignupStore((s) => s.validateEmail);
  const checkEmailDuplicate = useSignupStore((s) => s.checkEmailDuplicate);
  const focusTrigger = useSignupStore((s) => s.focusTrigger);
  const clearFocus = useSignupStore((s) => s.clearFocus);

  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusTrigger === "email") {
      ref.current?.focus();
      clearFocus();
    }
  }, [focusTrigger, clearFocus]);

  return (
    <InputWithCheck
      label="이메일"
      id="signup-email"
      ref={ref}
      value={value}
      onChange={(e) => setEmail(e.target.value)}
      onBlur={() => validateEmail()}
      placeholder="가입 후 인증이 필요하니 실제 이메일을 입력하세요"
      error={error}
      isChecked={isChecked}
      checkMessage={checkMessage}
      onCheck={checkEmailDuplicate}
    />
  );
});

EmailField.displayName = "EmailField";
