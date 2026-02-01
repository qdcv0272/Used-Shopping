import { useState, useCallback } from "react";

// 제네릭 타입 T는 폼 데이터의 초기값 객체 형태입니다.
export function useForm<T>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);

  // 입력 변경 핸들러 (useCallback으로 최적화)
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  // 폼 초기화
  const resetForm = useCallback(() => {
    setValues(initialValues);
  }, [initialValues]);

  return { values, handleChange, resetForm, setValues };
}
