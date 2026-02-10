// 회원가입 스토어 타입 정의
export interface SignupFormData {
  id: string;
  nickname: string;
  email: string;
  password: string;
  confirm: string;
}

// 폼 에러 상태 타입
export interface SignupFormErrors {
  errors: {
    id: string | null;
    nickname: string | null;
    email: string | null;
    password: string | null;
    confirm: string | null;
  };
}

// 상태 타입
export interface SignupStatusState {
  // 중복 확인 상태
  isIdChecked: boolean;
  idCheckMessage: string | null;
  isNicknameChecked: boolean;
  nicknameCheckMessage: string | null;
  isEmailChecked: boolean;
  emailCheckMessage: string | null;

  // 진행 상태
  isSubmitting: boolean;
  isVerificationSent: boolean;
  isVerified: boolean;
  message: string | null;
  focusTrigger: string | null;
}

// 액션 타입
export interface SignupActions {
  // 액션 셋터
  setId: (value: string) => void;
  setNickname: (value: string) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setConfirm: (value: string) => void;
  clearFocus: () => void;
  reset: () => void;

  // 밸리데이션 액션
  validateId: () => boolean;
  validateNickname: () => boolean;
  validateEmail: () => boolean;
  validatePassword: () => boolean;
  validateConfirm: () => boolean;

  // 비즈니스 로직
  checkIdDuplicate: () => Promise<void>;
  checkNicknameDuplicate: () => Promise<void>;
  checkEmailDuplicate: () => Promise<void>;
  sendVerification: () => Promise<boolean>;
  checkVerification: () => Promise<boolean>;
  finalSignup: () => Promise<boolean>;
}

// 전체 스토어 상태 타입
export interface SignupState extends SignupFormData, SignupFormErrors, SignupStatusState, SignupActions {}
/*
  {}는 **"추가할 새로운 내용이 (비어 있다)"
*/
