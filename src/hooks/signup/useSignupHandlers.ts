import { validateIdFormat, validateNicknameFormat, validateEmailFormat, validatePasswordFormat, validateConfirmFormat } from "../../utils/validators";
import type { useSignupState } from "./useSignupState";
import type { SignupValues, SignupErrors } from "./types";

type SignupState = ReturnType<typeof useSignupState>;

export function useSignupHandlers({ values, setError, setCheck, refs }: SignupState) {
  const validate = (field: keyof SignupValues, validator: (val: string) => string | null, valueOverride?: string) => {
    const value = valueOverride ?? values[field];
    const error = validator(value);
    // Explicitly cast field to keyof SignupErrors to match setError type
    setError(field as keyof SignupErrors)(error);
    return !error;
  };

  const validateId = (value?: string) => validate("id", validateIdFormat, value);
  const validateNickname = (value?: string) => validate("nickname", validateNicknameFormat, value);
  const validateEmail = (value?: string) => validate("email", validateEmailFormat, value);
  const validatePassword = (value?: string) => validate("password", validatePasswordFormat, value);

  const validateConfirm = (value: string = values.confirm) => {
    const error = validateConfirmFormat(value, values.password);
    setError("confirm")(error);
    return !error;
  };

  const checkIdDuplicate = () => {
    if (!validateId()) return;
    setCheck("idCheckMessage")("사용 가능한 아이디입니다.");
    setCheck("isIdChecked")(true);
    refs.idRef.current?.blur();
  };

  const checkNicknameDuplicate = () => {
    if (!validateNickname()) return;
    setCheck("nicknameCheckMessage")("사용 가능한 닉네임입니다.");
    setCheck("isNicknameChecked")(true);
    refs.nicknameRef.current?.blur();
  };

  return {
    validateId,
    validateNickname,
    validateEmail,
    validatePassword,
    validateConfirm,
    checkIdDuplicate,
    checkNicknameDuplicate,
  };
}
