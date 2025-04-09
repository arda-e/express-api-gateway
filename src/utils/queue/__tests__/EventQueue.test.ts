import "reflect-metadata";
import { RedisManager } from "@utils/RedisManager";

import { EventType } from "../EventTypes";
import { EventQueue } from "../EventQueue";

jest.mock("@utils/RedisManager");
jest.mock("bullmq", () => {
  const mQueue = {
    add: jest.fn(),
    getJob: jest.fn(),
    getJobs: jest.fn(),
    remove: jest.fn(),
    getWaitingCount: jest.fn().mockResolvedValue(0),
    getActiveCount: jest.fn().mockResolvedValue(0),
    getCompletedCount: jest.fn().mockResolvedValue(0),
    getFailedCount: jest.fn().mockResolvedValue(0),
    getDelayedCount: jest.fn().mockResolvedValue(0),
  };

  return {
    Queue: jest.fn(() => mQueue),
    Worker: jest.fn(),
    Job: jest.fn(),
  };
});

describe("EventQueue", () => {
  const mockAddJob = jest.fn();
  const queue = new EventQueue({ getRedisClient: () => ({}) } as unknown as RedisManager);
  queue.addJob = mockAddJob as any;

  it("adds a job with correct type and payload", async () => {
    await queue.addEvent(EventType.UserRegistered, {
      userId: "123",
      email: "user@example.com",
    });

    expect(mockAddJob).toHaveBeenCalledWith(
      EventType.UserRegistered,
      expect.objectContaining({ userId: "123" }),
      expect.objectContaining({ attempts: 3 }),
    );
  });
});
