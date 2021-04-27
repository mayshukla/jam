import { Application, Router, send } from "https://deno.land/x/oak@v7.3.0/mod.ts";

import { SERVER_URL } from "./frontend/js/common/config.js";

const app = new Application();

app.use(async (context) => {
    await send(context, context.request.url.pathname, {
      root: `${Deno.cwd()}/frontend`,
      index: "index.html",
    });
});

await app.listen(SERVER_URL);
