import { auth, type UserProfile } from "../../sdk/firebase";

type ProfileCardProps = {
  userProfile: UserProfile | null;
};

export default function ProfileCard({ userProfile }: ProfileCardProps) {
  const currentUser = auth.currentUser;

  return (
    <div className="profile-card">
      <div className="profile-item">
        <span className="label">닉네임</span>
        <span className="value">{userProfile?.nickname || "설정되지 않음"}</span>
      </div>
      <div className="profile-item">
        <span className="label">아이디</span>
        <span className="value">{userProfile?.id || currentUser?.email?.split("@")[0]}</span>
      </div>
      <div className="profile-item">
        <span className="label">이메일</span>
        <span className="value">{userProfile?.email || currentUser?.email || "-"}</span>
      </div>
      <div className="profile-item">
        <span className="label">가입일</span>
        <span className="value">{userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : "-"}</span>
      </div>
    </div>
  );
}
