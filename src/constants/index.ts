export const ALL_CATEGORY = "전체";

export const CATEGORIES = ["디지털기기", "생활가전", "가구/인테리어", "유아동", "생활/가공식품", "여성의류", "남성의류", "스포츠/레저", "게임/취미", "도서/티켓/음반", "식물", "반려동물용품", "기타"] as const;

export const FILTER_CATEGORIES = [ALL_CATEGORY, ...CATEGORIES];

export const QUERY_KEYS = {
  PRODUCTS: "products",
} as const;
