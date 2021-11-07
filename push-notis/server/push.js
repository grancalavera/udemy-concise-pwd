const keys = require("./vapid.json");
const Storage = require("node-storage");
const webPush = require("web-push");

const store = new Storage(`${__dirname}/db.json`);
const getSubscriptions = () => {
  const result = store.get("subscriptions") ?? [];
  return result;
};
const setSubscriptions = (x) => store.put("subscriptions", x);

webPush.setVapidDetails("mailto:foo@example.com", keys.publicKey, keys.privateKey);

module.exports = {
  publicKey: keys.publicKey,
  addSubscription: (x) => setSubscriptions([...getSubscriptions(), x]),
  send: async (message) => {
    const subscribedSubscriptions = await Promise.all(
      await getSubscriptions().reduce(async (subscribed, subscription) => {
        try {
          await webPush.sendNotification(subscription, message);
          subscribed.push(subscription);
          return subscribed;
        } catch {
          return subscribed;
        }
      }, [])
    );
    setSubscriptions(subscribedSubscriptions);
  },
};
