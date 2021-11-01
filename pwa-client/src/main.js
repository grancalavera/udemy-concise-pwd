const vapidPubKey =
  "BKT_4Z28ZqotBg9IuzXD2HunlcZS48CeC1MfJB2DRCyXg7h69Q_SC5E6Ze4FsLdZ3VNiP6JAoXfsMcGoqKmbY1A";

async function main() {
  if ("serviceWorker" in navigator) {
    let registration;

    try {
      registration = await navigator.serviceWorker.register("/sw.js");
      console.log("C: Registered", { registration });
    } catch (error) {
      console.error("C: sw registration failed", { error });
      return;
    }

    try {
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const sJson = subscription.toJSON();
        console.log({ sJson });
      } else {
        // transform the key into an array buffer
        const key = urlb;
        registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: key,
        });
      }
    } catch (error) {
      console.error("C: subscription failed", { error });
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
  }
}

main();
