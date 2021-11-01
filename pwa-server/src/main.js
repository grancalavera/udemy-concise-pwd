const webPush = require("web-push");
const vapid = require("../vapid.json");

webPush.setVapidDetails("mailto:arturo.pex@gmail.com", vapid.publicKey, vapid.privateKey);

const pushSubscription = {
  endpoint: "",
  keys: {
    auth: "",
    p256dh: "",
  },
};

webPush.sendNotification(pushSubscription, process.argv[2]);
