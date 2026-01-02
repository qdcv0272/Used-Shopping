import { create } from "zustand";

type State = {
  count: number;

  inc: () => void;

  dec: () => void;

  reset: () => void;

  setCount: (n: number) => void;
};

// 스토어 생성: `create`에 상태 초기값과 액션을 정의한 함수를 넘깁니다.
// 액션 내부에서 `set`을 호출해 상태를 변경합니다.
export const useStore = create<State>((set) => ({
  count: 0,

  inc: () => set((s) => ({ count: s.count + 1 })),
  dec: () => set((s) => ({ count: s.count - 1 })),

  reset: () => set({ count: 0 }),

  setCount: (n: number) => set({ count: n }),
}));
