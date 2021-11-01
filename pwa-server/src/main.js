const webPush = require("web-push");
const vapid = require("../vapid.json");

webPush.setVapidDetails("mailto:arturo.pex@gmail.com", vapid.publicKey, vapid.privateKey);

const pushSubscription = {
  endpoint:
    "https://fcm.googleapis.com/fcm/send/f4Oh3ceoe2U:APA91bF4EpIzaLh86SMWQqTHowzboH8rPkGdQZ3j4m2ObLdWqWxM4F9kJciRwFWRaZg9m7jZ6BxzPtUIiA4fabxWUCngBPm4KEu9SIiLivbme7wXEGsH8xCVnV_FFQDUiqiff58niY3B",
  keys: {
    auth: "Uzozp71osN4L22c5ceG5Aw",
    p256dh:
      "BNLGgoNEEPW4Dwa-bvlZJsT2QLO4juSCYs1awNiq0tJuk2e8a2DcZ7HBZfOrJ5f0UtaLcWirKLBRYmnUiV5tTKI",
  },
};

webPush.sendNotification(pushSubscription, process.argv[2]);
