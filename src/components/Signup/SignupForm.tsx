import { useEffect, type ChangeEvent } from "react";
import { AuthInput, AuthInputWithCheck } from "./AuthInput";
import type { SignupFormState } from "../../hooks/useSignupFormState";

type SignupFormProps = {
  form: SignupFormState;
};

export default function SignupForm({ form }: SignupFormProps) {
  const { refs } = form;
  const { idRef, nicknameRef, emailRef, passwordRef, confirmRef } = refs;

  useEffect(() => {
    idRef.current?.focus();
  }, [idRef]);

  const handleChangeId = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setId(value);
    form.setIsIdChecked(false);
    form.setIdCheckMessage(null);
    if (form.idError) form.validateId(value);
  };

  const handleChangeNickname = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setNickname(value);
    form.setIsNicknameChecked(false);
    form.setNicknameCheckMessage(null);
    if (form.nicknameError) form.validateNickname(value);
  };

  const handleChangeEmail = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setEmail(value);
    if (form.emailError) form.validateEmail(value);
  };

  const handleChangePassword = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setPassword(value);
    if (form.passwordError) form.validatePassword(value);
    if (form.confirm) form.validateConfirm(form.confirm);
  };

  const handleChangeConfirm = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setConfirm(value);
    if (form.confirmError) form.validateConfirm(value);
  };

  return (
    <>
      <AuthInputWithCheck
        label="아이디"
        id="signup-id"
        ref={idRef}
        value={form.id}
        onChange={handleChangeId}
        onBlur={() => form.validateId()}
        placeholder="사용할 아이디를 입력하세요"
        error={form.idError}
        isChecked={form.isIdChecked}
        checkMessage={form.idCheckMessage}
        onCheck={form.checkIdDuplicate}
      />

      <AuthInputWithCheck
        label="닉네임"
        id="signup-nickname"
        ref={nicknameRef}
        value={form.nickname}
        onChange={handleChangeNickname}
        onBlur={() => form.validateNickname()}
        placeholder="사용할 닉네임을 입력하세요"
        error={form.nicknameError}
        isChecked={form.isNicknameChecked}
        checkMessage={form.nicknameCheckMessage}
        onCheck={form.checkNicknameDuplicate}
      />

      <AuthInput
        label="이메일"
        id="signup-email"
        ref={emailRef}
        value={form.email}
        onChange={handleChangeEmail}
        onBlur={() => form.validateEmail()}
        placeholder="가입 후 인증이 필요하니 실제 이메일을 입력하세요"
        error={form.emailError}
      />

      <AuthInput
        label="비밀번호"
        id="signup-password"
        ref={passwordRef}
        type="password"
        value={form.password}
        onChange={handleChangePassword}
        onBlur={() => form.validatePassword()}
        placeholder="비밀번호를 입력하세요"
        error={form.passwordError}
        hint="영문·숫자 포함 6자 이상 권장"
      />

      <AuthInput
        label="비밀번호 확인"
        id="signup-confirm"
        ref={confirmRef}
        type="password"
        value={form.confirm}
        onChange={handleChangeConfirm}
        onBlur={() => form.validateConfirm()}
        placeholder="비밀번호를 다시 입력하세요"
        error={form.confirmError}
      />
    </>
  );
}
