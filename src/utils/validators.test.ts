import { describe, it, expect } from "vitest";
import { validateIdFormat, validateNicknameFormat, validateEmailFormat, validatePasswordFormat, validateConfirmFormat } from "../utils/validators";

// ─────────────────────────────────────────────
// 아이디 검사
// ─────────────────────────────────────────────
describe("validateIdFormat", () => {
  it("빈 값이면 에러 메시지를 반환한다", () => {
    expect(validateIdFormat("")).toBe("아이디를 입력하세요.");
  });

  it("특수문자가 포함되면 에러 메시지를 반환한다", () => {
    expect(validateIdFormat("abc!123")).toBe("아이디는 영문/숫자만 가능합니다. 특수문자는 사용할 수 없습니다.");
  });

  it("영문이 4자 미만이면 에러 메시지를 반환한다", () => {
    expect(validateIdFormat("ab1234")).toBe("영문 4자 이상 포함해야 합니다.");
  });

  it("영문 4자 이상 + 숫자 조합이면 null을 반환한다", () => {
    expect(validateIdFormat("abcd1234")).toBeNull();
  });

  it("영문만도 4자 이상이면 null을 반환한다", () => {
    expect(validateIdFormat("hello")).toBeNull();
  });
});

// ─────────────────────────────────────────────
// 닉네임 검사
// ─────────────────────────────────────────────
describe("validateNicknameFormat", () => {
  it("빈 값이면 에러 메시지를 반환한다", () => {
    expect(validateNicknameFormat("")).toBe("닉네임을 입력하세요.");
  });

  it("1자이면 에러 메시지를 반환한다", () => {
    expect(validateNicknameFormat("a")).toBe("닉네임은 2자 이상이어야 합니다.");
  });

  it("2자 이상이면 null을 반환한다", () => {
    expect(validateNicknameFormat("짱구")).toBeNull();
  });
});

// ─────────────────────────────────────────────
// 이메일 검사
// ─────────────────────────────────────────────
describe("validateEmailFormat", () => {
  it("빈 값이면 에러 메시지를 반환한다", () => {
    expect(validateEmailFormat("")).toBe("이메일을 입력하세요.");
  });

  it("@ 없는 이메일이면 에러 메시지를 반환한다", () => {
    expect(validateEmailFormat("invalidemail.com")).toBe("유효한 이메일을 입력하세요.");
  });

  it("도메인이 없는 이메일이면 에러 메시지를 반환한다", () => {
    expect(validateEmailFormat("user@")).toBe("유효한 이메일을 입력하세요.");
  });

  it("올바른 이메일이면 null을 반환한다", () => {
    expect(validateEmailFormat("user@example.com")).toBeNull();
  });
});

// ─────────────────────────────────────────────
// 비밀번호 검사
// ─────────────────────────────────────────────
describe("validatePasswordFormat", () => {
  it("빈 값이면 에러 메시지를 반환한다", () => {
    expect(validatePasswordFormat("")).toBe("비밀번호를 입력하세요.");
  });

  it("6자 미만이면 에러 메시지를 반환한다", () => {
    expect(validatePasswordFormat("Aa1!")).toBe("비밀번호는 최소 6자 이상이어야 합니다.");
  });

  it("소문자만 있으면 에러 메시지를 반환한다", () => {
    expect(validatePasswordFormat("abcdefg")).toBe("비밀번호는 대문자·소문자·숫자·특수문자를 모두 포함해야 합니다.");
  });

  it("대문자·소문자·숫자·특수문자 모두 포함하면 null을 반환한다", () => {
    expect(validatePasswordFormat("Abcdef1!")).toBeNull();
  });
});

// ─────────────────────────────────────────────
// 비밀번호 확인 검사
// ─────────────────────────────────────────────
describe("validateConfirmFormat", () => {
  it("비밀번호와 일치하지 않으면 에러 메시지를 반환한다", () => {
    expect(validateConfirmFormat("different!", "Abcdef1!")).toBe("비밀번호가 일치하지 않습니다.");
  });

  it("비밀번호와 일치하면 null을 반환한다", () => {
    expect(validateConfirmFormat("Abcdef1!", "Abcdef1!")).toBeNull();
  });
});
