import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useForm } from "../hooks/useForm";

describe("useForm", () => {
  it("초기값이 values에 반영된다", () => {
    const { result } = renderHook(() => useForm({ name: "", price: "" }));
    expect(result.current.values).toEqual({ name: "", price: "" });
  });

  it("handleChange로 특정 필드 값을 변경할 수 있다", () => {
    const { result } = renderHook(() => useForm({ name: "", price: "" }));

    act(() => {
      result.current.handleChange({
        target: { name: "name", value: "맥북" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.values.name).toBe("맥북");
    // 나머지 필드는 그대로
    expect(result.current.values.price).toBe("");
  });

  it("한 필드 변경이 다른 필드에 영향을 주지 않는다", () => {
    const { result } = renderHook(() => useForm({ name: "초기값", price: "10000" }));

    act(() => {
      result.current.handleChange({
        target: { name: "price", value: "20000" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.values.name).toBe("초기값");
    expect(result.current.values.price).toBe("20000");
  });

  it("resetForm을 호출하면 초기값으로 리셋된다", () => {
    const { result } = renderHook(() => useForm({ name: "", price: "" }));

    act(() => {
      result.current.handleChange({
        target: { name: "name", value: "아이패드" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.values).toEqual({ name: "", price: "" });
  });

  it("setValues로 여러 필드를 한번에 변경할 수 있다", () => {
    const { result } = renderHook(() => useForm({ name: "", price: "" }));

    act(() => {
      result.current.setValues({ name: "갤럭시", price: "50000" });
    });

    expect(result.current.values).toEqual({ name: "갤럭시", price: "50000" });
  });
});
