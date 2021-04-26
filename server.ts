import { Application, Router, send } from "https://deno.land/x/oak@v7.3.0/mod.ts";

import { SERVER_URL } from "./common/config.js";

const router = new Router();
router
  .get("/", async (context) => {
    await send(context, context.request.url.pathname, {
      root: `${Deno.cwd()}/frontend`,
      index: "index.html",
    });
  });

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen(SERVER_URL);
