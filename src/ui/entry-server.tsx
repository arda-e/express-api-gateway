import React from "react";
import { renderToString } from "react-dom/server";
import App from "./App";

export async function render(url: string) {
  let initialData: any = {};
  if (url.startsWith("/admin")) {
    try {
      const base = `http://localhost:${process.env.PORT || 8000}`;
      const [q, u, r, p] = await Promise.all([
        fetch(`${base}/api/v1/queue/items`, { credentials: "include" }),
        fetch(`${base}/api/v1/admin/users`, { credentials: "include" }),
        fetch(`${base}/api/v1/admin/roles`, { credentials: "include" }),
        fetch(`${base}/api/v1/admin/permissions`, { credentials: "include" }),
      ]);
      const [queueItems, users, roles, permissions] = await Promise.all([
        q.json(),
        u.json(),
        r.json(),
        p.json(),
      ]);
      initialData = { queueItems, users, roles, permissions };
    } catch (err) {
      console.error("failed to fetch initial data", err);
    }
  }

  const html = renderToString(
    <App initialData={initialData} path={url} />,
  );
  const script = `<script>window.__INITIAL_DATA__ = ${JSON.stringify(initialData)}</script>`;
  return url.startsWith("/admin") ? `${html}${script}` : html;
}
