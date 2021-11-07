self.addEventListener("push", (e) => {
  const notification = e.data.text();
  self.registration.showNotification(notification);
});
