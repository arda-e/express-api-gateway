/* eslint-disable import/order */
import { EventEmitter } from "events";
import { Server } from "http";
import "reflect-metadata";
import { container } from "tsyringe";
import SessionConfig from "@config/sessionConfig";
import DatabaseManager from "@db/db.manager";
// Mock dependencies and websocket setup
const mockInitializeServerDependencies = jest.fn().mockResolvedValue(undefined);
const mockInitializeAppDependencies = jest.fn();

jest.mock("@config/dependencies", () => ({
  initializeServerDependencies: mockInitializeServerDependencies,
  initializeAppDependencies: mockInitializeAppDependencies,
}));

const mockSetupWebSocket = jest.fn();
jest.mock("@config/websocket", () => ({
  setupWebSocket: mockSetupWebSocket,
}));

// Mock the express app used by the server
const mockServer = Object.assign(new EventEmitter(), {
  close: jest.fn((cb?: (err?: Error) => void) => {
    if (cb) cb();
  }),
}) as unknown as Server;

const mockApp = {
  listen: jest.fn((port: number, cb: () => void) => {
    if (cb) cb();
    return mockServer;
  }),
};

jest.mock("../app", () => ({
  __esModule: true,
  default: mockApp,
}));

import { initializeServerDependencies, initializeAppDependencies } from "@config/dependencies";
import { setupWebSocket } from "@config/websocket";

import { startServer, gracefulShutdown } from "../server";

describe("server startup and shutdown", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    container.clearInstances();
  });

  afterEach(() => {
    process.removeAllListeners("SIGINT");
    process.removeAllListeners("SIGTERM");
    process.removeAllListeners("uncaughtException");
  });

  it("attaches shutdown event listeners on start", async () => {
    const onSpy = jest.spyOn(process, "on");
    const sessionConfig = {} as SessionConfig;
    const databaseManager = {} as DatabaseManager;

    const server = await startServer(sessionConfig, databaseManager);

    expect(server).toBe(mockServer);
    expect(initializeServerDependencies).toHaveBeenCalledWith(sessionConfig, databaseManager);
    expect(initializeAppDependencies).toHaveBeenCalled();
    expect(setupWebSocket).toHaveBeenCalledWith(mockServer);
    expect(onSpy).toHaveBeenCalledWith("SIGINT", expect.any(Function));
    expect(onSpy).toHaveBeenCalledWith("SIGTERM", expect.any(Function));
    expect(onSpy).toHaveBeenCalledWith("uncaughtException", expect.any(Function));

    onSpy.mock.calls.forEach(([event, handler]) =>
      process.removeListener(event as string, handler as (...args: any[]) => void),
    );
  });

  it("closes server and database on gracefulShutdown", async () => {
    const mockDestroy = jest.fn().mockResolvedValue(undefined);
    const mockDbClose = jest.fn().mockResolvedValue(undefined);

    container.registerInstance(SessionConfig, { destroy: mockDestroy } as any);
    container.registerInstance(DatabaseManager, { close: mockDbClose } as any);

    const exitSpy = jest.spyOn(process, "exit").mockImplementation((() => undefined) as any);

    await gracefulShutdown(mockServer);

    expect(mockServer.close).toHaveBeenCalled();
    expect(mockDestroy).toHaveBeenCalled();
    expect(mockDbClose).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(0);

    exitSpy.mockRestore();
  });
});
