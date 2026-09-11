self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || "시드니 주님의 교회", {
      body: data.body,
      icon: "/icon.svg",
      // 클릭했을 때 열 경로. 데일리 말씀 푸시는 '/daily-verse' 를 보낸다.
      data: { url: data.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/", self.location.origin).href;

  // 이미 열려 있는 창이 있으면 새 창을 띄우지 않고 그 창을 재사용한다.
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === target && "focus" in client) return client.focus();
      }
      for (const client of windowClients) {
        if ("navigate" in client) return client.navigate(target).then((c) => c && c.focus());
      }
      return clients.openWindow(target);
    }),
  );
});
