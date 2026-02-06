import type { SignupFormState } from "./signup/types";
import { useSignupState } from "./signup/useSignupState";
import { useSignupHandlers } from "./signup/useSignupHandlers";

export type { SignupFormState };

export function useSignupFormState(): SignupFormState {
  const state = useSignupState();
  const handlers = useSignupHandlers(state);
  const { values, errors, checks, refs, setValue, setError, setCheck } = state;

  return {
    // Values
    id: values.id,
    nickname: values.nickname,
    email: values.email,
    password: values.password,
    confirm: values.confirm,

    // Value Setters
    setId: setValue("id"),
    setNickname: setValue("nickname"),
    setEmail: setValue("email"),
    setPassword: setValue("password"),
    setConfirm: setValue("confirm"),

    // Errors
    idError: errors.id,
    nicknameError: errors.nickname,
    emailError: errors.email,
    passwordError: errors.password,
    confirmError: errors.confirm,

    // Error Setters
    setIdError: setError("id"),
    setNicknameError: setError("nickname"),

    // Checks
    isIdChecked: checks.isIdChecked,
    idCheckMessage: checks.idCheckMessage,
    isNicknameChecked: checks.isNicknameChecked,
    nicknameCheckMessage: checks.nicknameCheckMessage,

    // Check Setters
    setIsIdChecked: (val) => setCheck("isIdChecked")(val),
    setIdCheckMessage: (val) => setCheck("idCheckMessage")(val),
    setIsNicknameChecked: (val) => setCheck("isNicknameChecked")(val),
    setNicknameCheckMessage: (val) => setCheck("nicknameCheckMessage")(val),

    // Handlers
    ...handlers,

    // Refs
    refs,
  };
}
