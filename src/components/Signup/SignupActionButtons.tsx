import { auth } from "../../sdk/firebase";

type SignupActionButtonsProps = {
  isVerificationSent: boolean;
  isVerified: boolean;
  isSubmitting: boolean;
  onSendVerification: () => void;
  onCheckVerification: () => void;
  onFinalSignup: () => void;
  onCancel: () => void;
};

export default function SignupActionButtons({ isVerificationSent, isVerified, isSubmitting, onSendVerification, onCheckVerification, onFinalSignup, onCancel }: SignupActionButtonsProps) {
  return (
    <div className="actions">
      {!isVerificationSent && !isVerified && (
        <button className="btn" type="button" onClick={onSendVerification} disabled={isSubmitting}>
          {isSubmitting ? "처리 중..." : "인증 메일 발송"}
        </button>
      )}

      {isVerificationSent && !isVerified && (
        <div
          style={{
            display: "flex",
            gap: "10px",
            width: "100%",
            flexDirection: "column",
          }}
        >
          <p
            style={{
              fontSize: "14px",
              color: "green",
              textAlign: "center",
              margin: "5px 0",
            }}
          >
            인증 메일이 발송되었습니다.
          </p>
          <button className="btn" type="button" onClick={onCheckVerification} disabled={isSubmitting}>
            인증 완료 확인
          </button>
          <button
            className="btn ghost"
            type="button"
            style={{ marginTop: "5px" }}
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
        <button className="btn" type="button" onClick={onFinalSignup} disabled={isSubmitting}>
          회원가입 완료
        </button>
      )}

      <button className="btn ghost" type="button" onClick={onCancel}>
        취소 / 로그인으로
      </button>
    </div>
  );
}
