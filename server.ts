import { Application, Router, send } from "https://deno.land/x/oak@v7.3.0/mod.ts";
import { WebSocket } from "https://deno.land/std@0.95.0/ws/mod.ts";

import { SERVER_URL } from "./frontend/js/common/config.js";
import SocketHandler from "./SocketHandler.ts";

const socketHandler = new SocketHandler();

const router = new Router();
router
   // https://github.com/oakserver/oak/pull/137
  .get("/ws", async (context) => {
    const sock = await context.upgrade();
    await socketHandler.handleSocket(sock);
  });

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());
app.use(async (context) => {
    await send(context, context.request.url.pathname, {
      root: `${Deno.cwd()}/frontend`,
      index: "index.html",
    });
});

app.addEventListener("listen", ({ hostname, port, secure }) => {
  console.log(
    `Listening on: ${secure ? "https://" : "http://"}${hostname ??
      "localhost"}:${port}`,
  );
});

await app.listen(SERVER_URL);
