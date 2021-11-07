const subscribeBtn = document.getElementById("subscribe");
const serverUrl = "http://localhost:9000";

subscribeBtn.addEventListener("click", onToggleSubscription);

let subscribed = false;

async function onToggleSubscription(e) {
  if (subscribed) {
    unsubscribe();
  } else {
    const publicKey = await getServerPublicKey();
    subscribe(publicKey);
  }
}

function toggleSubscription(value) {
  subscribeBtn.disabled = false;
  if (value) {
    subscribeBtn.classList.add("subscribed");
    subscribeBtn.textContent = "Unsubscribe";
  } else {
    subscribeBtn.classList.remove("subscribed");
    subscribeBtn.textContent = "Subscribe";
  }
  subscribed = value;
}

async function initSw() {
  if (navigator.serviceWorker) {
    const registration = await navigator.serviceWorker.register("sw.js");
    const subscription = await registration.pushManager.getSubscription();
    toggleSubscription(!!subscription);
  }
}

async function getServerPublicKey() {
  const response = await fetch(`${serverUrl}/key`);
  return response.text();
}

async function subscribe(applicationServerKey) {
  const registration = await navigator.serviceWorker?.getRegistration();
  if (registration) {
    try {
      const registrationResponse = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      const subscription = registrationResponse.toJSON();

      await fetch(`${serverUrl}/subscribe`, {
        method: "POST",
        body: JSON.stringify(subscription),
      });

      toggleSubscription(true);
    } catch (error) {
      console.error("failed to subscribe to push notifications", { error });
    }
  } else {
    console.error("SW registration not available");
  }
}

async function unsubscribe() {
  const registration = await navigator.serviceWorker?.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
    toggleSubscription(false);
  } else {
    console.error("SW registration not available");
  }
}

initSw();
