const keys = require("./vapid.json");
const subscriptions = [];
module.exports = {
  publicKey: keys.publicKey,
  addSubscription: (subscription) => {
    subscriptions.push(subscription);
  },
};
