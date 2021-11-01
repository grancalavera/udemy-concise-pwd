const webPush = require("web-push");
const vapid = require("../vapid.json");

webPush.setVapidDetails("mailto:arturo.pex@gmail.com", vapid.publicKey, vapid.privateKey);

const pushSubscription = {
  endpoint:
    "https://fcm.googleapis.com/fcm/send/ct4GV2j7tYY:APA91bGYR9w-CSNekcM0cXgWF5tG-HaEAwy-pRa7wBL7q1v9jrtGJf4ERY55mbOwdSlTL2RWKEuvzhN7JW7CX9jJGbNYUerr6_8Pmm7oVd8rMMV88v4QpipZCUrcfM8lHUqejXh8f92q",
  keys: {
    auth: "s-TwW7h-peA8-DZRjl_s4Q",
    p256dh:
      "BEDvT8LGpX_evVkvshAps-Oous9YSQ3oSArzpfhXua2qfHbEtxKwQpDXC4XK7N0caII8xitoXWr7vcR5fHZj_NA",
  },
};

webPush.sendNotification(pushSubscription, process.argv[2]);
