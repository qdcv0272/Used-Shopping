// 이 유틸리티 함수는 브라우저 알림(Notification)을 표시하는 기능을 제공합니다.
export function showBrowserNotification(
  title: string,
  options?: NotificationOptions,
) {
  if (typeof window === "undefined" || !("Notification" in window))
    return false;

  try {
    if (Notification.permission === "granted") {
      new Notification(title, options);
      return true;
    }

    if (Notification.permission !== "denied") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") {
          new Notification(title, options);
        }
      });
    }
  } catch (e) {
    console.error("Notification API error", e);
  }

  return false;
}
