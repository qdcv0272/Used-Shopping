import { auth } from "../../sdk/firebase";
import { useSignupStore, selectSignupActions } from "@/store/useSignupStore";
import { useShallow } from "zustand/react/shallow";

// 액션 버튼 컴포넌트 Props 타입
type SignupActionButtonsProps = {
  onCancel: () => void;
};

// 액션 버튼 컴포넌트
export default function SignupActionButtons({ onCancel }: SignupActionButtonsProps) {
  const { isVerificationSent, isVerified, isSubmitting, sendVerification, checkVerification, finalSignup } = useSignupStore(useShallow(selectSignupActions));

  return (
    <div className="actions">
      {!isVerificationSent && !isVerified && (
        <button className="btn" type="button" onClick={sendVerification} disabled={isSubmitting}>
          {isSubmitting ? "처리 중..." : "인증 메일 발송"}
        </button>
      )}

      {isVerificationSent && !isVerified && (
        <div className="verification-actions">
          <p className="verification-message">인증 메일이 발송되었습니다.</p>
          <button className="btn" type="button" onClick={checkVerification} disabled={isSubmitting}>
            인증 완료 확인
          </button>
          <button
            className="btn ghost resend-btn"
            type="button"
            onClick={async () => {
              try {
                const { sendEmailVerification } = await import("firebase/auth");
                if (auth.currentUser) {
                  await sendEmailVerification(auth.currentUser);
                  alert("인증 메일이 재발송되었습니다. 스팸 메일함도 확인해주세요.");
                } else {
                  alert("로그인된 사용자 정보가 없습니다. 새로고침 후 다시 시도해주세요.");
                }
              } catch (e: unknown) {
                console.error(e);
                const code = (e as { code?: string })?.code;
                const msg = (e as { message?: string })?.message || String(e);

                if (code === "auth/too-many-requests") {
                  alert("너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.");
                } else {
                  alert("메일 발송 실패: " + msg);
                }
              }
            }}
          >
            인증 메일 재발송
          </button>
        </div>
      )}

      {isVerified && (
        <button className="btn" type="button" onClick={finalSignup} disabled={isSubmitting}>
          회원가입 완료
        </button>
      )}

      <button className="btn ghost" type="button" onClick={onCancel}>
        취소 / 로그인으로
      </button>
    </div>
  );
}
