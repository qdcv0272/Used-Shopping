import { type RefObject } from "react";

export interface SignupFormState {
  id: string;
  setId: (value: string) => void;
  idError: string | null;
  isIdChecked: boolean;
  idCheckMessage: string | null;

  nickname: string;
  setNickname: (value: string) => void;
  nicknameError: string | null;
  isNicknameChecked: boolean;
  nicknameCheckMessage: string | null;

  email: string;
  setEmail: (value: string) => void;
  emailError: string | null;

  password: string;
  setPassword: (value: string) => void;
  passwordError: string | null;

  confirm: string;
  setConfirm: (value: string) => void;
  confirmError: string | null;

  validateId: (value?: string) => boolean;
  validateNickname: (value?: string) => boolean;
  validateEmail: (value?: string) => boolean;
  validatePassword: (value?: string) => boolean;
  validateConfirm: (value?: string) => boolean;

  checkIdDuplicate: () => void;
  checkNicknameDuplicate: () => void;

  setIsIdChecked: (value: boolean) => void;
  setIdCheckMessage: (value: string | null) => void;
  setIsNicknameChecked: (value: boolean) => void;
  setNicknameCheckMessage: (value: string | null) => void;

  setIdError: (value: string | null) => void;
  setNicknameError: (value: string | null) => void;

  refs: {
    idRef: RefObject<HTMLInputElement | null>;
    nicknameRef: RefObject<HTMLInputElement | null>;
    emailRef: RefObject<HTMLInputElement | null>;
    passwordRef: RefObject<HTMLInputElement | null>;
    confirmRef: RefObject<HTMLInputElement | null>;
  };
}

export type SignupValues = {
  id: string;
  nickname: string;
  email: string;
  password: string;
  confirm: string;
};

export type SignupErrors = {
  id: string | null;
  nickname: string | null;
  email: string | null;
  password: string | null;
  confirm: string | null;
};

export type SignupChecks = {
  isIdChecked: boolean;
  idCheckMessage: string | null;
  isNicknameChecked: boolean;
  nicknameCheckMessage: string | null;
};
