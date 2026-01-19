// Auth + Firestore 최소 설정
// .env 파일에 VITE_FIREBASE_* 환경변수를 넣어 사용합니다.

import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import type { User } from "firebase/auth"; // User 타입 임포트
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
  increment,
} from "firebase/firestore"; // Firestore 모듈
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Storage 모듈
// 사용자 객체에 프로필 저장 여부 플래그 추가

type UserWithFlag = User & { _profileSaved?: boolean }; // User 타입 확장

// 환경변수에서 설정 불러오기
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// 이미지 업로드 헬퍼
export async function uploadImage(file: File, folder = "images") {
  const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}

// 프로덕트 관련 헬퍼 함수들
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

// 새 프로덕트 추가
export async function addProduct(productData: Omit<Product, "id">) {
  const productsRef = collection(db, "products");
  const docRef = await addDoc(productsRef, productData);
  return docRef.id;
}

// 카테고리별 또는 전체 프로덕트 조회
export async function getProducts(category?: string) {
  const productsRef = collection(db, "products");
  let q;
  // 카테고리 필터 시 복합 인덱스 없이 작동하도록 orderBy 제거 후 클라이언트 정렬
  if (category && category !== "전체") {
    q = query(productsRef, where("category", "==", category));
  } else {
    // 전체 조회는 단일 필드 정렬이므로 인덱스 불필요 (자동 생성됨)
    q = query(productsRef, orderBy("createdAt", "desc"), limit(20));
  }

  const querySnapshot = await getDocs(q);
  const products = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];

  // 카테고리 필터일 경우 여기서 최신순 정렬
  if (category && category !== "전체") {
    products.sort((a, b) => b.createdAt - a.createdAt);
  }

  return products;
}

export async function searchProducts(term: string) {
  const productsRef = collection(db, "products");
  // Simple Title Search (Client-side filtering for broader matching)
  // For production, use Algolia/Elasticsearch
  const q = query(productsRef, orderBy("createdAt", "desc"), limit(100)); // Fetch more for search

  const querySnapshot = await getDocs(q);
  const allProducts = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];

  if (!term.trim()) return allProducts;

  const lowerTerm = term.toLowerCase();
  return allProducts.filter(
    (p) =>
      p.title.toLowerCase().includes(lowerTerm) ||
      p.description.toLowerCase().includes(lowerTerm),
  );
}

export async function getProduct(id: string) {
  const docRef = doc(db, "products", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Product;
  } else {
    return null;
  }
}

export async function incrementView(id: string) {
  const docRef = doc(db, "products", id);
  await updateDoc(docRef, {
    views: increment(1),
  });
}

// Firebase Auth로 가입 후 Firestore에 기본 프로필을 저장하는 헬퍼
// 변경: id(사용자 아이디)와 선택적 email을 받아, auth에는 이메일 형태의 주소(authEmail)를 사용합니다.
export async function registerUser(
  id: string,
  password: string,
  email?: string,
  nickname?: string,
  profile: Record<string, unknown> = {},
): Promise<UserWithFlag> {
  // 실제 Auth에 사용할 이메일을 결정합니다. (사용자가 이메일을 입력하지 않으면 가상 이메일 사용)
  const authEmail = email && email.length ? email : `${id}@noemail.local`;

  // 인증 사용자 생성 (authEmail 사용)
  const userCred = await createUserWithEmailAndPassword(
    auth,
    authEmail,
    password,
  );
  const user = userCred.user;

  // 회원가입 흐름 디버깅용 콘솔 로그
  console.log("Firebase auth user created", {
    uid: user.uid,
    email: user.email,
    authEmail,
    id,
  });

  // Firestore에 프로필을 쓰되, 실패해도 예외를 던지지 않습니다.
  try {
    const attemptWrite = async (attempt: number) => {
      console.log(
        `Attempting Firestore user profile write (attempt ${attempt}, 8s timeout)`,
        {
          uid: user.uid,
        },
      );

      // Firestore에 id, authEmail, (사용자 제공) email, uid 등을 저장합니다.
      const write = setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        id,
        authEmail,
        email: email ?? null,
        nickname: nickname ?? id,
        createdAt: new Date().toISOString(),
        ...profile,
      });

      // Firestore 쓰기가 지연될 때 UI가 멈추지 않도록 타임아웃 적용
      await Promise.race([
        write,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("firestore-write-timeout")), 8000),
        ),
      ]);
    };

    try {
      await attemptWrite(1);
    } catch (firstErr) {
      console.warn("Firestore write attempt 1 failed; retrying once", firstErr);
      await attemptWrite(2);
    }

    // 프로필 저장 성공 로그
    console.log("User profile saved in Firestore", {
      uid: user.uid,
      id,
      authEmail,
      email: email ?? null,
    });
    (user as UserWithFlag)._profileSaved = true;
  } catch (e) {
    // Auth 계정은 생성되었지만 Firestore 프로필 저장이 실패한 경우
    console.error("Failed to write user profile in Firestore", e);
    // 호출 측이 확인할 수 있도록 플래그를 남깁니다.
    (user as UserWithFlag)._profileSaved = false;
  }

  return user;
}

// 로그인 헬퍼 — 변경: id로 사용자를 조회해 auth에 사용된 이메일(authEmail)로 로그인합니다.
export async function loginUser(id: string, password: string) {
  // users 컬렉션에서 id로 문서를 조회합니다.
  const usersQuery = query(collection(db, "users"), where("id", "==", id));
  const snap = await getDocs(usersQuery);
  if (snap.empty) {
    throw new Error("존재하지 않는 id입니다.");
  }
  // 첫번째 매칭 사용
  const userDoc = snap.docs[0];
  const data = userDoc.data() as { authEmail?: string; email?: string };
  const authEmail = data.authEmail ?? data.email ?? `${id}@noemail.local`;

  // 실제 로그인
  return await signInWithEmailAndPassword(auth, authEmail, password);
}

// Get user profile document from Firestore
export async function getUserProfile(uid: string) {
  const d = await getDoc(doc(db, "users", uid));
  if (!d.exists()) return null;
  return d.data();
}

// Update user's role (merge)
export async function updateUserRole(uid: string, role: "owner" | "guest") {
  const ref = doc(db, "users", uid);
  await setDoc(ref, { role }, { merge: true });
  return { uid, role };
}

export async function getProductsBySeller(sellerId: string) {
  const productsRef = collection(db, "products");
  // 복합 인덱스 문제 방지를 위해 orderBy 제거 후 메모리 정렬
  const q = query(productsRef, where("sellerId", "==", sellerId));
  const querySnapshot = await getDocs(q);
  const products = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];

  // 최신순 정렬
  return products.sort((a, b) => b.createdAt - a.createdAt);
}

// --- Chat Helpers ---

export interface ChatMessage {
  id?: string;
  senderId: string;
  text: string;
  createdAt: number;
}

export interface ChatRoom {
  id: string;
  participants: string[]; // [uid1, uid2]
  productId: string;
  lastMessage: string;
  updatedAt: number;
  unreadCounts?: Record<string, number>; // { userId: count }
}

// 1. 채팅방 생성 또는 기존 방 가져오기
export async function startChat(sellerId: string, productId: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("로그인이 필요합니다.");
  if (user.uid === sellerId)
    throw new Error("자신의 상품에는 채팅할 수 없습니다.");

  const chatsRef = collection(db, "chats");

  // 이미 존재하는 채팅방인지 확인 (간단하게 productId와 participants로 확인)
  // Firestore 쿼리 제약상, participants 배열 포함 여부를 완벽히 체크하기 어려울 수 있으니
  // 여기서는 '내가 참여중이고' + 'productId가 일치하는' 방을 찾은 뒤, 상대방(sellerId)이 있는지 JS로 확인합니다.
  const q = query(
    chatsRef,
    where("productId", "==", productId),
    where("participants", "array-contains", user.uid),
  );

  const snap = await getDocs(q);
  const existingChat = snap.docs.find((doc) => {
    const data = doc.data();
    return data.participants.includes(sellerId);
  });

  if (existingChat) {
    return existingChat.id;
  }

  // 없으면 새로 생성
  const newChatRef = await addDoc(chatsRef, {
    participants: [user.uid, sellerId],
    productId,
    lastMessage: "",
    updatedAt: Date.now(),
    unreadCounts: { [user.uid]: 0, [sellerId]: 0 },
  });

  return newChatRef.id;
}

// 2. 메시지 전송
export async function sendMessage(chatId: string, text: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("로그인이 필요합니다.");

  // 메시지 서브컬렉션에 추가
  const messagesRef = collection(db, "chats", chatId, "messages");
  await addDoc(messagesRef, {
    senderId: user.uid,
    text,
    createdAt: Date.now(),
  });

  // 채팅방 정보 가져오기 (참여자 확인용)
  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);

  let newUnreadCounts = {};
  if (chatSnap.exists()) {
    const data = chatSnap.data() as ChatRoom;
    const participants = data.participants || [];
    const currentCounts = data.unreadCounts || {};

    // 나를 제외한 모든 참가자의 안 읽은 수 +1
    newUnreadCounts = { ...currentCounts };
    participants.forEach((uid) => {
      if (uid !== user.uid) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (newUnreadCounts as any)[uid] = (currentCounts[uid] || 0) + 1;
      }
    });
  }

  // 채팅방 메타데이터 업데이트 (마지막 메시지, 시간, 안읽은 수)
  await setDoc(
    chatRef,
    {
      lastMessage: text,
      updatedAt: Date.now(),
      unreadCounts: newUnreadCounts,
    },
    { merge: true },
  );
}

// 읽음 처리 함수 추가
export async function markChatAsRead(chatId: string) {
  const user = auth.currentUser;
  if (!user) return;

  const chatRef = doc(db, "chats", chatId);
  // 내 unreadCount를 0으로 초기화
  // 점 표기법(unreadCounts.userId)을 사용하여 특정 필드만 업데이트
  await setDoc(
    chatRef,
    {
      [`unreadCounts.${user.uid}`]: 0,
    },
    { merge: true },
  );
}

// 3. 메시지 목록 실시간 구독 (onSnapshot 사용)
export function subscribeToMessages(
  chatId: string,
  callback: (msgs: ChatMessage[]) => void,
) {
  const messagesRef = collection(db, "chats", chatId, "messages");
  // 시간순 정렬
  const q = query(messagesRef, orderBy("createdAt", "asc"));

  return onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ChatMessage[];
    callback(msgs);
  });
}

// 4. 내 채팅방 목록 가져오기
export async function getMyChats() {
  const user = auth.currentUser;
  if (!user) return [];

  const chatsRef = collection(db, "chats");
  const q = query(chatsRef, where("participants", "array-contains", user.uid));

  const snap = await getDocs(q);
  const chats = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ChatRoom[];

  // 최신 업데이트 순 정렬
  return chats.sort((a, b) => b.updatedAt - a.updatedAt);
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
    https://firebase.google.com/docs/storage
  
  TypeScript / JS 레퍼런스 (API 시그니처 확인용) 🧭
  https://firebase.google.com/docs/reference/js
*/
