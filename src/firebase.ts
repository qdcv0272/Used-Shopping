// Auth + Firestore 최소 설정
// .env 파일에 VITE_FIREBASE_* 환경변수를 넣어 사용합니다.

import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

type UserWithFlag = User & { _profileSaved?: boolean };

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

// Firebase Auth로 가입 후 Firestore에 기본 프로필을 저장하는 헬퍼
export async function registerUser(
  email: string,
  password: string,
  profile: Record<string, unknown> = {}
): Promise<UserWithFlag> {
  // 인증 사용자 생성
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCred.user;

  // 회원가입 흐름 디버깅용 콘솔 로그
  console.log("Firebase auth user created", {
    uid: user.uid,
    email: user.email,
  });

  // Firestore에 프로필을 쓰되, 실패해도 예외를 던지지 않습니다.
  try {
    const attemptWrite = async (attempt: number) => {
      console.log(
        `Attempting Firestore user profile write (attempt ${attempt}, 8s timeout)`,
        {
          uid: user.uid,
        }
      );

      const write = setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        createdAt: new Date().toISOString(),
        ...profile,
      });

      // Firestore 쓰기가 지연될 때 UI가 멈추지 않도록 타임아웃 적용
      await Promise.race([
        write,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("firestore-write-timeout")), 8000)
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
      email: user.email,
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

// 로그인 헬퍼
export async function loginUser(email: string, password: string) {
  return await signInWithEmailAndPassword(auth, email, password);
}
