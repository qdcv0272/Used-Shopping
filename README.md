# 🛒 Used Market Platform (중고 거래 플랫폼)

React와 Firebase를 활용하여 구축한 **실시간 중고 거래 웹 애플리케이션**입니다.  
사용자 인증부터 상품 등록, 그리고 구매자와 판매자 간의 실시간 채팅까지 중고 거래에 필요한 핵심 기능을 구현했습니다.

## 🔗 배포 링크

**[🚀 배포 사이트 바로가기 (Netlify)](https://used-shopping.netlify.app)**
_(참고: 테스트 계정을 제공하거나, 직접 회원가입하여 기능을 체험할 수 있습니다.)_

---

## � Screen Shots

|                            메인 화면 (Home)                            |                           상품 등록 (Register)                           |
| :--------------------------------------------------------------------: | :----------------------------------------------------------------------: |
|  <img src="readmeSC/메인%20화면.png" alt="Home Screen" width="100%">   | <img src="readmeSC/상품%20등록.png" alt="Product Register" width="100%"> |
|                         **상품 상세 (Detail)**                         |                          **실시간 채팅 (Chat)**                          |
| <img src="readmeSC/상품%20상세.png" alt="Product Detail" width="100%"> |   <img src="readmeSC/실시간%20채팅.png" alt="Chat Modal" width="100%">   |

---

## �🛠 Tech Stack

### Frontend

<img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=React&logoColor=black"> <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=white"> <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=Vite&logoColor=white"> <img src="https://img.shields.io/badge/Zustand-orange?style=for-the-badge&logo=R&logoColor=white">

### Backend & Database (Serverless)

<img src="https://img.shields.io/badge/Firebase_Auth-FFCA28?style=for-the-badge&logo=Firebase&logoColor=black"> <img src="https://img.shields.io/badge/Firebase_Firestore-FFCA28?style=for-the-badge&logo=Firebase&logoColor=black"> <img src="https://img.shields.io/badge/Firebase_Storage-FFCA28?style=for-the-badge&logo=Firebase&logoColor=black">

### Deployment

<img src="https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=Netlify&logoColor=white">

---

## 💡 주요 기능 및 동작 원리

### 1. 사용자 인증 (Authentication)

- **기능**: 회원가입, 로그인, 로그아웃 (세션 지속)
- **구현**: `Firebase Auth`의 `onAuthStateChanged`를 사용하여 유저의 로그인 상태를 실시간으로 감지하고 관리합니다.

```tsx
// src/App.tsx
useEffect(() => {
  // 앱 실행 시 로그인 상태 변화 감지
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser); // 상태 업데이트
  });
  // 컴포넌트 언마운트 시 구독 해제
  return () => unsubscribe();
}, []);
```

### 2. 상품 관리 (Product Management)

- **기능**: 상품 등록 시 다중 이미지 업로드 및 상품 정보 저장
- **구현**: 이미지는 `Storage`에 업로드하여 URL을 받고, 나머지 정보와 함께 `Firestore`에 저장하는 2단계 프로세스로 동작합니다.

```tsx
// src/pages/ProductRegister.tsx
const handleSubmit = async () => {
  // 1. 선택된 이미지들을 Storage에 병렬 업로드
  const uploadedImageUrls = await Promise.all(
    images.map((img) => uploadImage(img)),
  );

  // 2. 업로드된 URL과 상품 정보를 Firestore에 저장
  await addProduct({
    title,
    price: Number(price.replace(/,/g, "")),
    category,
    images: uploadedImageUrls, // 이미지 URL 배열 저장
    sellerId: user.uid,
    createdAt: Date.now(),
  });
};
```

### 3. 실시간 채팅 (Real-time Chat)

- **기능**: 새로고침 없는 실시간 1:1 메시지 전송
- **구현**: `Firestore`의 `onSnapshot` 리스너를 사용하여 DB 데이터가 변경될 때마다(메시지 수신 시) **즉시 UI를 업데이트**합니다.

```tsx
// src/firebase.ts
export function subscribeToMessages(chatId, callback) {
  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("createdAt", "asc"),
  );

  // 스냅샷 리스너: DB에 변경사항(새 메시지)이 생기면 즉시 실행됨
  return onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(msgs); // React 상태 업데이트 함수 호출
  });
}
```

---

## 📂 폴더 구조 (Folder Structure)

```bash
src/
├── assets/         # 정적 이미지 및 리소스
├── components/     # 재사용 가능한 UI 컴포넌트 (Auth, Modal, Chat 등)
├── css/            # 페이지별 모듈화된 CSS 스타일
├── pages/          # 라우팅 단위의 페이지 (Home, Login, Product 등)
├── sdk/            # 외부 SDK 설정
├── store/          # Zustand 전역 상태 스토어
├── utils/          # 공통 유틸리티 함수
├── firebase.ts     # Firebase 초기화 및 설정
├── App.tsx         # 메인 앱 컴포넌트 및 라우팅 설정
└── main.tsx        # 진입점
```

---

## 🗄️ Data Modeling (Database Schema)

NoSQL인 Cloud Firestore를 사용하여 유연하고 확장성 있는 데이터 구조를 설계했습니다.

### `User` Collection

- 사용자 정보를 관리합니다.
- `role`: 일반 사용자 / 관리자 구분

```json
{
  "uid": "string (PK)",
  "email": "user@example.com",
  "role": "guest" // or "owner"
}
```

### `Products` Collection

- 판매 물품에 대한 상세 정보를 저장합니다.

```json
{
  "id": "string (Auto ID)",
  "sellerId": "string (FK - User UID)",
  "title": "맥북 프로 팝니다",
  "price": 1500000,
  "category": "디지털기기",
  "description": "상태 좋습니다...",
  "images": ["url1", "url2"], // Storage 이미지 URL 배열
  "views": 0, // 조회수
  "createdAt": 1705600000000 // Timestamp
}
```

### `Chats` Sub-collection Structure

- 채팅방과 메시지를 효율적으로 관리하기 위해 **Sub-collection** 패턴을 사용했습니다.
- `chats` (채팅방 메타데이터) 하위에 `messages` (개별 메시지) 컬렉션을 두어 쿼리 성능을 최적화했습니다.

```json
// Collection: chats
{
  "id": "string (Auto ID)",
  "productId": "string (FK - Product ID)",
  "participants": ["uid1", "uid2"], // [구매자, 판매자]
  "lastMessage": "안녕하세요, 구매 가능할까요?",
  "updatedAt": 1705600010000
}

// Sub-collection: chats/{chatId}/messages
{
  "id": "string (Auto ID)",
  "senderId": "string (FK - User UID)",
  "text": "네 가능합니다!",
  "createdAt": 1705600020000
}
```

---

## 🚀 Future Improvements

현재 버전에서 더 발전시키고 싶은 기능들입니다.

1.  **검색 및 필터링 고도화**: 현재는 전체 목록만 조회 가능하지만, 카테고리별 필터링과 키워드 검색 기능을 Algolia 등을 활용해 구현해보고 싶습니다.
2.  **무한 스크롤 (Infinite Scroll)**: 상품 목록이 많아질 경우를 대비해 `Intersection Observer API`를 활용한 페이지네이션 최적화
3.  **반응형 디자인 개선**: 모바일 환경에서도 더욱 자연스러운 UX를 제공하도록 미디어 쿼리 세분화
