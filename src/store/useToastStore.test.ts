import { describe, it, expect, beforeEach, vi } from "vitest";
import { useToastStore } from "../store/useToastStore";

// 각 테스트 전 스토어 상태를 초기화
beforeEach(() => {
  useToastStore.setState({ toasts: [] });
  vi.useFakeTimers();
});

describe("useToastStore", () => {
  it("초기 상태는 빈 토스트 배열이다", () => {
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it("addToast로 토스트를 추가할 수 있다", () => {
    useToastStore.getState().addToast("저장되었습니다.", "success");
    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe("저장되었습니다.");
    expect(toasts[0].type).toBe("success");
  });

  it("type을 지정하지 않으면 기본값 info가 적용된다", () => {
    useToastStore.getState().addToast("알림 메시지");
    expect(useToastStore.getState().toasts[0].type).toBe("info");
  });

  it("여러 토스트를 추가하면 전부 쌓인다", () => {
    useToastStore.getState().addToast("첫 번째");
    useToastStore.getState().addToast("두 번째");
    expect(useToastStore.getState().toasts).toHaveLength(2);
  });

  it("removeToast로 특정 토스트를 제거할 수 있다", () => {
    useToastStore.getState().addToast("삭제 대상");
    const id = useToastStore.getState().toasts[0].id;
    useToastStore.getState().removeToast(id);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it("duration 이후 토스트가 자동 제거된다", () => {
    useToastStore.getState().addToast("자동 제거", "info", 3000);
    expect(useToastStore.getState().toasts).toHaveLength(1);

    vi.advanceTimersByTime(3000);

    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it("duration이 0이면 자동으로 제거되지 않는다", () => {
    useToastStore.getState().addToast("유지 토스트", "info", 0);

    vi.advanceTimersByTime(9999);

    expect(useToastStore.getState().toasts).toHaveLength(1);
  });
});
