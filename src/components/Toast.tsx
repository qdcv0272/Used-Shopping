import { useToastStore } from "../store/useToastStore";
import "../css/toast.css";

export default function Toast() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type}`} onClick={() => removeToast(toast.id)}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
