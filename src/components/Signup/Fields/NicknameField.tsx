import { useEffect, useRef, memo } from "react";
import { InputWithCheck } from "../Input/InputWithCheck";
import { useSignupStore } from "@/store/useSignupStore";

export const NicknameField = memo(() => {
  const value = useSignupStore((s) => s.nickname);
  const error = useSignupStore((s) => s.errors.nickname);
  const isChecked = useSignupStore((s) => s.isNicknameChecked);
  const checkMessage = useSignupStore((s) => s.nicknameCheckMessage);
  const setNickname = useSignupStore((s) => s.setNickname);
  const validateNickname = useSignupStore((s) => s.validateNickname);
  const checkNicknameDuplicate = useSignupStore((s) => s.checkNicknameDuplicate);
  const focusTrigger = useSignupStore((s) => s.focusTrigger);
  const clearFocus = useSignupStore((s) => s.clearFocus);

  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusTrigger === "nickname") {
      ref.current?.focus();
      clearFocus();
    }
  }, [focusTrigger, clearFocus]);

  return (
    <InputWithCheck
      label="닉네임"
      id="signup-nickname"
      ref={ref}
      value={value}
      onChange={(e) => setNickname(e.target.value)}
      onBlur={() => validateNickname()}
      placeholder="사용할 닉네임을 입력하세요"
      error={error}
      isChecked={isChecked}
      checkMessage={checkMessage}
      onCheck={checkNicknameDuplicate}
    />
  );
});

NicknameField.displayName = "NicknameField";
