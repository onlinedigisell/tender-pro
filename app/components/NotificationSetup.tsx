"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export default function NotificationSetup() {
  const [supported, setSupported] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const isSupported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;

    setSupported(isSupported);

    if (isSupported) {
      setPermission(Notification.permission);
      navigator.serviceWorker.register("/sw.js").catch(() => {
        setMessage("Could not start notification service on this browser.");
      });
    }
  }, []);

  async function enableNotifications() {
    try {
      const keyRes = await fetch("/api/push/public-key");
      const { publicKey } = await keyRes.json();

      if (!publicKey) {
        setMessage("Notification keys are not configured in Vercel yet.");
        return;
      }

      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== "granted") {
        setMessage("Notifications were not allowed on this device.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      await fetch("/api/push/test", { method: "POST" });
      setMessage("Notifications are enabled on this device.");
    } catch {
      setMessage("Notification setup failed. Try from Chrome/Edge or Android Chrome.");
    }
  }

  if (!supported || hidden) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-bold">Tender reminders</p>
        <button
          type="button"
          onClick={() => setHidden(true)}
          className="rounded-md px-2 py-1 text-sm font-bold text-slate-500 hover:bg-slate-100"
          aria-label="Hide notification setup"
        >
          X
        </button>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        Get deadline alerts on this device.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={enableNotifications}
          className="rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          {permission === "granted" ? "Test notifications" : "Enable notifications"}
        </button>
        <span className="text-xs font-medium uppercase text-slate-500">{permission}</span>
      </div>
      {message && <p className="mt-2 text-xs text-slate-600">{message}</p>}
    </div>
  );
}
