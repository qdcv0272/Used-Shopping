import type { FormEvent } from "react";

type FieldsProps = {
  id: string;
  password: string;
  onIdChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
};

export default function Fields({ id, password, onIdChange, onPasswordChange, onSubmit }: FieldsProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="login-id">아이디</label>
        <input id="login-id" name="id" type="text" placeholder="아이디를 입력하세요" value={id} onChange={(e) => onIdChange(e.target.value)} className="login-input" />
      </div>

      <div className="form-group">
        <label htmlFor="login-password">비밀번호</label>
        <input id="login-password" name="password" type="password" placeholder="비밀번호를 입력하세요" value={password} onChange={(e) => onPasswordChange(e.target.value)} className="login-input" />
      </div>

      <button type="submit" className="login-btn primary">
        로그인
      </button>
    </form>
  );
}
