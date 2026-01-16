# Used Shop (Vite + React)

간단한 학습용 중고 장터 데모 프로젝트입니다.

---

## 🛠️ 사용 기술 스택

- Vite + TypeScript + React 19 (SWC 플러그인)
- React Router v7
- Zustand 전역 상태관리
- Firebase Authentication + Firestore (회원가입/로그인, 프로필 저장)
- ESLint (React Hooks, React Refresh), TypeScript
- CSS (프로젝트 내 커스텀 스타일 시트)

---

## 🚦 Router (리액트 라우터) 설명

이 프로젝트는 `react-router-dom`을 사용하여 페이지 간 탐색을 구현합니다. 주요 라우트는 다음과 같습니다.

- `/` — **Home** (메인 페이지)
- `/products` — **Products** (상품 목록)
- `/about` — **About** (소개 페이지)
- 그 외 — **404 (NotFound)**

### 사용 방법

1. 개발 서버 실행: `npm run dev`
2. 브라우저에서 `http://localhost:5173` 열기
3. 상단 네비게이션(또는 주소창)으로 경로 이동

### 구현 포인트

- `src/main.tsx`에서 앱을 `BrowserRouter`로 감싸 라우팅을 활성화합니다:

```tsx
import { BrowserRouter } from "react-router-dom";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

- `src/App.tsx`는 네비게이션과 `Routes`/`Route`를 정의합니다:

```tsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/products" element={<Products />} />
  <Route path="/about" element={<About />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

- 라우트에서 사용되는 간단한 페이지 컴포넌트는 `src/pages/`에 위치합니다.

---

## 💡 팁

- 라우트가 동적 경로(예: `/products/:id`)가 필요한 경우 `Route`에 해당 경로를 추가하고 `useParams()`로 파라미터를 읽습니다.
- 테스트 또는 샘플 데이터가 필요하면 간단한 REST 호출을 추가하거나 로컬 더미 데이터를 사용할 수 있습니다.

---

## 🧠 State management (Zustand)

이 프로젝트는 간단한 전역 상태 관리를 위해 **Zustand**를 사용합니다.

- 설치: `npm install zustand`
- 예시 스토어 파일: `src/store/useStore.ts`
- 예시 사용 컴포넌트: `src/components/Counter.tsx`

간단한 사용 예시:

```ts
// src/store/useStore.ts
import { create } from "zustand";

export const useStore = create((set) => ({
  count: 0,
  inc: () => set((s) => ({ count: s.count + 1 })),
  dec: () => set((s) => ({ count: s.count - 1 })),
}));
```

```tsx
// 컴포넌트에서 사용
const count = useStore((s) => s.count);
const inc = useStore((s) => s.inc);
```

- 추가 팁: `persist`, `devtools` 미들웨어를 사용해 상태를 로컬 스토리지에 저장하거나 디버깅을 쉽게 할 수 있습니다.

---

## 🔐 Firebase 연동 (회원가입 / 로그인)

간단한 예시로 Firebase Authentication + Firestore를 사용해 회원가입/로그인을 처리합니다. **중요:** 절대 비밀번호를 Firestore에 평문으로 저장하지 마세요. 대신 Firebase Auth를 사용하고, 추가 프로필 정보만 Firestore에 저장합니다.

1. 설치:

```bash
npm install firebase
```

2. 환경변수

Vite 환경 변수에 아래 값을 추가하세요 (실제 값은 Firebase 콘솔에서 복사):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

3. 초기화 파일: `src/firebase.ts` (이미 프로젝트에 추가되어 있습니다)

4. 사용 예: `src/pages/Signup.tsx`에서 `registerUser`를 호출하여 Auth와 Firestore에 유저 프로필을 생성합니다. `src/pages/Login.tsx`는 `loginUser`를 사용합니다.

---

즐겁게 학습하세요! ✨
