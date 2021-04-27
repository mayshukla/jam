import { Application, Router, send } from "https://deno.land/x/oak@v7.3.0/mod.ts";
import { WebSocket } from "https://deno.land/std@0.95.0/ws/mod.ts";

import { SERVER_URL } from "./frontend/js/common/config.js";

async function handleSocket(sock: WebSocket) {
  for await (const ev of sock) {
    if (typeof ev === 'string') {
      console.log("got message from client:", ev);
      await sock.send("hi from server");
    }
  }
}

const router = new Router();
router
   // https://github.com/oakserver/oak/pull/137
  .get("/ws", async (context) => {
    const sock = await context.upgrade();
    handleSocket(sock);
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

await app.listen(SERVER_URL);
