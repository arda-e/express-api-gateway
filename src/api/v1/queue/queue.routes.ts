import { Router } from "express";
import { authRequired } from "@middlewares";
import { container } from "tsyringe";

import QueueController from "./queue.controller";
import { render } from "../../../ui/entry-server";

const router = Router();
const queueController = container.resolve(QueueController);

// All queue routes require authentication

router.use(authRequired);

router.get("/items", queueController.getAllItemsInQueue);
router.post("/requeue", queueController.requeueFromDLQ);
router.get("/dashboard", async (req, res) => {
  const html = await render(req.url);
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Queue Dashboard</title>
        <link rel="stylesheet" href="/public/styles.css">
      </head>
      <body>
        <div id="root">${html}</div>
        <script type="module" src="/static/entry-client.js"></script>
      </body>
    </html>
  `);
});

export default router;
