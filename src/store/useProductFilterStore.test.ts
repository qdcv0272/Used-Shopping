import { describe, it, expect, beforeEach } from "vitest";
import { useProductFilterStore } from "../store/useProductFilterStore";
import { ALL_CATEGORY } from "../constants";

// 각 테스트 전 스토어 상태를 초기화
beforeEach(() => {
  useProductFilterStore.getState().resetFilters();
});

describe("useProductFilterStore", () => {
  it("초기 상태는 전체 카테고리, 빈 검색어다", () => {
    const { category, searchTerm } = useProductFilterStore.getState();
    expect(category).toBe(ALL_CATEGORY);
    expect(searchTerm).toBe("");
  });

  it("setCategory로 카테고리를 변경할 수 있다", () => {
    useProductFilterStore.getState().setCategory("디지털기기");
    expect(useProductFilterStore.getState().category).toBe("디지털기기");
  });

  it("setSearchTerm으로 검색어를 변경할 수 있다", () => {
    useProductFilterStore.getState().setSearchTerm("아이폰");
    expect(useProductFilterStore.getState().searchTerm).toBe("아이폰");
  });

  it("resetFilters를 호출하면 초기 상태로 돌아온다", () => {
    useProductFilterStore.getState().setCategory("도서/티켓/음반");
    useProductFilterStore.getState().setSearchTerm("자바스크립트");

    useProductFilterStore.getState().resetFilters();

    const { category, searchTerm } = useProductFilterStore.getState();
    expect(category).toBe(ALL_CATEGORY);
    expect(searchTerm).toBe("");
  });
});
