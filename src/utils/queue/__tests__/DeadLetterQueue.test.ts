import "reflect-metadata";
import { RedisManager } from "@utils/RedisManager";

import { DeadLetterType } from "../DeadLetterEventTypes";
import { DeadLetterQueue } from "../DeadLetterQueue";

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

describe("DeadLetterQueue", () => {
  const queue = new DeadLetterQueue({ getRedisClient: () => ({}) } as unknown as RedisManager);
  const mockAddJob = jest.fn();
  queue.addJob = mockAddJob as any;

  it("adds a failed job to the DLQ", async () => {
    await queue.pushFailedJob(
      "UserRegistered",
      { email: "fail@example.com" },
      "SMTP fail",
      "job-id-1",
    );

    expect(mockAddJob).toHaveBeenCalledWith(
      DeadLetterType.FromEventQueue,
      expect.objectContaining({
        reason: "SMTP fail",
        originalJobId: "job-id-1",
      }),
    );
  });
});
