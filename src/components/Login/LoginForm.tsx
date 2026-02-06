import Header from "./Form/Header";
import Fields from "./Form/Fields";
import Footer from "./Form/Footer";

type LoginFormProps = {
  id: string;
  password: string;
  message: string | null;
  onIdChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onFindIdClick: () => void;
  onFindPasswordClick: () => void;
};

export default function LoginForm({ id, password, message, onIdChange, onPasswordChange, onSubmit, onFindIdClick, onFindPasswordClick }: LoginFormProps) {
  return (
    <>
      <Header />
      <Fields id={id} password={password} onIdChange={onIdChange} onPasswordChange={onPasswordChange} onSubmit={onSubmit} />
      <Footer onFindIdClick={onFindIdClick} onFindPasswordClick={onFindPasswordClick} />
      {message && <div className="login-message-box">{message}</div>}
    </>
  );
}
