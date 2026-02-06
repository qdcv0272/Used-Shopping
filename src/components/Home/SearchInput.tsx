import React from "react";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export default function SearchInput({ value, onChange, onSubmit }: SearchInputProps) {
  return (
    <form className="search-bar" onSubmit={onSubmit}>
      <button type="button" className="search-dropdown">
        중고거래
      </button>
      <input type="text" className="search-input" placeholder="검색어를 입력해주세요" value={value} onChange={(e) => onChange(e.target.value)} />
      <button type="submit" className="search-btn" aria-label="검색">
        🔍
      </button>
    </form>
  );
}
