export const validateIdFormat = (value: string): string | null => {
  if (!value) return "아이디를 입력하세요.";
  if (!/^[A-Za-z0-9]+$/.test(value)) {
    return "아이디는 영문/숫자만 가능합니다. 특수문자는 사용할 수 없습니다.";
  }
  const letters = (value.match(/[A-Za-z]/g) || []).length;
  if (letters < 4) {
    return "영문 4자 이상 포함해야 합니다.";
  }
  return null;
};

export const validateNicknameFormat = (value: string): string | null => {
  if (!value) return "닉네임을 입력하세요.";
  if (value.length < 2) {
    return "닉네임은 2자 이상이어야 합니다.";
  }
  return null;
};

export const validateEmailFormat = (value: string): string | null => {
  if (!value) return "이메일을 입력하세요.";
  if (!/^\S+@\S+\.\S+$/.test(value)) {
    return "유효한 이메일을 입력하세요.";
  }
  return null;
};

export const validatePasswordFormat = (value: string): string | null => {
  if (!value) return "비밀번호를 입력하세요.";
  if (value.length < 6) {
    return "비밀번호는 최소 6자 이상이어야 합니다.";
  }
  const hasLower = /[a-z]/.test(value);
  const hasUpper = /[A-Z]/.test(value);
  const hasDigit = /\d/.test(value);
  const hasSpecial = /[^A-Za-z0-9]/.test(value);
  if (!(hasLower && hasUpper && hasDigit && hasSpecial)) {
    return "비밀번호는 대문자·소문자·숫자·특수문자를 모두 포함해야 합니다.";
  }
  return null;
};

export const validateConfirmFormat = (value: string, password: string): string | null => {
  if (value !== password) {
    return "비밀번호가 일치하지 않습니다.";
  }
  return null;
};
