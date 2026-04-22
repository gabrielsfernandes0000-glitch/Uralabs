// URA Labs Push service worker
// Handler mínimo: recebe push, mostra notificação, click abre URL.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload = {};
  try { payload = event.data.json(); } catch { payload = { title: event.data.text() }; }

  const title = payload.title || "URA Labs";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/brand/ura-labs-logo.png",
    badge: "/brand/ura-labs-logo.png",
    tag: payload.tag || "ura-alert",
    data: { url: payload.url || "/elite/noticias" },
    requireInteraction: payload.requireInteraction === true,
    silent: payload.silent === true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/elite/noticias";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
