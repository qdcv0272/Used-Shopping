# 🍎 사과 중고 마켓 (Used Shop React) 개발 학습 가이드

이 문서는 프로젝트 코드를 처음부터 끝까지 따라가며 학습할 수 있도록 **기능 개발 순서**대로 정리된 가이드입니다. 각 단계별로 어떤 파일의 어떤 로직을 봐야 하는지 구체적으로 적혀 있습니다.

---

## 🚀 1단계: 프로젝트 설정 및 Firebase 연동

가장 먼저 백엔드 역할을 하는 Firebase를 설정하고 React 앱과 연결하는 단계입니다.

### 1-1. Firebase 설정 파일

- **파일**: [src/firebase.ts](src/firebase.ts)
- **학습 포인트**:
  - `initializeApp`: Firebase 앱 초기화
  - `getAuth`, `getFirestore`, `getStorage`: 인증, DB, 스토리지 인스턴스 추출
  - **핵심 함수**: `uploadImage`, `addProduct`, `getProducts` 등 DB와 통신하는 헬퍼 함수들이 모여 있습니다. 이 파일이 **API 계층** 역할을 합니다.

### 1-2. Entry Point 설정

- **파일**: [src/main.tsx](src/main.tsx)
- **내용**: `BrowserRouter`로 `<App />`을 감싸 라우팅 환경을 구성한 부분 확인.

---

## 🛣️ 2단계: 기본 라우팅 및 전역 레이아웃 (App.tsx)

페이지 이동을 위한 뼈대를 만드는 단계입니다.

### 2-1. 라우트 정의

- **파일**: [src/App.tsx](src/App.tsx)
- **코드 위치**: `Routes` ~ `Route` 컴포넌트 부분
- **내용**:
  - `/` (Home), `/login` (Login), `/products/new` (Register) 등 URL과 컴포넌트 매핑.

### 2-2. 네비게이션 바 (GNB)

- **파일**: [src/App.tsx](src/App.tsx)
- **코드 위치**: `<header>` 내부의 `nav` 태그
- **내용**: `NavLink`를 사용하여 현재 활성화된 페이지 스타일링(`active` 클래스) 처리.

### 2-3. 전역 인증 상태 관리

- **파일**: [src/App.tsx](src/App.tsx)
- **코드 위치**: `useEffect` 내부 `onAuthStateChanged`
- **로직**: Firebase가 알려주는 로그인 상태(`currentUser`)를 감시하여 Navbar의 로그인/로그아웃 버튼을 동적으로 변경.

---

## 🔐 3단계: 회원가입 및 로그인 (Authentication)

사용자를 식별하기 위한 기능 구현입니다.

### 3-1. 회원가입

- **파일**: [src/pages/Signup.tsx](src/pages/Signup.tsx)
- **핵심 로직**:
  - `createUserWithEmailAndPassword`: 이메일/비밀번호로 계정 생성.
  - `updateProfile`: 계정 생성 직후 닉네임 설정.
  - `addUserProfile` (in `firebase.ts`): Firestore `users` 컬렉션에 추가 정보 저장.

### 3-2. 로그인

- **파일**: [src/pages/Login.tsx](src/pages/Login.tsx)
- **핵심 로직**: `signInWithEmailAndPassword` 함수 하나로 처리됨. 성공 시 `navigate('/')`로 메인 이동.

---

## 🏠 4단계: 메인 페이지 및 상품 목록 (Home)

상품을 보여주고 검색하는 핵심 페이지입니다.

### 4-1. 상품 목록 불러오기

- **파일**: [src/pages/Home.tsx](src/pages/Home.tsx)
- **코드 위치**: `useEffect` 내부 `fetchProducts`
- **흐름**:
  1. `category` 상태가 변경될 때마다 실행.
  2. `firebase.ts`의 `getProducts` 호출.
  3. 받아온 데이터를 `state`에 저장하여 화면에 `map`으로 뿌려줌.

### 4-2. 카테고리 애니메이션 (GSAP)

- **파일**: [src/pages/Home.tsx](src/pages/Home.tsx)
- **코드 위치**: `categoryListRef`와 `useLayoutEffect` (또는 `useEffect`)
- **내용**: 카테고리 접기/펼치기 시 `gsap.to`를 이용해 부드러운 높이 조절 애니메이션 구현.

### 4-3. 검색 기능

- **파일**: [src/pages/Home.tsx](src/pages/Home.tsx)
- **메서드**: `handleSearch`
- **로직**: 검색어가 있으면 `searchProducts`(firebase)를 호출하고, 없으면 카테고리별 목록으로 돌아감. UI적으로 카테고리를 선택하면 검색어가 초기화되는 상호작용 포함.

---

## 📷 5단계: 상품 등록 페이지 (ProductRegister)

가장 복잡한 페이지 중 하나로, 이미지 업로드와 폼 처리가 있습니다.

### 5-1. 로그인 체크 (Protected Route)

- **파일**: [src/pages/ProductRegister.tsx](src/pages/ProductRegister.tsx)
- **코드 위치**: `if (!user)` 조건문 (컴포넌트 하단)
- **내용**: 로그인 안 된 사용자에게 리다이렉트 대신 **"로그인이 필요한 서비스입니다"** 안내 UI를 보여주는 패턴 (UX 개선 포인트).

### 5-2. 이미지 드래그 앤 드롭 (GSAP Draggable)

- **파일**: [src/pages/ProductRegister.tsx](src/pages/ProductRegister.tsx)
- **코드 위치**: `useLayoutEffect` 내부 `Draggable.create`
- **로직**: 업로드된 이미지들의 순서를 드래그로 바꿀 수 있게 구현. `hitTest`로 위치 교환 감지.

### 5-3. 데이터 저장

- **파일**: [src/pages/ProductRegister.tsx](src/pages/ProductRegister.tsx)
- **메서드**: `handleSubmit`
- **흐름**:
  1. `uploadImage`로 스토리지에 이미지 저장 후 URL 배열 획득.
  2. `addProduct`로 Firestore에 상품 정보(URL 포함) 저장.

---

## 🔎 6단계: 상품 상세 페이지 (ProductDetail)

개별 상품 정보와 판매자와의 상호작용을 다룹니다.

### 6-1. 데이터 조회

- **파일**: [src/pages/ProductDetail.tsx](src/pages/ProductDetail.tsx)
- **코드 위치**: `useEffect` (id 의존성)
- **내용**: URL 파라미터(`id`)를 이용해 `getProduct` 호출. 판매자 ID로 `getUserProfile`을 추가 호출해 닉네임 표시.

### 6-2. 조회수 증가 (Strict Mode 이슈 해결)

- **파일**: [src/pages/ProductDetail.tsx](src/pages/ProductDetail.tsx)
- **코드 위치**: `processedIdRef` 관련 부분
- **학습 포인트**: React Strict Mode에서 `useEffect`가 두 번 실행되어 조회수가 2씩 올라가는 것을 방지하기 위해 `useRef`로 플래그를 세우는 기법.

### 6-3. 채팅 시작하기

- **파일**: [src/pages/ProductDetail.tsx](src/pages/ProductDetail.tsx)
- **메서드**: `handleChat`
- **로직**: 이미 존재하는 채팅방이 있는지 확인(`startChat` 내부 로직) 후 없으면 생성, 있으면 해당 방 ID를 받아옴.

---

## 👤 7단계: 내 정보 및 채팅 목록 (MyPage)

사용자 개인화 영역입니다.

### 7-1. 데이터 종합 조회

- **파일**: [src/pages/MyPage.tsx](src/pages/MyPage.tsx)
- **코드 위치**: `useEffect` 내부
- **내용**:
  1. 내 프로필 (`getUserProfile`)
  2. 내가 판 물건 (`getProductsBySeller`)
  3. 내 채팅방 목록 (`getMyChats`)
     이 3가지를 한 번에 불러와서 화면에 구성.

### 7-2. 채팅창 모달

- **파일**: [src/components/ChatModal.tsx](src/components/ChatModal.tsx)
- **핵심**: Firestore의 `onSnapshot`을 사용하여 실시간 채팅 구현.
- **로직**: 메시지를 보내면 DB에 쌓이고, 리스너가 변경사항을 감지해 UI를 즉시 업데이트.

---

## 🎨 8단계: 스타일링 (CSS)

- **폴더**: [src/css/](src/css/)
- **주요 파일**:
  - `app.css`: 전체 레이아웃
  - `productRegister.css`: 그리드, 이미지 업로드 스타일
  - `productDetail.css`: 반반 레이아웃 (이미지/정보)
- **학습 포인트**: 단순 CSS 파일 임포트 방식을 사용. 모듈화 하지 않고 전역 스타일로 관리 중.

---

### 💡 공부 팁

- **흐름 파악**: `App.tsx`에서 시작해서 각 페이지(`pages/`)로 들어가는 순서로 코드를 읽으세요.
- **데이터 흐름**: 데이터가 필요할 때마다 `firebase.ts`의 함수를 호출합니다. 이 함수들이 백엔드 API라고 생각하고 분석해보세요.
- **상태 변화**: `useState`가 어디서 선언되고, 사용자가 버튼을 눌렀을 때 어떻게 바뀌는지 추적해보세요.
