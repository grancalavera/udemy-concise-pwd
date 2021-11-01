// Service Worker

self.addEventListener("install", (e) => {
  console.log("SW: Installed");
});

self.addEventListener("activate", (e) => {
  console.log("SW: Activated");
});

self.addEventListener("message", async (event) => {
  console.log("SW: message received", { data: event.data });

  const clients = await event.currentTarget.clients.matchAll({
    includeUncontrolled: true,
    type: "window",
  });

  clients.forEach((client) => {
    // reply to all clients
    client.postMessage("Greetings ALL from SW!");

    // reply to sender only
    if (event.source.id === client.id) {
      client.postMessage(`Greetings ${client.id} from SW`);
    }
  });
});

self.addEventListener("push", async (event) => {
  const message = await event.data.text();
  const notification = self.registration.showNotification(
    message ?? "You'be been notified from the SW!"
  );

  // ensures the service worker stays active throughout the duration of the notification
  event.waitUntil(notification);
});
