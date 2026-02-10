import { useEffect, useRef, memo } from "react";
import { InputWithCheck } from "../Input/InputWithCheck";
import { useSignupStore } from "@/store/useSignupStore";

export const IdField = memo(() => {
  const value = useSignupStore((s) => s.id);
  const error = useSignupStore((s) => s.errors.id);
  const isChecked = useSignupStore((s) => s.isIdChecked);
  const checkMessage = useSignupStore((s) => s.idCheckMessage);
  const setId = useSignupStore((s) => s.setId);
  const validateId = useSignupStore((s) => s.validateId);
  const checkIdDuplicate = useSignupStore((s) => s.checkIdDuplicate);
  const focusTrigger = useSignupStore((s) => s.focusTrigger);
  const clearFocus = useSignupStore((s) => s.clearFocus);

  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusTrigger === "id") {
      ref.current?.focus();
      clearFocus();
    }
  }, [focusTrigger, clearFocus]);

  // Initial focus only for ID field
  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <InputWithCheck
      label="아이디"
      id="signup-id"
      ref={ref}
      value={value}
      onChange={(e) => setId(e.target.value)}
      onBlur={() => validateId()}
      placeholder="사용할 아이디를 입력하세요"
      error={error}
      isChecked={isChecked}
      checkMessage={checkMessage}
      onCheck={checkIdDuplicate}
    />
  );
});

IdField.displayName = "IdField";
