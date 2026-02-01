import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } from "firebase/auth";
import type { User } from "firebase/auth";
import { getFirestore, doc, setDoc, collection, query, where, getDocs, getDoc, addDoc, orderBy, limit, onSnapshot, updateDoc, increment } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

type UserWithFlag = User & { _profileSaved?: boolean };

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export async function uploadImage(file: File, folder = "images") {
  const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}

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

export async function addProduct(productData: Omit<Product, "id">) {
  const productsRef = collection(db, "products");
  const docRef = await addDoc(productsRef, productData);
  return docRef.id;
}

export async function getProducts(category?: string) {
  const productsRef = collection(db, "products");
  let q;

  if (category && category !== "전체") {
    q = query(productsRef, where("category", "==", category));
  } else {
    q = query(productsRef, orderBy("createdAt", "desc"), limit(20));
  }

  const querySnapshot = await getDocs(q);
  const products = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];

  if (category && category !== "전체") {
    products.sort((a, b) => b.createdAt - a.createdAt);
  }

  return products;
}

export async function searchProducts(term: string) {
  const productsRef = collection(db, "products");

  const q = query(productsRef, orderBy("createdAt", "desc"), limit(100));

  const querySnapshot = await getDocs(q);
  const allProducts = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];

  if (!term.trim()) return allProducts;

  const lowerTerm = term.toLowerCase();
  return allProducts.filter((p) => p.title.toLowerCase().includes(lowerTerm) || p.description.toLowerCase().includes(lowerTerm));
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

export async function createAuthUser(id: string, password: string, email: string) {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCred.user;

  await sendEmailVerification(user);
  return user;
}

export async function checkEmailVerified() {
  const user = auth.currentUser;
  if (!user) return false;
  await user.reload();
  return user.emailVerified;
}

export async function saveUserProfile(uid: string, id: string, email: string, nickname: string) {
  await setDoc(doc(db, "users", uid), {
    uid,
    id,
    authEmail: email, // Auth용 이메일
    email, // 표시용 이메일
    nickname,
    createdAt: new Date().toISOString(),
  });
}

export async function registerUser(id: string, password: string, email?: string, nickname?: string, profile: Record<string, unknown> = {}) {
  // Legacy support or direct register
  const authEmail = email && email.length ? email : `${id}@noemail.local`;
  const userCred = await createUserWithEmailAndPassword(auth, authEmail, password);
  const user = userCred.user;

  if (email && email.length > 0) {
    await sendEmailVerification(user);
  }

  await saveUserProfile(user.uid, id, email || "", nickname || id);
  return user;
}

export async function loginUser(id: string, password: string) {
  try {
    const usersQuery = query(collection(db, "users"), where("id", "==", id));
    const snap = await getDocs(usersQuery);

    if (snap.empty) {
      throw new Error("존재하지 않는 id입니다.");
    }

    const userDoc = snap.docs[0];
    const data = userDoc.data() as { authEmail?: string; email?: string };
    const authEmail = data.authEmail ?? data.email ?? `${id}@noemail.local`;

    return await signInWithEmailAndPassword(auth, authEmail, password);
  } catch (error) {
    console.error("Login failed:", error);
    const err = error as { code?: string };
    if (err.code === "permission-denied") {
      throw new Error("Firestore 권한 오류: 로그인 전 users 컬렉션을 읽을 수 없습니다. Firebase Console > Firestore Database > Rules 에서 읽기 권한을 허용해주세요. (예: allow read: if true;)");
    }
    throw error;
  }
}

export interface UserProfile {
  id?: string;
  email?: string;
  nickname?: string;
  createdAt?: number;
  role?: string;
  [key: string]: unknown;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const d = await getDoc(doc(db, "users", uid));
  if (!d.exists()) return null;
  return d.data() as UserProfile;
}

export async function updateUserRole(uid: string, role: "owner" | "guest") {
  const ref = doc(db, "users", uid);
  await setDoc(ref, { role }, { merge: true });
  return { uid, role };
}

export async function getProductsBySeller(sellerId: string) {
  const productsRef = collection(db, "products");

  const q = query(productsRef, where("sellerId", "==", sellerId));
  const querySnapshot = await getDocs(q);
  const products = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];

  return products.sort((a, b) => b.createdAt - a.createdAt);
}

export interface ChatMessage {
  id?: string;
  senderId: string;
  text: string;
  createdAt: number;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  productId: string;
  lastMessage: string;
  updatedAt: number;
  unreadCounts?: Record<string, number>;
}

export async function startChat(sellerId: string, productId: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("로그인이 필요합니다.");
  if (user.uid === sellerId) throw new Error("자신의 상품에는 채팅할 수 없습니다.");

  const chatsRef = collection(db, "chats");

  const q = query(chatsRef, where("productId", "==", productId), where("participants", "array-contains", user.uid));

  const snap = await getDocs(q);
  const existingChat = snap.docs.find((doc) => {
    const data = doc.data();
    return data.participants.includes(sellerId);
  });

  if (existingChat) {
    return existingChat.id;
  }

  const newChatRef = await addDoc(chatsRef, {
    participants: [user.uid, sellerId],
    productId,
    lastMessage: "",
    updatedAt: Date.now(),
    unreadCounts: { [user.uid]: 0, [sellerId]: 0 },
  });

  return newChatRef.id;
}

export async function sendMessage(chatId: string, text: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("로그인이 필요합니다.");

  const messagesRef = collection(db, "chats", chatId, "messages");
  await addDoc(messagesRef, {
    senderId: user.uid,
    text,
    createdAt: Date.now(),
  });

  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);

  let newUnreadCounts: Record<string, number> = {};
  if (chatSnap.exists()) {
    const data = chatSnap.data() as ChatRoom;
    const participants = data.participants || [];
    const currentCounts = data.unreadCounts || {};

    newUnreadCounts = { ...currentCounts };
    participants.forEach((uid) => {
      if (uid !== user.uid) {
        newUnreadCounts[uid] = (currentCounts[uid] || 0) + 1;
      }
    });
  }

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

export async function markChatAsRead(chatId: string) {
  const user = auth.currentUser;
  if (!user) return;

  const chatRef = doc(db, "chats", chatId);

  await setDoc(
    chatRef,
    {
      [`unreadCounts.${user.uid}`]: 0,
    },
    { merge: true },
  );
}

export function subscribeToMessages(chatId: string, callback: (msgs: ChatMessage[]) => void) {
  const messagesRef = collection(db, "chats", chatId, "messages");

  const q = query(messagesRef, orderBy("createdAt", "asc"));

  return onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ChatMessage[];
    callback(msgs);
  });
}

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

  return chats.sort((a, b) => b.updatedAt - a.updatedAt);
}

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

export async function verifyUser(id: string, email: string) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("id", "==", id), where("email", "==", email));
  const snap = await getDocs(q);
  return !snap.empty;
}

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
