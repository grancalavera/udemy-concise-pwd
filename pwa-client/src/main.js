const applicationServerKey =
  "BJGPbhq3yM-8WYU4JT3v6P54unRkgCTu-Jdr0luSsZ6u0gbZTbwDE_lDZCuis0RuGJ_XPE3YsM83xCDEbJ01m48";

async function main() {
  // dodgy grant notifications permissions
  if ("Notification" in window) {
    if (Notification.permission === "granted") {
      showNotification();
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission((permission) => {
        if (permission === "granted") {
          showNotification();
        }
      });
    }
  }

  if ("serviceWorker" in navigator) {
    let registration;

    try {
      registration = await navigator.serviceWorker.register("/sw.js");
      console.log("C: Registered", { registration });
    } catch (error) {
      console.error("C: sw registration failed", { error });
      return;
    }

    const serviceWorker =
      registration.installing ?? registration.waiting ?? registration.active ?? null;

    if (!serviceWorker) {
      console.error("no service worker found, no idea why...");
      return;
    }

    if (serviceWorker.state === "activated") {
      serviceWorker.postMessage("Greetings from Client!");
    } else {
      const onActivated = () => {
        if (serviceWorker.state === "activated") {
          serviceWorker.removeEventListener("statechange", onActivated);
          serviceWorker.postMessage("Greetings from Client!");
        }
      };
      serviceWorker.addEventListener("statechange", onActivated);
    }

    navigator.serviceWorker.addEventListener("message", (e) => {
      console.log("C: message received", { data: e.data });
    });

    if (Notification.permission === "granted") {
      try {
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey,
          });
        }

        console.log({ subscription: subscription.toJSON() });
      } catch (error) {
        console.error("C: subscription failed", { error });
      }
    }
  }
}

const showNotification = () => {
  const notification = new Notification("You've been notified!", {
    body: "You should know what to do now.",
    icon: "/warning.png",
  });

  notification.onclick = () => console.log("notification dismissed");
};

main();
