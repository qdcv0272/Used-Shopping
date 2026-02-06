import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } from "firebase/auth";
// import type { User } from "firebase/auth";
import { getFirestore, doc, setDoc, collection, query, where, getDocs, getDoc, addDoc, orderBy, limit, onSnapshot, updateDoc, increment } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// 1. Firebase 설정 정보 (API 키 등은 환경 변수에서 가져옵니다)
// .env 파일에 정의된 VITE_FIREBASE_... 값들을 사용해 보안을 유지합니다.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// 2. Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// 3. 서비스별 인스턴스 내보내기 (다른 파일에서 가져다 씀)
export const auth = getAuth(app); // 인증(로그인/회원가입) 관리
export const db = getFirestore(app); // 데이터베이스(Firestore) 관리
export const storage = getStorage(app); // 파일 저장소(Storage) 관리
export const analytics = getAnalytics(app); // 구글 애널리틱스 연동

// ----------------------------------------------------------------------------
// 스토리지 (Storage) 관련 함수
// ----------------------------------------------------------------------------

// 이미지를 Firebase Storage에 업로드하고 다운로드 URL을 반환하는 함수
export async function uploadImage(file: File, folder = "images") {
  // 저장할 경로 생성: images/현재시간_파일명
  const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);

  // 파일 업로드 수행
  const snapshot = await uploadBytes(storageRef, file);

  // 업로드된 파일의 다운로드 주소(URL) 가져오기
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}

// ----------------------------------------------------------------------------
// 상품 (Product) 관련 함수 (Firestore)
// ----------------------------------------------------------------------------

// 상품 데이터 타입 정의
export interface Product {
  id?: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  sellerId: string;
  createdAt: number;
  views: number;
  likes: number;
}

// 새 상품을 등록하는 함수
export async function addProduct(productData: Omit<Product, "id">) {
  // 'products' 컬렉션 참조
  const productsRef = collection(db, "products");

  // 데이터 추가 (ID는 자동 생성됨)
  const docRef = await addDoc(productsRef, productData);
  return docRef.id; // 생성된 문서 ID 반환
}

// 상품 목록을 가져오는 함수 (카테고리 필터 가능)
export async function getProducts(category?: string) {
  const productsRef = collection(db, "products");
  let q;

  // 카테고리가 지정되어 있고 '전체'가 아니면 해당 카테고리만 필터링
  if (category && category !== "전체") {
    q = query(productsRef, where("category", "==", category));
  } else {
    // 아니면 전체 목록 최신순 정렬 (최대 20개)
    q = query(productsRef, orderBy("createdAt", "desc"), limit(20));
  }

  // 데이터 가져오기 비동기 요청
  const querySnapshot = await getDocs(q);

  // 문서 데이터들을 배열 형태로 변환
  const products = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];

  // 카테고리 필터링 시에는 클라이언트 측에서 최신순 정렬 (복합 인덱스 문제 회피)
  if (category && category !== "전체") {
    products.sort((a, b) => b.createdAt - a.createdAt);
  }

  return products;
}

// 상품 검색 함수 (제목 또는 설명에 검색어가 포함된 상품 찾기)
export async function searchProducts(term: string) {
  const productsRef = collection(db, "products");

  // 전체 상품 중 최근 100개를 가져옴
  const q = query(productsRef, orderBy("createdAt", "desc"), limit(100));

  const querySnapshot = await getDocs(q);
  const allProducts = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];

  // 검색어가 없으면 전체 반환
  if (!term.trim()) return allProducts;

  // 검색어 소문자 변환 (대소문자 무시 검색을 위해)
  const lowerTerm = term.toLowerCase();

  // 제목이나 설명에 검색어가 포함된 것만 필터링 (클라이언트 측 검색)
  return allProducts.filter((p) => p.title.toLowerCase().includes(lowerTerm) || p.description.toLowerCase().includes(lowerTerm));
}

// 특정 상품의 상세 정보를 가져오는 함수
export async function getProduct(id: string) {
  // 'products' 컬렉션의 특정 문서(id) 참조
  const docRef = doc(db, "products", id);
  const docSnap = await getDoc(docRef);

  // 문서가 존재하면 데이터 반환
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Product;
  } else {
    return null;
  }
}

// 조회수 증가 함수
export async function incrementView(id: string) {
  const docRef = doc(db, "products", id);
  // 기존 값에 +1 업데이트 (Atomic Operation)
  await updateDoc(docRef, {
    views: increment(1),
  });
}

// ----------------------------------------------------------------------------
// 사용자/인증 (User/Auth) 관련 함수
// ----------------------------------------------------------------------------

// Firebase Auth에 사용자 생성 (이메일/비번) + 이메일 인증 발송
export async function createAuthUser(email: string, password: string) {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCred.user;

  // 이메일 인증 메일 발송
  await sendEmailVerification(user);
  return user;
}

// 현재 로그인된 사용자가 이메일 인증을 완료했는지 확인
export async function checkEmailVerified() {
  const user = auth.currentUser;
  if (!user) return false;

  // 사용자 정보 새로고침 (최신 상태 확인)
  await user.reload();
  return user.emailVerified;
}

// 사용자 프로필 정보를 Firestore 'users' 컬렉션에 저장
export async function saveUserProfile(uid: string, id: string, email: string, nickname: string) {
  // 'users' 컬렉션에 문서를 생성하거나 덮어씀 (문서 ID를 uid로 지정)
  await setDoc(doc(db, "users", uid), {
    uid,
    id, // 사용자가 입력한 아이디
    authEmail: email, // 로그인용 실제 이메일
    email, // 표시용 이메일
    nickname,
    createdAt: new Date().toISOString(),
  });
}

// 통합 회원가입 함수 (Auth 생성 + 프로필 저장)
export async function registerUser(id: string, password: string, email?: string, nickname?: string) {
  // 이메일이 없으면 가짜 이메일 생성 (id@noemail.local)
  const authEmail = email && email.length ? email : `${id}@noemail.local`;

  // Firebase Auth 계정 생성
  const userCred = await createUserWithEmailAndPassword(auth, authEmail, password);
  const user = userCred.user;

  // 실제 이메일이 있다면 인증 메일 발송
  if (email && email.length > 0) {
    await sendEmailVerification(user);
  }

  // Firestore에 사용자 정보 저장
  await saveUserProfile(user.uid, id, email || "", nickname || id);
  return user;
}

// 로그인 함수 (ID로 로그인)
export async function loginUser(id: string, password: string) {
  try {
    // 1. ID로 Firestore에서 사용자 정보 조회
    const usersQuery = query(collection(db, "users"), where("id", "==", id));
    const snap = await getDocs(usersQuery);

    if (snap.empty) {
      throw new Error("존재하지 않는 id입니다.");
    }

    // 2. 조회된 사용자 정보에서 실제 로그인용 이메일(authEmail) 가져오기
    const userDoc = snap.docs[0];
    const data = userDoc.data() as { authEmail?: string; email?: string };
    const authEmail = data.authEmail ?? data.email ?? `${id}@noemail.local`;

    // 3. 이메일과 비밀번호로 Firebase 로그인 시도
    return await signInWithEmailAndPassword(auth, authEmail, password);
  } catch (error) {
    console.error("Login failed:", error);
    const err = error as { code?: string };
    // 권한 오류 처리 안내
    if (err.code === "permission-denied") {
      throw new Error("Firestore 권한 오류: 로그인 전 users 컬렉션을 읽을 수 없습니다. Firebase Console > Firestore Database > Rules 에서 읽기 권한을 허용해주세요. (예: allow read: if true;)");
    }
    throw error;
  }
}

// 사용자 프로필 인터페이스
export interface UserProfile {
  id?: string;
  email?: string;
  nickname?: string;
  createdAt?: number;
  role?: string;
  [key: string]: unknown;
}

// 사용자 프로필 정보 가져오기 (uid 기준)
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const d = await getDoc(doc(db, "users", uid));
  if (!d.exists()) return null;
  return d.data() as UserProfile;
}

// 사용자 역할 업데이트 (owner 등)
export async function updateUserRole(uid: string, role: "owner" | "guest") {
  const ref = doc(db, "users", uid);
  // merge: true 옵션으로 기존 데이터를 유지하면서 role 필드만 업데이트
  await setDoc(ref, { role }, { merge: true });
  return { uid, role };
}

// 특정 판매자가 올린 상품 목록 가져오기
export async function getProductsBySeller(sellerId: string) {
  const productsRef = collection(db, "products");

  // sellerId 필드가 일치하는 상품 검색
  const q = query(productsRef, where("sellerId", "==", sellerId));
  const querySnapshot = await getDocs(q);
  const products = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];

  // 최신순 정렬
  return products.sort((a, b) => b.createdAt - a.createdAt);
}

// ----------------------------------------------------------------------------
// 채팅 (Chat) 관련 함수
// ----------------------------------------------------------------------------

export interface ChatMessage {
  id?: string;
  senderId: string;
  text: string;
  createdAt: number;
  // Firestore 타임스탬프가 아닌 숫자(밀리초)를 사용함
}

export interface ChatRoom {
  id: string;
  participants: string[];
  productId: string;
  lastMessage: string;
  updatedAt: number;
  unreadCounts?: Record<string, number>;
}

// 채팅 시작하기 (새 채팅방 생성 또는 기존 방 조회)
export async function startChat(sellerId: string, productId: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("로그인이 필요합니다.");
  if (user.uid === sellerId) throw new Error("자신의 상품에는 채팅할 수 없습니다.");

  const chatsRef = collection(db, "chats");

  // 해당 상품이면서 내가 참여한 채팅방 찾기
  const q = query(chatsRef, where("productId", "==", productId), where("participants", "array-contains", user.uid));

  const snap = await getDocs(q);

  // 판매자도 함께 참여하고 있는 방인지 확인
  const existingChat = snap.docs.find((doc) => {
    const data = doc.data();
    return data.participants.includes(sellerId);
  });

  // 이미 채팅방이 있으면 그 방의 ID 반환
  if (existingChat) {
    return existingChat.id;
  }

  // 없으면 새 채팅방 생성
  const newChatRef = await addDoc(chatsRef, {
    participants: [user.uid, sellerId], // 참여자 목록
    productId,
    lastMessage: "",
    updatedAt: Date.now(),
    unreadCounts: { [user.uid]: 0, [sellerId]: 0 }, // 읽지 않은 메시지 수
  });

  return newChatRef.id;
}

// 메시지 전송 함수
export async function sendMessage(chatId: string, text: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("로그인이 필요합니다.");

  // 1. 메시지 서브 컬렉션에 메시지 추가
  const messagesRef = collection(db, "chats", chatId, "messages");
  await addDoc(messagesRef, {
    senderId: user.uid,
    text,
    createdAt: Date.now(),
  });

  // 2. 채팅방 정보 업데이트 (마지막 메시지, 시간, 안 읽은 개수)
  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);

  let newUnreadCounts: Record<string, number> = {};
  if (chatSnap.exists()) {
    const data = chatSnap.data() as ChatRoom;
    const participants = data.participants || [];
    const currentCounts = data.unreadCounts || {};

    // 상대방들의 안 읽은 카운트 증가
    newUnreadCounts = { ...currentCounts };
    participants.forEach((uid) => {
      if (uid !== user.uid) {
        newUnreadCounts[uid] = (currentCounts[uid] || 0) + 1;
      }
    });
  }

  // 채팅방 문서 업데이트
  await setDoc(
    chatRef,
    {
      lastMessage: text,
      updatedAt: Date.now(),
      unreadCounts: newUnreadCounts,
    },
    { merge: true }, // 기존 필드 유지하며 병합
  );
}

// 채팅방 읽음 처리 (안 읽은 개수 0으로 만들기)
export async function markChatAsRead(chatId: string) {
  const user = auth.currentUser;
  if (!user) return;

  const chatRef = doc(db, "chats", chatId);

  // 내 안 읽은 개수 필드만 0으로 업데이트
  await setDoc(
    chatRef,
    {
      [`unreadCounts.${user.uid}`]: 0,
    },
    { merge: true },
  );
}

// 실시간 메시지 구독 (새로운 메시지가 오면 callback 함수가 실행됨)
export function subscribeToMessages(chatId: string, callback: (msgs: ChatMessage[]) => void) {
  const messagesRef = collection(db, "chats", chatId, "messages");

  // 메시지를 시간순 정렬
  const q = query(messagesRef, orderBy("createdAt", "asc"));

  // 실시간 수신 대기 (onSnapshot)
  return onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ChatMessage[];
    callback(msgs); // 변경될 때마다 콜백 호출
  });
}

// 내 채팅 목록 가져오기
export async function getMyChats() {
  const user = auth.currentUser;
  if (!user) return [];

  const chatsRef = collection(db, "chats");
  // 내가 참여자로 포함된 모든 채팅방 검색
  const q = query(chatsRef, where("participants", "array-contains", user.uid));

  const snap = await getDocs(q);
  const chats = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ChatRoom[];

  // 최신 업데이트(마지막 메시지) 순으로 정렬
  return chats.sort((a, b) => b.updatedAt - a.updatedAt);
}

// 이메일로 사용자 ID 찾기 (비밀번호 찾기 등에 사용)
export async function findUserIdByEmail(email: string) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email));
  const snap = await getDocs(q);

  if (snap.empty) {
    return null;
  }
  const data = snap.docs[0].data();
  return data.id as string;
}

// 사용자 확인 (아이디와 이메일이 일치하는지)
export async function verifyUser(id: string, email: string) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("id", "==", id), where("email", "==", email));
  const snap = await getDocs(q);
  return !snap.empty;
}

// 비밀번호 재설정 이메일 발송
export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

/*
  Firebase Web 시작 / 설정 ✅
  https://firebase.google.com/docs/web/setup

  모듈형 SDK(v9+) 가이드 (현재 파일과 동일한 패턴) 🔧
  https://firebase.google.com/docs/web/modular-upgrade

  인증(Auth) 🔐
  https://firebase.google.com/docs/auth/web/start

  Firestore(데이터베이스) ⚡
  https://firebase.google.com/docs/firestore/quickstart

  Storage(파일 업로드) 📁
  https://firebase.google.com/docs/storage/web/start
  
  TypeScript / JS 레퍼런스 (API 시그니처 확인용) 🧭
  https://firebase.google.com/docs/reference/js
*/
