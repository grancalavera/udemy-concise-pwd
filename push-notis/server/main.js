const http = require("http");
const push = require("./push");

http
  .createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");

    const { method, url } = req;

    // Subscribe
    if (method === "POST" && url.match(/^\/subscribe\/?/)) {
      const body = [];
      req
        .on("data", (chunk) => body.push(chunk))
        .on("end", () => {
          const subscription = JSON.parse(body.toString());
          console.log({ subscription });
          res.end("subscription done");
        });
    }

    // Push
    else if (method === "POST" && url.match(/^\/push\/?/)) {
      const body = [];
      req.on("data", (chunk) => body.push(chunk)).on("end", () => res.end("push done"));
      // Get Keys
    } else if (method === "GET" && url.match(/^\/key\/?/)) {
      res.end(push.publicKey);

      // Etc...
    } else {
      res.statusCode = 404;
      res.end("not found");
    }
  })
  .listen(9000, () => {
    console.log("🖥 server is up in 9000");
  });
