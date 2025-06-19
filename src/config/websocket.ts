import { WebSocketServer } from "ws";
import { Server } from "http";
import LoggerFactory from "@utils/Logger";

export const setupWebSocket = (server: Server): void => {
  const logger = LoggerFactory.getLogger();
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    logger.info("WebSocket client connected");

    ws.send(JSON.stringify({ message: "👋 Hello from WebSocket server" }));

    const interval = setInterval(() => {
      ws.send(JSON.stringify({ message: "💓 keep-alive" }));
    }, 5000);

    const interval2 = setInterval(() => {
      ws.send(JSON.stringify({ type: "refresh", message: "sample refresh" }));
    }, 3000);

    ws.on("close", () => {
      logger.info("Client disconnected");
      clearInterval(interval);
      clearInterval(interval2);
    });
  });
};
