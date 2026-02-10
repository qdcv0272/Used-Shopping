import { create, type StoreApi } from "zustand";
import { devtools } from "zustand/middleware";
import { validateIdFormat, validateNicknameFormat, validateEmailFormat, validatePasswordFormat, validateConfirmFormat } from "../utils/validators";
import { auth, createAuthUser, checkEmailVerified, saveUserProfile, checkFieldDuplicate } from "../sdk/firebase";
import { signOut } from "firebase/auth";
import type { SignupState } from "./signupTypes";

// ------------------------------------------------------------------
// 초기 상태 정의 (Initial State)
// ------------------------------------------------------------------

// 폼 필드 초기값
const initialFormState = {
  id: "",
  nickname: "",
  email: "",
  password: "",
  confirm: "",
};

// 폼 에러 초기값
const initialErrorState = {
  errors: {
    id: null,
    nickname: null,
    email: null,
    password: null,
    confirm: null,
  },
};

// 중복 확인 및 상태 초기값
const initialCheckState = {
  isIdChecked: false,
  idCheckMessage: null,
  isNicknameChecked: false,
  nicknameCheckMessage: null,
  isEmailChecked: false,
  emailCheckMessage: null,
};

// 진행 상태 초기값
const initialStatusState = {
  isSubmitting: false,
  isVerificationSent: false,
  isVerified: false,
  message: null,
  focusTrigger: null,
};

// ------------------------------------------------------------------
// 스토어 생성
// ------------------------------------------------------------------
export const useSignupStore = create<SignupState>()(
  devtools((set, get) => ({
    // 1. 초기값 주입
    ...initialFormState,
    ...initialErrorState,
    ...initialCheckState,
    ...initialStatusState,

    // 2. 간단한 값 변경 (Setters)

    // 아이디 셋터
    setId: (id) =>
      set((state) => ({
        id,
        isIdChecked: false,
        idCheckMessage: null,
        errors: { ...state.errors, id: state.errors.id ? validateIdFormat(id) : null },
      })),

    // 닉네임 셋터
    setNickname: (nickname) =>
      set((state) => ({
        nickname,
        isNicknameChecked: false,
        nicknameCheckMessage: null,
        errors: { ...state.errors, nickname: state.errors.nickname ? validateNicknameFormat(nickname) : null },
      })),

    // 이메일 셋터
    setEmail: (email) =>
      set((state) => ({
        email,
        isEmailChecked: false,
        emailCheckMessage: null,
        errors: { ...state.errors, email: state.errors.email ? validateEmailFormat(email) : null },
      })),

    // 비밀번호 셋터
    setPassword: (password) =>
      set((state) => ({
        password,
        errors: {
          ...state.errors,
          password: state.errors.password ? validatePasswordFormat(password) : null,
          confirm: state.confirm ? validateConfirmFormat(state.confirm, password) : state.errors.confirm,
        },
      })),

    // 비밀번호 확인 셋터
    setConfirm: (confirm) =>
      set((state) => ({
        confirm,
        errors: { ...state.errors, confirm: state.errors.confirm ? validateConfirmFormat(confirm, state.password) : null },
      })),

    // 포커스 트리거 클리어
    clearFocus: () => set({ focusTrigger: null }),

    // 상태 초기화
    reset: () => {
      set({
        ...initialFormState,
        ...initialErrorState,
        ...initialCheckState,
        ...initialStatusState,
      });
    },

    // 3. 유효성 검사 (Validators)
    validateId: () => {
      const { id } = get();
      const error = validateIdFormat(id);
      set((state) => ({ errors: { ...state.errors, id: error } }));
      return !error;
    },
    validateNickname: () => {
      const { nickname } = get();
      const error = validateNicknameFormat(nickname);
      set((state) => ({ errors: { ...state.errors, nickname: error } }));
      return !error;
    },
    validateEmail: () => {
      const { email } = get();
      const error = validateEmailFormat(email);
      set((state) => ({ errors: { ...state.errors, email: error } }));
      return !error;
    },
    validatePassword: () => {
      const { password } = get();
      const error = validatePasswordFormat(password);
      set((state) => ({ errors: { ...state.errors, password: error } }));
      return !error;
    },
    validateConfirm: () => {
      const { confirm, password } = get();
      const error = validateConfirmFormat(confirm, password);
      set((state) => ({ errors: { ...state.errors, confirm: error } }));
      return !error;
    },

    // 4. 비즈니스 로직 (Business Logic)

    // 아이디 중복 확인
    checkIdDuplicate: async () => {
      const { id, validateId } = get();
      if (!validateId()) return;

      set({ idCheckMessage: "중복 확인 중입니다..." });
      try {
        const isDuplicate = await checkFieldDuplicate("id", id);
        if (isDuplicate) {
          set((state) => ({ idCheckMessage: null, errors: { ...state.errors, id: "이미 사용 중인 아이디입니다." } }));
        } else {
          set({ isIdChecked: true, idCheckMessage: "사용 가능한 아이디입니다." });
        }
      } catch (error) {
        console.error(error);
        set((state) => ({ idCheckMessage: null, errors: { ...state.errors, id: "중복 확인 중 오류가 발생했습니다." } }));
      }
    },

    // 닉네임 중복 확인
    checkNicknameDuplicate: async () => {
      const { nickname, validateNickname } = get();
      if (!validateNickname()) return;

      set({ nicknameCheckMessage: "중복 확인 중입니다..." });
      try {
        const isDuplicate = await checkFieldDuplicate("nickname", nickname);
        if (isDuplicate) {
          set((state) => ({ nicknameCheckMessage: null, errors: { ...state.errors, nickname: "이미 사용 중인 닉네임입니다." } }));
        } else {
          set({ isNicknameChecked: true, nicknameCheckMessage: "사용 가능한 닉네임입니다." });
        }
      } catch (error) {
        console.error(error);
        set((state) => ({ nicknameCheckMessage: null, errors: { ...state.errors, nickname: "중복 확인 중 오류가 발생했습니다." } }));
      }
    },

    // 이메일 중복 확인
    checkEmailDuplicate: async () => {
      const { email, validateEmail } = get();
      if (!validateEmail()) return;

      set({ emailCheckMessage: "중복 확인 중입니다..." });
      try {
        const isDuplicate = await checkFieldDuplicate("authEmail", email);
        if (isDuplicate) {
          set((state) => ({ emailCheckMessage: null, errors: { ...state.errors, email: "이미 등록된 이메일입니다." } }));
        } else {
          set({ isEmailChecked: true, emailCheckMessage: "사용 가능한 이메일입니다." });
        }
      } catch (error) {
        console.error(error);
        set((state) => ({ emailCheckMessage: null, errors: { ...state.errors, email: "중복 확인 중 오류가 발생했습니다." } }));
      }
    },

    // 이메일 인증 메일 발송
    sendVerification: async () => {
      const { email, password, isIdChecked, isNicknameChecked, isEmailChecked } = get(); // 상태
      const { validateEmail, validatePassword, validateConfirm } = get(); // methods

      if (!isIdChecked) return setMethodError(set, "id", "아이디 중복 확인을 해주세요.");
      if (!isNicknameChecked) return setMethodError(set, "nickname", "닉네임 중복 확인을 해주세요.");
      if (!validateEmail()) return setFocus(set, "email");
      if (!isEmailChecked) return setMethodError(set, "email", "이메일 중복 확인을 해주세요.");
      if (!validatePassword()) return setFocus(set, "password");
      if (!validateConfirm()) return setFocus(set, "confirm");

      set({ isSubmitting: true, message: "인증 메일 발송 중..." });
      try {
        await createAuthUser(email, password);
        set({
          isVerificationSent: true,
          message: "인증 메일이 발송되었습니다.\n메일함에서 인증 링크를 클릭한 후 아래 [인증 완료 확인] 버튼을 눌러주세요.",
        });
        return true;
      } catch (err: unknown) {
        console.error(err);
        const code = (err as { code?: string })?.code;
        const msg = (err as { message?: string })?.message || String(err);
        set({
          message: code === "auth/email-already-in-use" ? "이미 사용 중인 이메일입니다." : "메일 발송 실패: " + msg,
        });
        return false;
      } finally {
        set({ isSubmitting: false });
      }
    },

    // 이메일 인증 확인
    checkVerification: async () => {
      set({ isSubmitting: true });
      try {
        const verified = await checkEmailVerified();
        if (verified) {
          set({ isVerified: true, message: "이메일 인증이 완료되었습니다. [회원가입 완료] 버튼을 눌러주세요." });
          return true;
        } else {
          set({ message: "이메일 인증이 확인되지 않았습니다. 메일의 링크를 클릭하셨나요?" });
          return false;
        }
      } catch (err) {
        console.error(err);
        set({ message: "인증 확인 중 오류 발생" });
        return false;
      } finally {
        set({ isSubmitting: false });
      }
    },

    // 회원가입 최종 완료
    finalSignup: async () => {
      const { isVerified, id, email, nickname } = get();
      if (!isVerified) {
        set({ message: "이메일 인증을 먼저 완료해주세요." });
        return false;
      }
      set({ isSubmitting: true });
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error("로그인된 사용자 정보가 없습니다.");
        await saveUserProfile(uid, id, email, nickname);
        set({ message: "회원가입이 완료되었습니다. 로그인 화면으로 이동합니다." });
        await signOut(auth);
        return true;
      } catch (err: unknown) {
        console.error(err);
        const msg = err instanceof Error ? err.message : String(err);
        set({ message: "회원가입 마무리 중 오류: " + msg });
        return false;
      } finally {
        set({ isSubmitting: false });
      }
    },
  })),
);

// ------------------------------------------------------------------
// 헬퍼 함수 공통 로직
// ------------------------------------------------------------------
type StoreSet = StoreApi<SignupState>["setState"]; // 타입 별칭 정의

// 에러 설정 및 포커스 트리거 설정
function setMethodError(set: StoreSet, field: string, msg: string) {
  set((state) => ({ errors: { ...state.errors, [field]: msg }, focusTrigger: field }));
  return false;
}

// 포커스 트리거 설정
function setFocus(set: StoreSet, field: string) {
  set({ focusTrigger: field });
  return false;
}

// ------------------------------------------------------------------
// Selector 는 필요한 부분만 구독할 수 있게 도와줌
// ------------------------------------------------------------------
export const selectSignupActions = (state: SignupState) => ({
  isVerificationSent: state.isVerificationSent,
  isVerified: state.isVerified,
  isSubmitting: state.isSubmitting,
  sendVerification: state.sendVerification,
  checkVerification: state.checkVerification,
  finalSignup: state.finalSignup,
});
