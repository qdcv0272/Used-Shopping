export function showBrowserNotification(
  title: string,
  options?: NotificationOptions
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
    // Silently ignore (some browsers or environments may throw)
    // Caller can rely on in-app message as fallback
    // eslint-disable-next-line no-console
    console.error("Notification API error", e);
  }

  return false;
}
