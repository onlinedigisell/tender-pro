"use client";

import { useEffect, useState } from "react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => setNotifications(data))
      .catch(() => setNotifications([]));
  }, []);

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>

      {notifications.length === 0 && (
        <p className="text-gray-500">No notifications yet</p>
      )}

      <div className="grid gap-3">
        {notifications.map((item) => (
          <div key={item.id} className="border rounded-xl p-4 bg-white">
            <p className="font-semibold">{item.message}</p>
            <p className="text-sm text-gray-500">
              {new Date(item.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}