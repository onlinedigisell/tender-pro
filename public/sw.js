self.addEventListener("push", (event) => {
  const data = event.data
    ? event.data.json()
    : {
        title: "Tender Pro",
        body: "You have a new tender reminder.",
        url: "/",
      };

  event.waitUntil(
    self.registration.showNotification(data.title || "Tender Pro", {
      body: data.body || "You have a new tender reminder.",
      icon: "/app-icon.svg",
      badge: "/app-icon.svg",
      data: {
        url: data.url || "/",
      },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    }),
  );
});
