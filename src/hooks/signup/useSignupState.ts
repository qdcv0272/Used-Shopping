import { useState, useRef, useEffect } from "react";
import type { SignupValues, SignupErrors, SignupChecks } from "./types";

export function useSignupState() {
  const [values, setValues] = useState<SignupValues>({
    id: "",
    nickname: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [errors, setErrors] = useState<SignupErrors>({
    id: null,
    nickname: null,
    email: null,
    password: null,
    confirm: null,
  });

  const [checks, setChecks] = useState<SignupChecks>({
    isIdChecked: false,
    idCheckMessage: null,
    isNicknameChecked: false,
    nicknameCheckMessage: null,
  });

  const idRef = useRef<HTMLInputElement>(null);
  const nicknameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  const refs = {
    idRef,
    nicknameRef,
    emailRef,
    passwordRef,
    confirmRef,
  };

  useEffect(() => {
    idRef.current?.focus();
  }, []);

  const setValue = (field: keyof SignupValues) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const setError = (field: keyof SignupErrors) => (error: string | null) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const setCheck =
    <K extends keyof SignupChecks>(field: K) =>
    (value: SignupChecks[K]) => {
      setChecks((prev) => ({ ...prev, [field]: value }));
    };

  return {
    values,
    errors,
    checks,
    refs,
    setValue,
    setError,
    setCheck,
    setValues, // Exposed for direct manipulation if needed
    setErrors,
    setChecks,
  };
}
