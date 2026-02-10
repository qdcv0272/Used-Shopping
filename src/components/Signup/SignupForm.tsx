import { IdField } from "./Fields/IdField";
import { NicknameField } from "./Fields/NicknameField";
import { EmailField } from "./Fields/EmailField";
import { PasswordField } from "./Fields/PasswordField";
import { ConfirmField } from "./Fields/ConfirmField";

export default function SignupForm() {
  return (
    <>
      <IdField />
      <NicknameField />
      <EmailField />
      <PasswordField />
      <ConfirmField />
    </>
  );
}
