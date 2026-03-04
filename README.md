# 🛒 Used Market Platform (중고 거래 플랫폼)

사용자 경험(UX)과 코드의 유지보수성을 최우선으로 고려하여 개발한 **실시간 중고 거래 웹 애플리케이션**입니다.  
React 최신 버전(v19)과 Firebase Serverless 환경을 기반으로, 상품의 등록/조회부터 구매자와 판매자 간의 실시간 채팅까지 중고 거래의 핵심 비즈니스 로직을 완벽하게 구현했습니다.

## 🔗 배포 링크

**[🚀 배포 사이트 바로가기 (Netlify)](https://used-shopping.netlify.app)**  
_(참고: 테스트 계정을 제공하거나, 직접 회원가입하여 기능을 체험할 수 있습니다.)_

---

## 📱 Screen Shots (구현 화면)

|                            메인 화면 (Home)                            |                           상품 등록 (Register)                           |
| :--------------------------------------------------------------------: | :----------------------------------------------------------------------: |
|  <img src="readmeSC/메인%20화면.png" alt="Home Screen" width="100%">   | <img src="readmeSC/상품%20등록.png" alt="Product Register" width="100%"> |
|                         **상품 상세 (Detail)**                         |                          **실시간 채팅 (Chat)**                          |
| <img src="readmeSC/상품%20상세.png" alt="Product Detail" width="100%"> |   <img src="readmeSC/실시간%20채팅.png" alt="Chat Modal" width="100%">   |

---

## 🛠 주요 기술 스택 사용처 및 핵심 로직 (Tech Stack & Core Logic)

현업에서 가장 많이 사용되는 **상태 관리의 분리(서버 상태 vs 클라이언트 상태)** 패턴을 직접 프로젝트에 적용하여 직관적인 구조를 제안하고, 보일러플레이트를 줄이는 데 초점을 두었습니다.

### 1. TanStack React Query (v5) - 서버 상태 관리 및 캐싱

Firebase(DB)에서 상품 목록, 상세 정보 등을 가져오는 **모든 비동기 서버 통신 로직**을 관리합니다.
`main.tsx`의 최상단 루트에서 `QueryClientProvider`를 전역 주입하여, 하위 모든 컴포넌트에서 선언적으로 데이터 페칭(로딩/에러 처리 포함)과 캐싱을 사용할 수 있도록 구성했습니다.

<details open>
<summary><b>💬 실제 구현 코드 보기</b></summary>
<div markdown="1">

**`src/main.tsx` (Provider 세팅)**

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";

// QueryClient 인스턴스 생성
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* React Query 전역 상태 공급자 */}
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
```

**`src/hooks/useProducts.ts` (API 호출 및 캐시 적용)**

```typescript
import { useQuery } from "@tanstack/react-query";
import { getProducts, searchProducts } from "../sdk/firebase";

export function useProducts({ category, searchTerm }) {
  return useQuery({
    queryKey: ["PRODUCTS", category, searchTerm],
    queryFn: async () => {
      // 검색어가 있으면 검색 쿼리, 없으면 카테고리별 전체 조회
      if (searchTerm.trim()) return await searchProducts(searchTerm);
      return await getProducts(category === "ALL" ? undefined : category);
    },
    staleTime: 1000 * 60, // 1분간 캐시 유지 (불필요한 Firestore Read 비용 및 렌더링 방지)
  });
}
```

</div>
</details>

---

### 2. Zustand - 클라이언트 UI 전역 상태 관리

React Query가 담당하는 '서버 데이터'를 제외하고, 순수하게 클라이언트단에서만 변하는 검색 필터 카테고리(`useProductFilterStore`), 알림 토스트(`useToastStore`), 모달 상태 등을 가볍고 직관적으로 관리하기 위해 도입했습니다.

<details open>
<summary><b>💬 실제 구현 코드 보기</b></summary>
<div markdown="1">

**`src/store/useProductFilterStore.ts` (Store 정의)**

```typescript
import { create } from "zustand";

interface ProductFilterState {
  category: string;
  searchTerm: string;
  setCategory: (category: string) => void;
  setSearchTerm: (term: string) => void;
}

// Redux 대비 보일러플레이트 없는 깔끔한 상태 정의
export const useProductFilterStore = create<ProductFilterState>((set) => ({
  category: "ALL",
  searchTerm: "",
  setCategory: (category) => set({ category }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
}));
```

**`src/pages/Home.tsx` (컴포넌트에서의 사용 예)**

```tsx
import { useProductFilterStore } from "../store/useProductFilterStore";
import { useProducts } from "../hooks/useProducts";

export default function Home() {
  // Zustand 스토어에서 전역 필터/검색어 상태 구조분해할당
  const { category, searchTerm: globalSearchTerm, setCategory } = useProductFilterStore();

  // Zustand 값을 실시간 반영하는 React Query 훅 연결
  const { data: products = [] } = useProducts({ category, searchTerm: globalSearchTerm });

  return (
    <div>
      <CategorySidebar current={category} onChange={setCategory} />
      <ProductList items={products} />
    </div>
  );
}
```

</div>
</details>

---

### 3. Firebase (Auth & Firestore 실시간 통신)

백엔드 서버를 직접 구축하는 데 소요되는 인프라 비용과 시간을 절약하고, 클라이언트-사이드 로직 개발에 온전하게 집중하기 위해 Firebase 생태계를 활용했습니다. 특히 **채팅 기능**의 경우 별도의 WebSocket 구축 없이 Firestore의 `onSnapshot`을 통해 실시간 양방향 통신을 구현했습니다.

<details open>
<summary><b>💬 실제 구현 코드 보기</b></summary>
<div markdown="1">

**`src/App.tsx` (사용자 인증 Observer 패턴)**

```tsx
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./sdk/firebase";
import { useAuthStore } from "./store/useAuthStore";

function App() {
  const { setUser } = useAuthStore(); // 유저 상태 스토어

  // Firebase 옵저버를 통해 앱 첫 진입, 새로고침 시 로그인 유지 상태를 UI와 동기화
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); // 메모리 누수 방지
  }, [setUser]);

  // ...
}
```

**`src/sdk/firebase.ts` (Firestore onSnapshot 실시간 채팅)**

```typescript
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

// 폴링(Polling) 기법 등 없이 데이터베이스 변경 사항을 즉시 푸시받는 로직
export function subscribeToMessages(chatId: string, callback: (msgs: ChatMessage[]) => void) {
  const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc"));

  // Firestore onSnapshot: 새로운 메시지가 DB에 쌓일 때마다 리스너가 감지하고 즉시 콜백을 반환
  return onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ChatMessage[];

    callback(msgs); // React Local State 업데이트로 매끄러운 뷰 렌더링
  });
}
```

</div>
</details>

---

### 4. RESTful 아키텍처 관점의 Data Access Layer 분리 (유연성 확보)

Firebase와 같은 서버리스 백엔드를 사용하더라도, 프론트엔드의 화면 컴포넌트나 비즈니스 로직(React Query 등)에서 Firebase의 SDK(예: `getDoc`, `collection`)를 직접 호출하여 종속성을 만들지 않았습니다.
대신 별도의 `src/sdk/firebase.ts` 파일(Data Access Layer)에 **REST API의 CRUD 성격을 갖는 함수(Endpoint 역할)들을 미리 정의**하여 결합도를 낮추었습니다.
향후 실무 환경에서 별도의 백엔드 서버(Node.js, Spring Boot 등)로 마이그레이션하게 되더라도, 화면의 데이터 패칭 구조는 손대지 않고 ഈ `firebase.ts` 내부만 `axios`나 `fetch`를 이용해 실제 RESTful API와 통신하도록 바꿔 끼우면 되는 **확장성 높은 아키텍처**입니다.

<details open>
<summary><b>💬 실제 구현 코드 보기</b></summary>
<div markdown="1">

**`src/sdk/firebase.ts` (RESTful 개념을 적용한 데이터 통신 API 구조)**

```typescript
import { collection, query, where, getDocs, getDoc, doc, addDoc } from "firebase/firestore";

// [GET] /products : 필터 조건에 따른 전체 상품 목록 리소스를 요청
export async function getProducts(category?: string) {
  const q = category && category !== "ALL" ? query(collection(db, "products"), where("category", "==", category)) : collection(db, "products");

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// [GET] /products/:id : 식별자를 통한 단일 상품 상세 정보 데이터 조회
export async function getProduct(id: string) {
  const docRef = doc(db, "products", id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error("Product not found");
  return { id: docSnap.id, ...docSnap.data() };
}

// [POST] /products : 새로운 상품 리소스 생성 통신
export async function addProduct(productData: Omit<Product, "id">) {
  return await addDoc(collection(db, "products"), productData);
}
```

</div>
</details>

---

## 🚀 주요 기능 요약 (Features)

1. **사용자 환경 및 인증 (Auth)**
   - 비밀번호 정규식 등 폼 유효성 검증
   - 옵저버 패턴(`onAuthStateChanged`)을 통한 전역 로그인 상태 감지
2. **상품 거래 도메인 (Product Transaction)**
   - 메인 화면 카테고리 기반 필터링 및 키워드 검색
   - 다중 이미지 첨부 및 Firebase Storage 스토리지 병렬 업로드 연동
3. **실시간 채팅망 (Real-time Messaging)**
   - 구매 희망자와 판매자 일대일(1:1) 매칭 채팅방 생성 및 실시간 메세지 업데이트
   - `ChatModal` 형태의 플로팅 UI로 매끄러운 사용자 경험 제공
4. **마이페이지 (My Page Profile)**
   - 내 등록 상품, 관심 상품 여부 등 개인화된 데이터 연동

---

## 📂 프로젝트 도메인 주도 구조 (Directory Tree)

기존 `src/components/` 에 병렬로 컴포넌트를 모아두는 방식을 개선하여, **Home, Login, ProductDetail, MyPage** 등 **도메인(기능)별로 디렉토리를 세분화**했습니다. 특정 기능 수정 시 관련된 컴포넌트들을 하나의 응집도 높은 공간에서 추적할 수 있어 생산성이 크게 향상되었습니다.

```bash
src/
├── App.tsx, main.tsx      # Entry Point 및 라우트, 글로벌 Provider 주입
├── components/            # 도메인별 응집도를 높인 컴포넌트 구조
│   ├── Home/              # 메인 페이지 파트 (검색창, 카테고리, 리스트 등)
│   ├── Login/             # 로그인 기능 (폼, 계정 찾기 모달 등)
│   ├── Signup/            # 회원가입 기능 (입력 필드별 유효성 컴포넌트)
│   ├── ProductDetail/     # 상품 상세 페이지 파트
│   ├── MyPage/            # 마이페이지 연관 기능
│   └── (공통)Modal, Toast # 도메인 경계를 넘나드는 공통 레이아웃 컴포넌트
├── hooks/                 # 비즈니스 추상화 로직 (useProducts, useForm 등)
├── store/                 # Zustand 전역 저장소 (Client UI, Filter State)
├── css/                   # 스코프 분리가 명확한 모듈형 / 공통 CSS
├── pages/                 # React Router 기준의 메인 페이지 뷰
└── sdk/                   # Firebase 초기화 및 인스턴스 (firebase.ts)
```
